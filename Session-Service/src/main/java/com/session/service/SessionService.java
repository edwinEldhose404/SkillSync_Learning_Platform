package com.session.service;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.session.bean.Session;
import com.session.dao.SessionDAO;
import com.session.event.SessionEvent;
import com.session.event.SessionEventPublisher;

@Service
public class SessionService {
	
	@Autowired
	SessionDAO dao;
	
	@Autowired
    SessionEventPublisher publisher;
	
	public Session requestSessionService(int mentor_id,int learner_id, Date session_date) {
		
		SessionEvent event = new SessionEvent();
	    event.setEventType("REQUESTED");
	    event.setSessionId(1L);

	    publisher.publish(event);
		
		return dao.requestSession(mentor_id, learner_id, session_date);
	}
	
	public Session acceptSessionService(int id) {
		
		SessionEvent event = new SessionEvent();
	    event.setEventType("ACCEPTED");
	    event.setSessionId(1L);

	    publisher.publish(event);
	    
		return dao.acceptSession(id);
	}
	
	public Session rejectSessionService(int id) {
		
		SessionEvent event = new SessionEvent();
	    event.setEventType("REJECTED");
	    event.setSessionId(1L);

	    publisher.publish(event);
		
		return dao.rejectSession(id);
	}
	
	public Session cancelSessionService(int id) {
		
		SessionEvent event = new SessionEvent();
	    event.setEventType("CANCELLED");
	    event.setSessionId(1L);

	    publisher.publish(event);
		
		return dao.cancelSession(id);
	}
}
