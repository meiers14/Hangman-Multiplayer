package com.dhbw.hangman.controller;

import com.dhbw.hangman.model.Difficulty;
import com.dhbw.hangman.model.Word;
import com.dhbw.hangman.repository.WordRepository;
import com.dhbw.hangman.service.WordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class WordController {
    @Autowired
    private WordService wordService;

    @Autowired
    private WordRepository wordRepository;


    @GetMapping("/allWords")
    public List<Word> getAll() {
        return wordService.findAll();
    }

    @GetMapping("/findWordsByDifficulty")
    public List<Word> findWordsByDifficulty(@RequestParam Difficulty wordDifficulty) {
        return wordRepository.findByWordDifficulty(wordDifficulty);
    }
}
