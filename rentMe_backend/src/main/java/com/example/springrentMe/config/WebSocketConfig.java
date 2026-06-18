package com.example.springrentMe.config;

import com.example.springrentMe.security.WebSocketAuthChannelInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Autowired
    private WebSocketAuthChannelInterceptor authChannelInterceptor;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Register STOMP endpoint: /ws (with SockJS fallback)
        registry.addEndpoint("/ws")
                .setAllowedOrigins(frontendUrl)
                .withSockJS();
        
        // Also support standard WebSocket without SockJS
        registry.addEndpoint("/ws")
                .setAllowedOrigins(frontendUrl);
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(1);
        scheduler.setThreadNamePrefix("ws-heartbeat-thread-");
        scheduler.initialize();

        // Simple broker topics: /topic (broadcast), /queue (user-specific)
        // Heartbeat: 10s send (10000 ms), 20s receive (20000 ms)
        registry.enableSimpleBroker("/topic", "/queue")
                .setHeartbeatValue(new long[]{10000, 20000})
                .setTaskScheduler(scheduler);
        
        // Application destination prefix: /app
        registry.setApplicationDestinationPrefixes("/app");
        
        // User destination prefix: /user
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(authChannelInterceptor);
    }
}
