package com.notification.listener;

import com.notification.event.SessionEvent;
import com.notification.service.NotificationService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class NotificationListener {

    private final NotificationService notificationService;

    public NotificationListener(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @RabbitListener(queues = "notification.queue")
    public void consume(SessionEvent event) {
        notificationService.handle(event);
    }
}