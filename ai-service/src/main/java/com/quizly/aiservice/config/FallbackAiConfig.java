package com.quizly.aiservice.config;

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
        log.warn("Initializing Mock ChatModel Proxy to bypass external OpenAI connections.");
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
        log.warn("Initializing Mock VectorStore Proxy to bypass external Qdrant database connections.");
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

    private static ChatResponse createMockChatResponse(String text) {
        AssistantMessage assistantMessage = new AssistantMessage(text);
        Generation generation = new Generation(assistantMessage);
        return new ChatResponse(List.of(generation));
    }

    private static String generateMockResponse(String prompt) {
        if (prompt.contains("JSON") || prompt.contains("array") || prompt.contains("question")) {
            int count = 5;
            java.util.regex.Pattern countPattern = java.util.regex.Pattern.compile("Generate (\\d+) quiz questions");
            java.util.regex.Matcher countMatcher = countPattern.matcher(prompt);
            if (countMatcher.find()) {
                count = Integer.parseInt(countMatcher.group(1));
            }

            String topic = "General Architecture";
            java.util.regex.Pattern topicPattern = java.util.regex.Pattern.compile("about the topic '([^']+)'");
            java.util.regex.Matcher topicMatcher = topicPattern.matcher(prompt);
            if (topicMatcher.find()) {
                topic = topicMatcher.group(1);
            }

            String category = "JAVA";
            java.util.regex.Pattern categoryPattern = java.util.regex.Pattern.compile("in the category '([^']+)'");
            java.util.regex.Matcher categoryMatcher = categoryPattern.matcher(prompt);
            if (categoryMatcher.find()) {
                category = categoryMatcher.group(1);
            }

            String difficulty = "MEDIUM";
            java.util.regex.Pattern diffPattern = java.util.regex.Pattern.compile("at a '([^']+)' difficulty");
            java.util.regex.Matcher diffMatcher = diffPattern.matcher(prompt);
            if (diffMatcher.find()) {
                difficulty = diffMatcher.group(1);
            }

            StringBuilder sb = new StringBuilder();
            sb.append("[\n");
            for (int i = 1; i <= count; i++) {
                sb.append("  {\n");
                sb.append(String.format("    \"question\": \"What is a key concept of %s in %s (Question %d)?\",\n", topic, category, i));
                sb.append(String.format("    \"optionA\": \"It handles core settings for %s\",\n", topic));
                sb.append(String.format("    \"optionB\": \"It acts as an alternative to %s\",\n", category));
                sb.append(String.format("    \"optionC\": \"It represents a %s difficulty challenge\",\n", difficulty));
                sb.append("    \"optionD\": \"None of the above\",\n");
                sb.append("    \"correctAnswer\": \"optionA\",\n");
                sb.append(String.format("    \"topic\": \"%s\"\n", topic));
                sb.append("  }");
                if (i < count) {
                    sb.append(",");
                }
                sb.append("\n");
            }
            sb.append("]");
            return sb.toString();
        }

        if (prompt.contains("Explain why the correct answer to the question")) {
            String question = "the question";
            java.util.regex.Pattern qPattern = java.util.regex.Pattern.compile("question '([^']+)' is");
            java.util.regex.Matcher qMatcher = qPattern.matcher(prompt);
            if (qMatcher.find()) {
                question = qMatcher.group(1);
            }
            
            String correct = "the correct option";
            java.util.regex.Pattern cPattern = java.util.regex.Pattern.compile("is '([^']+)'");
            java.util.regex.Matcher cMatcher = cPattern.matcher(prompt);
            if (cMatcher.find()) {
                correct = cMatcher.group(1);
            }

            return String.format("""
            AI Explanation (Mock):
            For the question: "%s", the correct choice is indeed %s.
            This option represents the accurate design pattern or specification because it satisfies the technical constraints, ensures proper resource cleanup, and matches the standard framework behavior.
            """, question, correct);
        }

        if (prompt.contains("Explain") || prompt.contains("explain") || prompt.contains("explanation")) {
            return "AI Explanation (Mock): The correct answer is selected based on standard Spring Boot microservices patterns. Spring Cloud Config handles centralized Git settings, Eureka provides registry service locations, and API Gateway acts as the reverse proxy for authorization headers.";
        }

        if (prompt.contains("student") || prompt.contains("weak") || prompt.contains("recommendation")) {
            String weakTopics = "your weak areas";
            java.util.regex.Pattern topicsPattern = java.util.regex.Pattern.compile("dropped \\(below 65%\\) on these specific topics: ([^\\.]+)\\.");
            java.util.regex.Matcher topicsMatcher = topicsPattern.matcher(prompt);
            if (topicsMatcher.find()) {
                weakTopics = topicsMatcher.group(1);
            }
            return String.format("""
            AI Coach Recommendation (Mock):
            1. Review the core specifications of %s to clarify fundamental architectures.
            2. Build a local sandbox application specifically focusing on %s and experiment with boundary conditions.
            3. Stay persistent! Regular practice on %s will build strong muscle memory and improve your placement assessment score.
            """, weakTopics, weakTopics, weakTopics);
        }

        if (prompt.contains("learning-path") || prompt.contains("timeline") || prompt.contains("roadmap") || prompt.contains("curriculum")) {
            String topicInterest = "Programming";
            java.util.regex.Pattern pathPattern = java.util.regex.Pattern.compile("curriculum for learning '([^']+)'");
            java.util.regex.Matcher pathMatcher = pathPattern.matcher(prompt);
            if (pathMatcher.find()) {
                topicInterest = pathMatcher.group(1);
            }
            return String.format("""
            # 4-Week Learning Path: %s
            
            ## Week 1: Introduction to %s
            - **Concepts**: Core principles, setup, basic syntax or foundations of %s.
            - **Goal**: Write a simple hello-world or config file.
            - **Review**: What is the primary purpose of %s?
            
            ## Week 2: Intermediate %s Concepts
            - **Concepts**: State management, structural patterns, integration with other modules.
            - **Goal**: Build a mini-application using intermediate features.
            - **Review**: How does data flow in %s?
            
            ## Week 3: Advanced %s Design
            - **Concepts**: Performance tuning, clustering or scaling, advanced configuration parameters.
            - **Goal**: Implement fallback handlers, load testing, or optimization schemes.
            - **Review**: Explain the edge cases in scaling %s.
            
            ## Week 4: Real-world Implementation & Capstone
            - **Concepts**: Deployment strategies, security controls, monitoring metrics.
            - **Goal**: Deploy a secure, production-ready %s service.
            - **Review**: What are the security best practices for %s?
            """, topicInterest, topicInterest, topicInterest, topicInterest, topicInterest, topicInterest, topicInterest, topicInterest, topicInterest, topicInterest, topicInterest, topicInterest);
        }

        if (prompt.contains("Question:")) {
            String question = "";
            int qIndex = prompt.indexOf("Question:");
            if (qIndex != -1) {
                question = prompt.substring(qIndex + 9).trim();
                int suffixIndex = question.indexOf("Provide a structured");
                if (suffixIndex != -1) {
                    question = question.substring(0, suffixIndex).trim();
                }
            }
            return "AI Learning Assistant (Mock Response):\nHere is an explanation regarding your query: '" + question + "'.\n" +
                   "For the topic of study, ensure that you understand the core concepts. In a production environment, this is solved by analyzing system state, checking active threads, and verifying database connections.";
        }

        return "AI Response (Mock): This is a local mock response since the active OpenAI connection is disabled. Register a real API key to connect to the cloud model.";
    }
}