package com.dhbw.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dhbw.demo.model.Lobby;
import com.dhbw.demo.repository.LobbyRepository;

@Service
public class LobbyService {

	
	@Autowired
	private LobbyRepository lobbyRepository;
	
	
	public List<Lobby> findAll(){
		return lobbyRepository.findAll();
	}
	
	
}
