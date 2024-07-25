package com.dhbw.demo.model;

import jakarta.persistence.*;
import org.hibernate.annotations.Type;

import java.util.List;

@Entity
public class Word {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int Id;

    @Enumerated(EnumType.STRING)
    @Column
    private Difficulty wordDifficulty;

    @Column
    private String word;

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

    public String getWord() {
        return word;
    }

    public void setWord(String word) {
        this.word = word;
    }

    public Word(int id, Difficulty wordDifficulty, String word) {
        super();
        Id = id;
        this.wordDifficulty = wordDifficulty;
        this.word = word;
    }

    public Word() {
        super();
    }
}
