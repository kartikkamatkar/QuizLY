package com.quizly.aiservice.service;

import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.document.Document;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AiLearningAssistantService {

    private final ChatModel chatModel;
    private final VectorStoreService vectorStoreService;

    public AiLearningAssistantService(ChatModel chatModel, VectorStoreService vectorStoreService) {
        this.chatModel = chatModel;
        this.vectorStoreService = vectorStoreService;
    }

    // RAG-augmented chatbot chat session
    public String askAssistant(Long userId, String message) {
        // Step A: Similarity search in Vector DB (Qdrant) for context mapping
        List<Document> similarDocs = vectorStoreService.findSimilar(message, 3);
        String contextText = similarDocs.stream()
                .map(Document::getContent)
                .collect(Collectors.joining("\n---\n"));

        // Step B: Build RAG Prompt
        String promptText = """
                You are QuizLY's expert learning assistant.
                Use the following context parsed from the user's study materials to answer the question:
                ===
                %s
                ===
                
                Question: %s
                
                Provide a structured, helpful, and technically accurate explanation. If the context does not contain the answer, use your general knowledge but mention it is supplementary.
                """.formatted(contextText, message);

        Prompt prompt = new Prompt(promptText);
        return chatModel.call(prompt).getResult().getOutput().getContent();
    }

    // Generate a structured learning timeline based on topic interest
    public String generateLearningPath(Long userId, String topicInterest) {
        String promptText = """
                Generate a structured, 4-week learning path curriculum for learning '%s'.
                For each week, define:
                - Week Title
                - Primary concepts to learn
                - Suggested mini-project or practice goal
                - Suggested review questions
                
                Return it in a clean markdown format suitable for display in a student dashboard.
                """.formatted(topicInterest);

        Prompt prompt = new Prompt(promptText);
        return chatModel.call(prompt).getResult().getOutput().getContent();
    }
}
