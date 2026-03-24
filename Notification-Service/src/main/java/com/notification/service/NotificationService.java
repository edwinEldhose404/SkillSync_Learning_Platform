package com.notification.service;

import com.notification.event.SessionEvent;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    public void handle(SessionEvent event) {

        String type = event.getEventType();

        if ("REQUESTED".equals(type)) {
            System.out.println("Notification: Session Booked " + event.getSessionId());
        } else if ("ACCEPTED".equals(type)) {
            System.out.println("Notification: Session Accepted " + event.getSessionId());
        } else if ("REMINDER".equals(type)) {
            System.out.println("Notification: Session Reminder " + event.getSessionId());
        } else if ("CANCELLED".equals(type)) {
            System.out.println("Notification: Session Cancelled " + event.getSessionId());
        } else if ("REJECTED".equals(type)) {
            System.out.println("Notification: Session Rejected " + event.getSessionId());
        }
    }
}