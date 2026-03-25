package com.session.dao;

import java.util.Date;

import org.springframework.stereotype.Repository;

import com.session.bean.Session;
import com.session.exception.SessionNotFoundException;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;

@Repository
@Transactional
public class SessionDAO {
	
	@PersistenceContext
	EntityManager em;
	
	public Session requestSession(int mentor_id, int learner_id, Date session_date) {
		Date current_date = new Date();
		Session session = new Session(mentor_id,learner_id,session_date,"Requested",current_date);
		em.persist(session);
		return session;
	}
	
	public Session acceptSession(int id) {
		Session session = em.find(Session.class, id);
		if (session == null) {
			throw new SessionNotFoundException("Session with id " + id + " not found", id);
		}
		session.setStatus("Accepted");
		session = em.merge(session);
		return session;
	}
	
	public Session rejectSession(int id) {
		Session session = em.find(Session.class, id);
		if (session == null) {
			throw new SessionNotFoundException("Session with id " + id + " not found", id);
		}
		session.setStatus("Rejected");
		session = em.merge(session);
		return session;
	}
	
	public Session cancelSession(int id) {
		Session session = em.find(Session.class, id);
		if (session == null) {
			throw new SessionNotFoundException("Session with id " + id + " not found", id);
		}
		session.setStatus("Cancelled");
		session = em.merge(session);
		return session;
	}
}
