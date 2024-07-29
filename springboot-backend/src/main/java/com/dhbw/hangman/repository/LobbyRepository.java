package com.dhbw.hangman.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.dhbw.hangman.model.Lobby;

@Repository
public interface LobbyRepository extends JpaRepository<Lobby, Integer> {
    boolean existsByLobbyCode(String lobbyCode);
    Lobby findByLobbyCode(String lobbyCode);
}
