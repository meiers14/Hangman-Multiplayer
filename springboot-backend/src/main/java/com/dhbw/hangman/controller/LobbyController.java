package com.dhbw.hangman.controller;

import com.dhbw.hangman.model.Difficulty;
import com.dhbw.hangman.model.Lobby;
import com.dhbw.hangman.repository.LobbyRepository;
import com.dhbw.hangman.service.LobbyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class LobbyController {

    @Autowired
    private LobbyService lobbyService;

    @Autowired
    LobbyRepository lobbyRepository;


    @GetMapping("/allLobbys")
    public ResponseEntity<List<Lobby>> getAllLobbys() {
        List<Lobby> lobbies = lobbyRepository.findAll();
        return new ResponseEntity<>(lobbies, HttpStatus.OK);
    }

    @GetMapping("/findLobbyByDifficulty")
    public Lobby findLobbyByLobbyCode(@RequestParam String lobbyCode) {
        return lobbyRepository.findByLobbyCode(lobbyCode);
    }


    @PostMapping("/createLobby")
    public ResponseEntity<String> createLobby(@RequestBody Lobby lobby) {
        try {
            String lobbyCode = lobbyService.generateLobbyCode();
            lobby.setLobbyCode(lobbyCode);
            lobbyRepository.save(lobby);
            return new ResponseEntity<>("Lobby created", HttpStatus.OK);
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

    @PutMapping("/joinLobby")
    public ResponseEntity<String> joinLobby(@RequestParam String lobbyCode, @RequestParam String playerB) {
        try {
            if (lobbyCode == null || playerB == null) {
                return new ResponseEntity<>("Lobby code and player B must be provided", HttpStatus.BAD_REQUEST);
            }

            Lobby lobby = lobbyRepository.findByLobbyCode(lobbyCode);
            if (lobby == null) {
                return new ResponseEntity<>("Lobby not found", HttpStatus.NOT_FOUND);
            }
            lobby.setPlayerB(playerB);
            lobbyRepository.save(lobby);
            return new ResponseEntity<>("Player B added to the lobby", HttpStatus.OK);
        } catch (DataAccessException e) {
            return new ResponseEntity<>("Error updating Lobby", HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/removePlayer")
    public ResponseEntity<String> removePlayer(@RequestParam String lobbyCode, @RequestParam String playerName) {
        try {
            Lobby lobby = lobbyRepository.findByLobbyCode(lobbyCode);
            if (lobby == null) {
                return new ResponseEntity<>("Lobby not found", HttpStatus.NOT_FOUND);
            }

            if (playerName.equals(lobby.getPlayerA())) {
                if (lobby.getPlayerB() != null) {
                    lobby.setPlayerA(lobby.getPlayerB());
                    lobby.setPlayerB(null);
                } else {
                    lobbyRepository.delete(lobby);
                    return new ResponseEntity<>("Lobby removed", HttpStatus.OK);
                }
            } else if (playerName.equals(lobby.getPlayerB())) {
                lobby.setPlayerB(null);
            } else {
                return new ResponseEntity<>("Player not found in the lobby", HttpStatus.BAD_REQUEST);
            }

            lobbyRepository.save(lobby);
            return new ResponseEntity<>("Player removed from the lobby", HttpStatus.OK);
        } catch (DataAccessException e) {
            return new ResponseEntity<>("Error updating Lobby", HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/updateDifficulty")
    public ResponseEntity<String> updateDifficulty(@RequestParam String lobbyCode, @RequestParam Difficulty lobbyDifficulty) {
        try {
            Lobby lobby = lobbyRepository.findByLobbyCode(lobbyCode);
            if (lobby == null) {
                return new ResponseEntity<>("Lobby not found", HttpStatus.NOT_FOUND);
            }

            lobby.setLobbyDifficulty(lobbyDifficulty);
            lobbyRepository.save(lobby);
            return new ResponseEntity<>("Lobby difficulty updated", HttpStatus.OK);
        } catch (DataAccessException e) {
            return new ResponseEntity<>("Error updating Lobby difficulty", HttpStatus.BAD_REQUEST);
        }
    }
}
