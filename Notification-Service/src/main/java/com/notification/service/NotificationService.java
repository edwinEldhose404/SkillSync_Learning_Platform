package com.notification.service;

import com.notification.event.SessionEvent;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    public void handle(SessionEvent event) {

        String type = event.getEventType();

        if ("SESSION_BOOKED".equals(type)) {
            System.out.println("Notification: Session Booked " + event.getSessionId());
        } else if ("SESSION_ACCEPTED".equals(type)) {
            System.out.println("Notification: Session Accepted " + event.getSessionId());
        } else if ("SESSION_REMINDER".equals(type)) {
            System.out.println("Notification: Session Reminder " + event.getSessionId());
        } else if ("MENTOR_APPROVED".equals(type)) {
            System.out.println("Notification: Mentor Approved " + event.getMentorId());
        }
    }
}