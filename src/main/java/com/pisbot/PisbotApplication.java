package com.pisbot;

import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.data.message.ImageContent;
import dev.langchain4j.data.message.TextContent;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.chat.request.ChatRequest;
import dev.langchain4j.model.openai.OpenAiChatModel;
import dev.langchain4j.model.openai.internal.chat.Content;
import dev.langchain4j.service.AiServices;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import static dev.langchain4j.model.openai.OpenAiChatModelName.GPT_4_O_MINI;

public class PisbotApplication {

    public static void main(String[] args) {
        ChatModel model = OpenAiChatModel.builder()
                .baseUrl("http://langchain4j.dev/demo/openai/v1")
                .apiKey("demo")
                .modelName(GPT_4_O_MINI)
                .build();
        var assistant = AiServices.builder(Assistant.class)
                .chatModel(model)
                .tools(new Tools())
                .build();
        var chat2 = assistant.chat("What is 1+2 and 3*4?");

        System.out.println(chat2);
    }

}
