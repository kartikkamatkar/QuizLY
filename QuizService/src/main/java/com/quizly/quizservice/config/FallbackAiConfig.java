package com.quizly.quizservice.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.metadata.ChatResponseMetadata;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.model.Generation;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.lang.reflect.Proxy;
import java.util.List;
import java.util.Map;

@Configuration
public class FallbackAiConfig {

    private static final Logger log = LoggerFactory.getLogger(FallbackAiConfig.class);

    @Bean
    @Primary
    @ConditionalOnProperty(name = "ai.mock.chat", havingValue = "true", matchIfMissing = true)
    public ChatModel chatModel() {
        log.warn("Initializing Mock ChatModel Proxy in QuizService to bypass external OpenAI connections.");
        return (ChatModel) Proxy.newProxyInstance(
            ChatModel.class.getClassLoader(),
            new Class<?>[] { ChatModel.class },
            (proxy, method, args) -> {
                if ("call".equals(method.getName())) {
                    String promptText = "";
                    if (args.length > 0 && args[0] != null) {
                        promptText = args[0].toString();
                    }
                    String mockResult = generateMockResponse(promptText);
                    return createMockChatResponse(mockResult);
                }
                return null;
            }
        );
    }

    @Bean
    @Primary
    @ConditionalOnProperty(name = "ai.mock.vectorstore", havingValue = "true", matchIfMissing = true)
    public VectorStore vectorStore() {
        log.warn("Initializing Mock VectorStore Proxy in QuizService to bypass external Qdrant database connections.");
        return (VectorStore) Proxy.newProxyInstance(
            VectorStore.class.getClassLoader(),
            new Class<?>[] { VectorStore.class },
            (proxy, method, args) -> {
                if ("similaritySearch".equals(method.getName())) {
                    return List.of(new Document("Mock PDF Section context from RAG indexing.", Map.of("source", "pdf")));
                }
                return null;
            }
        );
    }

    private static Object createMockChatResponse(String text) {
        return Proxy.newProxyInstance(
            ChatResponse.class.getClassLoader(),
            new Class<?>[] { ChatResponse.class },
            (proxy, method, args) -> {
                if ("getResult".equals(method.getName())) {
                    return createMockGeneration(text);
                }
                if ("getResults".equals(method.getName())) {
                    return List.of(createMockGeneration(text));
                }
                if ("getMetadata".equals(method.getName())) {
                    return ChatResponseMetadata.empty();
                }
                return null;
            }
        );
    }

    private static Object createMockGeneration(String text) {
        return Proxy.newProxyInstance(
            Generation.class.getClassLoader(),
            new Class<?>[] { Generation.class },
            (proxy, method, args) -> {
                if ("getOutput".equals(method.getName())) {
                    return new AssistantMessage(text);
                }
                return null;
            }
        );
    }

    private static String generateMockResponse(String prompt) {
        if (prompt.contains("JSON") || prompt.contains("array") || prompt.contains("question")) {
            return """
            [
              {
                "question": "What is Spring Cloud Config Server used for?",
                "optionA": "Service Discovery",
                "optionB": "Centralized configuration management",
                "optionC": "Load balancing",
                "optionD": "Distributed tracing",
                "correctAnswer": "Centralized configuration management",
                "topic": "Spring Cloud Config"
              },
              {
                "question": "Which annotation enables service registration in Eureka?",
                "optionA": "@EnableEurekaServer",
                "optionB": "@EnableDiscoveryClient",
                "optionC": "@EnableConfigServer",
                "optionD": "@EnableCircuitBreaker",
                "correctAnswer": "@EnableDiscoveryClient",
                "topic": "Eureka Discovery"
              }
            ]
            """;
        }
        
        if (prompt.contains("Explain") || prompt.contains("explain") || prompt.contains("explanation")) {
            return "AI Explanation (Mock): The correct answer is selected based on standard Spring Boot microservices patterns. Spring Cloud Config handles centralized Git settings, Eureka provides registry service locations, and API Gateway acts as the reverse proxy.";
        }

        return "AI Response (Mock): This is a local mock response since the active OpenAI connection is disabled. Register a real API key to connect to the cloud model.";
    }
}
