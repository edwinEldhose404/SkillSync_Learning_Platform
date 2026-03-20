package com.session.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.session.service.SessionService;

@RestController
@RequestMapping(path = "session")
public class SessionController {
	
	@Autowired
	SessionService service;
	
	
}
