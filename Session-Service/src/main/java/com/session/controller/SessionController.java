package com.session.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.session.bean.Session;
import com.session.bean.SessionDTO;
import com.session.service.SessionService;

@RestController
@RequestMapping(path = "session")
public class SessionController {
	
	@Autowired
	SessionService service;
	
	@PostMapping(path = "/requestSession")
	public ResponseEntity<Session> requestionNewSession(@RequestBody SessionDTO dto) {
		Session session = service.requestSessionService(dto.getMentor_id(), dto.getLearner_id(), dto.getSession_Date());
		return ResponseEntity.ok(session);
	}
	
	@PutMapping(path = "/acceptSession/{id}")
	public ResponseEntity<Session> acceptSession(@PathVariable("id")int id) {
		Session session = service.acceptSessionService(id);
		return ResponseEntity.ok(session);
	}
	
	@PutMapping(path = "/rejectSession/{id}")
	public ResponseEntity<Session> rejectSession(@PathVariable("id")int id) {
		Session session = service.rejectSessionService(id);
		return ResponseEntity.ok(session);
	}
	
	@PutMapping(path = "/cancelSession/{id}")
	public ResponseEntity<Session> cancelSession(@PathVariable("id")int id) {
		Session session = service.cancelSessionService(id);
		return ResponseEntity.ok(session);
	}
	
}
