package com.example.springrentMe.security;

import com.example.springrentMe.utils.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.List;

@Component
public class WebSocketAuthChannelInterceptor implements ChannelInterceptor {

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String jwt = extractJwt(accessor);
            
            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
                String username = tokenProvider.getUsernameFromToken(jwt);
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                
                accessor.setUser(authentication);
                // Also set in SecurityContextHolder for security assertions down the line
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } else {
                throw new MessageDeliveryException("Unauthorized: Invalid or missing JWT token");
            }
        }
        return message;
    }

    private String extractJwt(StompHeaderAccessor accessor) {
        // Try Authorization header
        String bearerToken = accessor.getFirstNativeHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }

        // Try Cookie header: e.g., "jwt_token=<token>"
        List<String> cookieHeaders = accessor.getNativeHeader("Cookie");
        if (cookieHeaders == null) {
            cookieHeaders = accessor.getNativeHeader("cookie");
        }
        
        if (cookieHeaders != null) {
            for (String cookieHeader : cookieHeaders) {
                if (StringUtils.hasText(cookieHeader)) {
                    String[] cookies = cookieHeader.split(";");
                    for (String cookie : cookies) {
                        String[] pair = cookie.trim().split("=");
                        if (pair.length == 2 && "jwt_token".equals(pair[0])) {
                            return pair[1];
                        }
                    }
                }
            }
        }
        return null;
    }
}
