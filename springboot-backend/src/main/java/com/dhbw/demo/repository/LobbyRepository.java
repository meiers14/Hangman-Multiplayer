package com.dhbw.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.dhbw.demo.model.Lobby;

@Repository
public interface LobbyRepository extends JpaRepository<Lobby, Integer> {
}
