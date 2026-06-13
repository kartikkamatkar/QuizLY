package com.quizly.quizservice.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.quizly.quizservice.dto.QuestionRequest;
import com.quizly.quizservice.enums.Category;
import com.quizly.quizservice.enums.Difficulty;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class AiService {

    private final ChatModel chatModel;
    private final ObjectMapper objectMapper;

    public AiService(ChatModel chatModel, ObjectMapper objectMapper) {
        this.chatModel = chatModel;
        this.objectMapper = objectMapper;
    }

    public List<QuestionRequest> generateQuestions(String topic, String category, String difficulty, int count) {
        String systemText = """
                You are an expert quiz question generator.
                Generate %d quiz questions about the topic '%s' in the category '%s' at a '%s' difficulty.
                Format the response as a JSON array where each object has these exact keys:
                - question (the question text)
                - optionA (first option)
                - optionB (second option)
                - optionC (third option)
                - optionD (fourth option)
                - correctAnswer (MUST match the EXACT value of one of the options)
                - topic (topic name)
                
                Do not include markdown tags like ```json in the output. Just return raw JSON.
                """.formatted(count, topic, category, difficulty);

        Prompt prompt = new Prompt(systemText);
        String response = chatModel.call(prompt).getResult().getOutput().getText();

        try {
            // Strip markdown block tags if LLM wraps it
            if (response.contains("```")) {
                response = response.substring(response.indexOf("["));
                response = response.substring(0, response.lastIndexOf("]") + 1);
            }
            List<Map<String, Object>> rawList = objectMapper.readValue(response, new TypeReference<List<Map<String, Object>>>() {});
            return rawList.stream().map(map -> {
                QuestionRequest req = new QuestionRequest();
                req.setQuestion((String) map.get("question"));
                req.setOptionA((String) map.get("optionA"));
                req.setOptionB((String) map.get("optionB"));
                req.setOptionC((String) map.get("optionC"));
                req.setOptionD((String) map.get("optionD"));
                req.setCorrectAnswer((String) map.get("correctAnswer"));
                req.setTopic((String) map.get("topic"));
                req.setCategory(Category.valueOf(category.toUpperCase()));
                req.setDifficulty(Difficulty.valueOf(difficulty.toUpperCase()));
                return req;
            }).toList();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate questions using AI: " + e.getMessage(), e);
        }
    }

    public String explainAnswer(String question, String correctAnswer, String options) {
        String systemText = """
                Explain why the correct answer to the question '%s' is '%s'.
                The options were: %s.
                Provide a clear, brief, and educational explanation suitable for software engineers.
                """.formatted(question, correctAnswer, options);
        Prompt prompt = new Prompt(systemText);
        return chatModel.call(prompt).getResult().getOutput().getText();
    }
}
