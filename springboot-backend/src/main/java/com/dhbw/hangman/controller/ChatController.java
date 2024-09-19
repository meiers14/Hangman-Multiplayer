package com.dhbw.hangman.controller;

import com.dhbw.hangman.model.ChatMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Handles incoming chat messages and sends them to the appropriate chat topic.
     *
     * @param message The {@link ChatMessage} payload containing the message details.
     */
    @MessageMapping("/send")
    public void sendMessage(@Payload ChatMessage message) {
        System.out.println("Sending message: " + message.getUsername() + " - " + message.getMessage());
        String destination = "/topic/chat/" + message.getLobbyCode();
        messagingTemplate.convertAndSend(destination, message);
    }

}
