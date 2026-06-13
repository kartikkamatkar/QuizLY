package com.quizly.quizservice.service;

import com.quizly.quizservice.entity.Question;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class VectorSearchService {

    private final VectorStore vectorStore;

    public VectorSearchService(VectorStore vectorStore) {
        this.vectorStore = vectorStore;
    }

    // Index a question text and metadata into the vector database
    public void addQuestion(Question question) {
        Document doc = new Document(
                question.getQuestion(),
                Map.of(
                        "questionId", question.getId(),
                        "topic", question.getTopic() != null ? question.getTopic() : "",
                        "category", question.getCategory() != null ? question.getCategory().name() : "",
                        "difficulty", question.getDifficulty() != null ? question.getDifficulty().name() : ""
                )
        );
        vectorStore.add(List.of(doc));
    }

    // Perform semantic similarity search across questions
    public List<Document> searchQuestions(String query, int limit) {
        return vectorStore.similaritySearch(
                SearchRequest.builder()
                        .query(query)
                        .topK(limit)
                        .build()
        );
    }
}
