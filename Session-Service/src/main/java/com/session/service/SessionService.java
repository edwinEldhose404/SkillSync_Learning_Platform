package com.session.service;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.session.bean.Session;
import com.session.bean.SessionDTO;
import com.session.dao.SessionDAO;
import com.session.event.SessionEvent;
import com.session.event.SessionEventPublisher;
import com.session.exception.InvalidSessionException;

@Service
public class SessionService {
	
	@Autowired
	SessionDAO dao;
	
	@Autowired
    SessionEventPublisher publisher;
	
	public Session requestSessionService(int mentor_id, int learner_id, Date session_date) {
		
		if (mentor_id <= 0 || learner_id <= 0) {
			throw new InvalidSessionException("Mentor ID and Learner ID must be valid positive integers");
		}
		
		if (session_date == null || session_date.before(new Date())) {
			throw new InvalidSessionException("Session date cannot be null or in the past");
		}
		
		Session session =  dao.requestSession(mentor_id, learner_id, session_date);
		
		SessionEvent event = new SessionEvent();
	    event.setEventType("REQUESTED");
		event.setSessionId((long)session.getId());

	    publisher.publish(event);
		
		return session;
	}
	
	public Session acceptSessionService(int id) {
		
		if (id <= 0) {
			throw new InvalidSessionException("Session ID must be a valid positive integer");
		}
		
		Session session = dao.acceptSession(id);
		
		SessionEvent event = new SessionEvent();
	    event.setEventType("ACCEPTED");
	    event.setSessionId((long)id);

	    publisher.publish(event);
	    
		return session;
	}
	
	public Session rejectSessionService(int id) {
		
		if (id <= 0) {
			throw new InvalidSessionException("Session ID must be a valid positive integer");
		}
		
		Session session = dao.rejectSession(id);
		
		SessionEvent event = new SessionEvent();
	    event.setEventType("REJECTED");
	    event.setSessionId((long)id);

	    publisher.publish(event);
		
		return session;
	}
	
	public Session cancelSessionService(int id) {
		
		if (id <= 0) {
			throw new InvalidSessionException("Session ID must be a valid positive integer");
		}
		
		Session session = dao.cancelSession(id);
		
		SessionEvent event = new SessionEvent();
	    event.setEventType("CANCELLED");
	    event.setSessionId((long)id);

	    publisher.publish(event);
		
		return session;
	}
}
