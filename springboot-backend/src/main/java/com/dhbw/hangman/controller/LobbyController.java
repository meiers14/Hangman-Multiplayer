package com.dhbw.hangman.controller;

import com.dhbw.hangman.model.Lobby;
import com.dhbw.hangman.repository.LobbyRepository;
import com.dhbw.hangman.service.LobbyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class LobbyController {

    @Autowired
    private LobbyService lobbyService;

    @Autowired
    LobbyRepository lobbyRepository;


    @GetMapping("/allLobbys")
    public ResponseEntity<List<Lobby>> getAllLobbies() {
        List<Lobby> lobbies = lobbyRepository.findAll();
        return new ResponseEntity<>(lobbies, HttpStatus.OK);
    }


    @PostMapping("/createLobby")
    public ResponseEntity<String> createLobby(@RequestBody Lobby lobby) {
        try {
            lobbyRepository.save(lobby);
            return new ResponseEntity<>("LobbyCreated", HttpStatus.OK);
        } catch (DataAccessException e) {
            return new ResponseEntity<>("Lobby Creation Error", HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/generateLobbyCode")
    public ResponseEntity<String> generateLobbyCode() {
        try {
            String lobbyCode = lobbyService.generateLobbyCode();
            return new ResponseEntity<>(lobbyCode, HttpStatus.OK);
        } catch (DataAccessException e) {
            return new ResponseEntity<>("This Lobby Code is invalid", HttpStatus.BAD_REQUEST);
        }
    }
}
