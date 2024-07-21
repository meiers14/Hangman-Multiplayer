package com.dhbw.demo.model;

import jakarta.persistence.*;

@Entity
public class Word {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int Id;

    @Enumerated(EnumType.STRING)
    @Column
    private Difficulty wordDifficulty;

    public int getId() {
        return Id;
    }

    public void setId(int id) {
        Id = id;
    }

    public Difficulty getWordDifficulty() {
        return wordDifficulty;
    }

    public void setWordDifficulty(Difficulty wordDifficulty) {
        this.wordDifficulty = wordDifficulty;
    }

    public Word(int id, Difficulty wordDifficulty) {
        super();
        Id = id;
        this.wordDifficulty = wordDifficulty;
    }

    public Word() {
        super();
    }
}
