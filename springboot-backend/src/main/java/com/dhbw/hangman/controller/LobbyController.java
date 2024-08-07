package com.dhbw.hangman.controller;

import com.dhbw.hangman.model.Difficulty;
import com.dhbw.hangman.model.Lobby;
import com.dhbw.hangman.repository.LobbyRepository;
import com.dhbw.hangman.service.LobbyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
public class LobbyController {

    @Autowired
    private LobbyService lobbyService;

    @Autowired
    private LobbyRepository lobbyRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @GetMapping("/allLobbys")
    public ResponseEntity<List<Lobby>> getAllLobbys() {
        List<Lobby> lobbies = lobbyRepository.findAll();
        return new ResponseEntity<>(lobbies, HttpStatus.OK);
    }

    @GetMapping("/findLobbyByLobbyCode")
    public ResponseEntity<Lobby> findLobbyByLobbyCode(@RequestParam String lobbyCode) {
        try {
            Lobby lobby = lobbyRepository.findByLobbyCode(lobbyCode);
            return new ResponseEntity<>(lobby, HttpStatus.OK);
        } catch (DataAccessException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/createLobby")
    public ResponseEntity<Lobby> createLobby(@RequestBody Lobby lobby) {
        try {
            String lobbyCode = lobbyService.generateLobbyCode();
            lobby.setLobbyCode(lobbyCode);
            lobbyRepository.save(lobby);
            return new ResponseEntity<>(lobby, HttpStatus.OK);
        } catch (DataAccessException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/generateLobbyCode")
    public ResponseEntity<String> generateLobbyCode() {
        try {
            String lobbyCode = lobbyService.generateLobbyCode();
            return new ResponseEntity<>(lobbyCode, HttpStatus.OK);
        } catch (DataAccessException e) {
            return new ResponseEntity<>("Dieser Lobby-Code ist ungültig", HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/joinLobby")
    public ResponseEntity<String> joinLobby(@RequestParam String lobbyCode, @RequestParam String playerB) {
        try {
            Lobby lobby = lobbyRepository.findByLobbyCode(lobbyCode);
            if (lobby == null) {
                return new ResponseEntity<>("Fehler: Ungültiger Lobby-Code", HttpStatus.NOT_FOUND);
            }
            if (lobby.getPlayerB() != null && !lobby.getPlayerB().isEmpty()) {
                return new ResponseEntity<>("Fehler: Lobby ist voll", HttpStatus.CONFLICT);
            }
            if (playerB.equals(lobby.getPlayerA())) {
                return new ResponseEntity<>("Fehler: Spielername bereits vergeben", HttpStatus.CONFLICT);
            }
            lobby.setPlayerB(playerB);
            lobbyRepository.save(lobby);
            messagingTemplate.convertAndSend("/topic/lobby/" + lobbyCode, lobby);
            return new ResponseEntity<>("Lobby erfolgreich beigetreten", HttpStatus.OK);
        } catch (DataAccessException e) {
            return new ResponseEntity<>("Fehler beim Aktualisieren der Lobby", HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/removePlayer")
    public ResponseEntity<String> removePlayer(@RequestParam String lobbyCode, @RequestParam String playerName) {
        try {
            Lobby lobby = lobbyRepository.findByLobbyCode(lobbyCode);
            if (lobby == null) {
                return new ResponseEntity<>("Fehler: Lobby nicht gefunden", HttpStatus.NOT_FOUND);
            }
            if (playerName.equals(lobby.getPlayerA())) {
                if (lobby.getPlayerB() != null) {
                    lobby.setPlayerA(lobby.getPlayerB());
                    lobby.setPlayerB(null);
                } else {
                    lobbyRepository.delete(lobby);
                    messagingTemplate.convertAndSend("/topic/lobby/" + lobbyCode, Optional.empty());
                    return new ResponseEntity<>("Lobby erfolgreich verlassen", HttpStatus.OK);
                }
            } else if (playerName.equals(lobby.getPlayerB())) {
                lobby.setPlayerB(null);
            } else {
                return new ResponseEntity<>("Fehler: Spieler nicht in der Lobby gefunden", HttpStatus.BAD_REQUEST);
            }
            lobbyRepository.save(lobby);
            messagingTemplate.convertAndSend("/topic/lobby/" + lobbyCode, lobby);
            return new ResponseEntity<>("Lobby erfolgreich verlassen", HttpStatus.OK);
        } catch (DataAccessException e) {
            return new ResponseEntity<>("Fehler beim Aktualisieren der Lobby", HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/updateDifficulty")
    public ResponseEntity<String> updateDifficulty(@RequestParam String lobbyCode, @RequestParam Difficulty lobbyDifficulty) {
        try {
            Lobby lobby = lobbyRepository.findByLobbyCode(lobbyCode);
            if (lobby == null) {
                return new ResponseEntity<>("Fehler: Lobby nicht gefunden", HttpStatus.NOT_FOUND);
            }
            lobby.setLobbyDifficulty(lobbyDifficulty);
            lobbyRepository.save(lobby);
            messagingTemplate.convertAndSend("/topic/lobby/" + lobbyCode, lobby);
            return new ResponseEntity<>("Schwierigkeitsgrad erfolgreich aktualisiert", HttpStatus.OK);
        } catch (DataAccessException e) {
            return new ResponseEntity<>("Fehler beim Aktualisieren des Schwierigkeitsgrades", HttpStatus.BAD_REQUEST);
        }
    }
}
