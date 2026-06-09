package com.quizly.aiservice.service;

import com.quizly.aiservice.dto.ExplanationRequest;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

@Service
public class AiExplanationService {

    private final ChatModel chatModel;

    public AiExplanationService(ChatModel chatModel) {
        this.chatModel = chatModel;
    }

    // Call LLM to provide detailed answer explanation
    public String explainAnswer(ExplanationRequest request) {
        String promptText = """
                Explain why the correct answer to the question '%s' is '%s'.
                Options:
                A: %s
                B: %s
                C: %s
                D: %s
                
                Provide a clear, brief, and educational explanation suitable for software engineers.
                """.formatted(
                    request.getQuestion(),
                    request.getCorrectAnswer(),
                    request.getOptionA(),
                    request.getOptionB(),
                    request.getOptionC(),
                    request.getOptionD()
                );

        Prompt prompt = new Prompt(promptText);
        return chatModel.call(prompt).getResult().getOutput().getContent();
    }
}
