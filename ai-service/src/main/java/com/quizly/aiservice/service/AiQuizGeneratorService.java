package com.quizly.aiservice.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.quizly.aiservice.dto.QuestionDto;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class AiQuizGeneratorService {

    private final ChatModel chatModel;
    private final ObjectMapper objectMapper;
    private final VectorStoreService vectorStoreService;

    public AiQuizGeneratorService(ChatModel chatModel, ObjectMapper objectMapper, VectorStoreService vectorStoreService) {
        this.chatModel = chatModel;
        this.objectMapper = objectMapper;
        this.vectorStoreService = vectorStoreService;
    }

    // Generate questions on a general topic
    public List<QuestionDto> generateQuiz(String topic, String category, String difficulty, int count) {
        String promptText = """
                You are an expert quiz question generator.
                Generate %d quiz questions about the topic '%s' in the category '%s' at a '%s' difficulty.
                Format the response as a JSON array where each object has these exact keys:
                - question (the question text)
                - optionA (first option)
                - optionB (second option)
                - optionC (third option)
                - optionD (fourth option)
                - correctAnswer (MUST be either optionA, optionB, optionC, or optionD)
                - topic (topic name)
                
                Do not include markdown tags like ```json in the output. Just return raw JSON.
                """.formatted(count, topic, category, difficulty);

        return callModelAndParse(promptText);
    }

    // Extract text from PDF using PDFBox, index segments to Qdrant, and generate a quiz
    public List<QuestionDto> generateQuizFromPdf(byte[] pdfBytes, String topic, String category, String difficulty, int count) {
        String pdfText = "";
        try (PDDocument document = Loader.loadPDF(pdfBytes)) {
            PDFTextStripper stripper = new PDFTextStripper();
            pdfText = stripper.getText(document);
        } catch (Exception e) {
            throw new RuntimeException("Failed to extract text from PDF: " + e.getMessage(), e);
        }

        if (pdfText.trim().isEmpty()) {
            throw new RuntimeException("Extracted PDF content is empty!");
        }

        // Segment text and index to Qdrant Vector DB for RAG memory
        try {
            String cleanText = pdfText.substring(0, Math.min(pdfText.length(), 4000)); // Limit size
            vectorStoreService.indexText(cleanText, Map.of(
                "source", "pdf-upload",
                "topic", topic,
                "category", category
            ));
        } catch (Exception ve) {
            System.err.println("Could not index PDF text segments to Vector Store: " + ve.getMessage());
        }

        // Prompt LLM to read the context and output questions
        String promptText = """
                You are an expert quiz question generator.
                Use the following source text parsed from a study document:
                ---
                %s
                ---
                Generate %d quiz questions about the topic '%s' in the category '%s' at a '%s' difficulty, based on the content above.
                Format the response as a JSON array where each object has these exact keys:
                - question (the question text)
                - optionA (first option)
                - optionB (second option)
                - optionC (third option)
                - optionD (fourth option)
                - correctAnswer (MUST be either optionA, optionB, optionC, or optionD)
                - topic (topic name)
                
                Do not include markdown tags like ```json in the output. Just return raw JSON.
                """.formatted(pdfText.substring(0, Math.min(pdfText.length(), 6000)), count, topic, category, difficulty);

        return callModelAndParse(promptText);
    }

    // Evaluate difficulty of a question using LLM reasoning
    public String evaluateDifficulty(String question, String options) {
        String promptText = """
                Analyze the following quiz question and options, and evaluate its difficulty.
                Question: "%s"
                Options: %s
                Output only one word: either EASY, MEDIUM, or HARD.
                """.formatted(question, options);

        Prompt prompt = new Prompt(promptText);
        return chatModel.call(prompt).getResult().getOutput().getText().trim().toUpperCase();
    }

    private List<QuestionDto> callModelAndParse(String promptText) {
        Prompt prompt = new Prompt(promptText);
        String response = chatModel.call(prompt).getResult().getOutput().getText();

        try {
            int startIndex = response.indexOf("[");
            int endIndex = response.lastIndexOf("]");
            if (startIndex != -1 && endIndex != -1 && endIndex > startIndex) {
                response = response.substring(startIndex, endIndex + 1);
            }
            List<Map<String, Object>> rawList = objectMapper.readValue(response, new TypeReference<List<Map<String, Object>>>() {});
            return rawList.stream().map(map -> {
                QuestionDto dto = new QuestionDto();
                dto.setQuestion((String) map.get("question"));
                dto.setOptionA((String) map.get("optionA"));
                dto.setOptionB((String) map.get("optionB"));
                dto.setOptionC((String) map.get("optionC"));
                dto.setOptionD((String) map.get("optionD"));
                dto.setCorrectAnswer((String) map.get("correctAnswer"));
                dto.setTopic((String) map.get("topic"));
                return dto;
            }).toList();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate and parse questions using Spring AI: " + e.getMessage(), e);
        }
    }
}
