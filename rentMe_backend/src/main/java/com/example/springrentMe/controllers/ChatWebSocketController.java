package com.example.springrentMe.controllers;

import com.example.springrentMe.DTOs.ChatMessageResponseDTO;
import com.example.springrentMe.DTOs.SendMessageRequestDTO;
import com.example.springrentMe.services.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class ChatWebSocketController {

    @Autowired
    private ChatService chatService;

    @MessageMapping("/chat.send.{sessionId}")
    @SendToUser("/queue/messages")
    public ChatMessageResponseDTO handleMessage(
            @DestinationVariable Long sessionId,
            @Payload SendMessageRequestDTO req,
            Principal principal) {
        
        if (principal instanceof UsernamePasswordAuthenticationToken auth) {
            // Propagate the websocket principal to SecurityContextHolder for service-layer authorization checks
            SecurityContextHolder.getContext().setAuthentication(auth);
        } else {
            throw new org.springframework.messaging.MessageDeliveryException("Unauthorized: Missing or invalid principal");
        }
        
        try {
            // chatService.sendMessage persists the message and broadcasts it to `/topic/session.{sessionId}`
            return chatService.sendMessage(sessionId, req);
        } finally {
            SecurityContextHolder.clearContext();
        }
    }
}
