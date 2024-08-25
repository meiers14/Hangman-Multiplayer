package com.dhbw.hangman.service;

import com.dhbw.hangman.model.Lobby;
import com.dhbw.hangman.repository.LobbyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.List;

@Service
public class LobbyService {


    @Autowired
    private LobbyRepository lobbyRepository;
    private static final String CHARACTERS = "0123456789";
    private static final int CODE_LENGTH = 6;
    private static final SecureRandom random = new SecureRandom();

    public List<Lobby> findAll() {
        return lobbyRepository.findAll();
    }

    public String generateLobbyCode() {
        StringBuilder code = new StringBuilder(CODE_LENGTH);
        do {
            for (int i = 0; i < CODE_LENGTH; i++) {
                code.append(CHARACTERS.charAt(random.nextInt(CHARACTERS.length())));
            }
        } while (lobbyRepository.existsByLobbyCode(code.toString()));

        return code.toString();
    }
}