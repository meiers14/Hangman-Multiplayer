package com.dhbw.hangman.repository;

import com.dhbw.hangman.model.Difficulty;
import com.dhbw.hangman.model.Word;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WordRepository extends JpaRepository<Word, Integer> {
    List<Word> findByWordDifficulty(Difficulty difficulty);
}
