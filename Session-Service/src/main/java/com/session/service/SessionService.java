package com.session.service;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.session.bean.Session;
import com.session.dao.SessionDAO;

@Service
public class SessionService {
	
	@Autowired
	SessionDAO dao;
	
	public Session requestSessionService(int mentor_id,int learner_id, Date session_date) {
		return dao.requestSession(mentor_id, learner_id, session_date);
	}
	
	public Session acceptSessionService(int id) {
		return dao.acceptSession(id);
	}
	
	public Session rejectSessionService(int id) {
		return dao.rejectSession(id);
	}
	
	public Session cancelSessionService(int id) {
		return dao.cancelSession(id);
	}
}
