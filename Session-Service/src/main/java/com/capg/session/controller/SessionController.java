package com.capg.session.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.capg.session.bean.Session;
import com.capg.session.bean.SessionDTO;
import com.capg.session.exception.InvalidSessionException;
import com.capg.session.exception.SessionNotFoundException;
import com.capg.session.service.SessionService;

/**
 * Controller responsible for session lifecycle operations within the Session-Service module.
 *
 * Supports requesting, booking, accepting, rejecting, canceling, completing, and querying sessions.
 * This controller delegates business logic to SessionService and does not use Feign client directly.
 */
@RestController
@EnableMethodSecurity
@RequestMapping(path = "sessions")
public class SessionController {
	
	@Autowired
	SessionService service;
	
	

	/**
	 * Request a new session by creating a session request record.
	 *
	 * Allows mentors or users to request a session with the given mentor and learner IDs.
	 * This controller does not call any Feign clients directly.
	 */
	@PostMapping
	@PreAuthorize("hasAnyRole('MENTOR', 'USER')")
	public ResponseEntity<Session> requestionNewSession(@RequestBody SessionDTO dto) {
		Session session = service.requestSessionService(dto.getMentor_id(), dto.getLearner_id(), dto.getSession_Date());
		return ResponseEntity.ok(session);
	}

	/**
	 * Book a session as a user with the specified mentor and learner.
	 *
	 * This endpoint is only available to users and delegates validation and persistence to SessionService.
	 */
	@PostMapping("/book")
	@PreAuthorize("hasRole('USER')")
	public ResponseEntity<Session> bookSession(@RequestBody SessionDTO dto) {
		Session session = service.bookSessionService(dto.getMentor_id(), dto.getLearner_id(), dto.getSession_Date());
		return ResponseEntity.ok(session);
	}
	
	
	/**
	 * Accept a pending session request by session ID.
	 *
	 * Only mentors can accept a session, and the updated session is returned.
	 */
	@PutMapping(path = "/{id}/accept")
	@PreAuthorize("hasRole('MENTOR')")
	public ResponseEntity<Session> acceptSession(@PathVariable("id")int id) {
		Session session = service.acceptSessionService(id);
		return ResponseEntity.ok(session);
	}
	

	/**
	 * Reject a pending session request by session ID.
	 *
	 * Only mentors can reject a session, which updates session status accordingly.
	 */
	@PutMapping(path = "/{id}/reject")
	@PreAuthorize("hasRole('MENTOR')")
	public ResponseEntity<Session> rejectSession(@PathVariable("id")int id) {
		Session session = service.rejectSessionService(id);
		return ResponseEntity.ok(session);
	}
	
	
	/**
	 * Cancel an active or pending session by session ID.
	 *
	 * Only mentors can cancel sessions through this endpoint.
	 */
	@PutMapping(path = "/{id}/cancel")
	@PreAuthorize("hasRole('MENTOR')")
	public ResponseEntity<Session> cancelSession(@PathVariable("id")int id) {
		Session session = service.cancelSessionService(id);
		return ResponseEntity.ok(session);
	}
	
	
	/**
	 * Mark a session as complete by session ID.
	 *
	 * Only mentors can complete sessions and transition their state to completed.
	 */
	@PutMapping(path = "/{id}/complete")
	@PreAuthorize("hasRole('MENTOR')")
	public ResponseEntity<Session> completeSession(@PathVariable("id")int id) {
		Session session = service.completeSessionService(id);
		return ResponseEntity.ok(session);
	}


	/**
	 * Get all sessions for a user based on the provided user ID.
	 *
	 * Returns sessions where the user is either mentor or learner.
	 */
	@org.springframework.web.bind.annotation.GetMapping(path = "/user/{userId}")
	@PreAuthorize("hasAnyRole('MENTOR', 'USER')")
	public ResponseEntity<java.util.List<Session>> getSessionsByUser(@PathVariable("userId")int userId) {
		return ResponseEntity.ok(service.getSessionsByUser(userId));
	}

	/**
	 * Get sessions for the currently authenticated user by user ID.
	 *
	 * This endpoint is intended to show sessions belonging to the requesting user.
	 */
	@org.springframework.web.bind.annotation.GetMapping(path = "/my/{userId}")
	@PreAuthorize("hasAnyRole('MENTOR', 'USER')")
	public ResponseEntity<java.util.List<Session>> getMySession(@PathVariable("userId")int userId) {
		return ResponseEntity.ok(service.getMySessionService(userId));
	}

	/**
	 * Get a single session record by its ID.
	 *
	 * Allows mentors and users to retrieve the details of a specific session.
	 */
	@org.springframework.web.bind.annotation.GetMapping(path = "/{id}")
	@PreAuthorize("hasAnyRole('MENTOR', 'USER')")
	public ResponseEntity<Session> getSessionById(@PathVariable("id")int id) {
		return ResponseEntity.ok(service.getSessionByIdService(id));
	}
}
