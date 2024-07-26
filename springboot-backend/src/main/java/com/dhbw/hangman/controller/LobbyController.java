package com.dhbw.hangman.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dhbw.hangman.model.Lobby;
import com.dhbw.hangman.service.LobbyService;

@RestController
public class LobbyController {

	@Autowired
	private LobbyService lobbyService;
	
	
	@GetMapping("/allLobbys")
	public List<Lobby> getAll() {
		return lobbyService.findAll();
	}
}
