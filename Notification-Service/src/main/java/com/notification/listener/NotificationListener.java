package com.notification.listener;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import com.notification.event.SessionEvent;
import com.notification.exception.EventProcessingException;
import com.notification.service.NotificationService;

/**
 * Notification Listener
 * Consumes session events from RabbitMQ and processes them
 */
@Component
public class NotificationListener {
    
    private static final Logger logger = LoggerFactory.getLogger(NotificationListener.class);
    private final NotificationService notificationService;

    public NotificationListener(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /**
     * Consume and process session events from notification queue
     * 
     * @param event the SessionEvent to process
     * @throws EventProcessingException if event processing fails
     */
    @RabbitListener(queues = "notification.queue")
    public void consume(SessionEvent event) {
        try {
            if (event == null) {
                logger.error("Received null event from queue");
                throw new EventProcessingException("Received null event from message queue");
            }
            
            logger.debug("Processing event: {} for session ID: {}", 
                    event.getEventType(), event.getSessionId());
            
            notificationService.handle(event);
            
            logger.info("Successfully processed event: {} for session ID: {}", 
                    event.getEventType(), event.getSessionId());
            
        } catch (EventProcessingException e) {
            logger.error("Failed to process event from queue: {}", e.getMessage(), e);
            // Re-throw to trigger DLQ if configured
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error while consuming event: {}", e.getMessage(), e);
            throw new EventProcessingException("Error consuming event from queue: " + e.getMessage(), e);
        }
    }
}