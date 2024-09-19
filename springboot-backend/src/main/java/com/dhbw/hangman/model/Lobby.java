package com.dhbw.hangman.model;

import jakarta.persistence.*;

@Entity
public class Lobby {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int Id;

	private String lobbyCode;

	@Embedded
	@AttributeOverrides({
        @AttributeOverride(name = "name", column = @Column(name = "player_a_name")),
        @AttributeOverride(name = "role", column = @Column(name = "player_a_role"))
    })
	private Player playerA;

	@Embedded
	@AttributeOverrides({
        @AttributeOverride(name = "name", column = @Column(name = "player_b_name")),
        @AttributeOverride(name = "role", column = @Column(name = "player_b_role"))
    })
	private Player playerB;

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

	public Player getPlayerA() {
		return playerA;
	}

	public void setPlayerA(Player playerA) {
		this.playerA = playerA;
	}

	public Player getPlayerB() {
		return playerB;
	}

	public void setPlayerB(Player playerB) {
		this.playerB = playerB;
	}

	public Lobby(int id, String lobbyCode, Player playerA, Player playerB, Difficulty lobbyDifficulty) {
		super();
		Id = id;
		this.lobbyCode = lobbyCode;
		this.playerA = playerA;
		this.playerB = playerB;
	}

	public Lobby() {
		super();
	}
}
