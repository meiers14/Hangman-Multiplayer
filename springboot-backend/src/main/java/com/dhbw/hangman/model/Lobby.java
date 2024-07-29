package com.dhbw.hangman.model;

import jakarta.persistence.*;

@Entity
public class Lobby {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int Id;

	private String lobbyCode;

	private String playerA;


	private String playerB;

	@Enumerated(EnumType.STRING)
	private Difficulty lobbyDifficulty;


	public int getId() {
		return Id;
	}

	public void setId(int id) {
		Id = id;
	}

	public String getLobbyCode() {
		return lobbyCode;
	}

	public void setLobbyCode(String lobbyCode) {
		this.lobbyCode = lobbyCode;
	}

	public String getPlayerA() {
		return playerA;
	}

	public void setPlayerA(String playerA) {
		this.playerA = playerA;
	}

	public String getPlayerB() {
		return playerB;
	}

	public void setPlayerB(String playerB) {
		this.playerB = playerB;
	}

	public Difficulty getLobbyDifficulty() {
		return lobbyDifficulty;
	}

	public void setLobbyDifficulty(Difficulty lobbyDifficulty) {
		this.lobbyDifficulty = lobbyDifficulty;
	}

	public Lobby(int id, String lobbyCode, String playerA, String playerB, Difficulty lobbyDifficulty) {
		super();
		Id = id;
		this.lobbyCode = lobbyCode;
		this.playerA = playerA;
		this.playerB = playerB;
		this.lobbyDifficulty = lobbyDifficulty;
	}

	public Lobby() {
		super();
	}
}
