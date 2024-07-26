package com.dhbw.hangman.service;

import com.dhbw.hangman.model.Word;
import com.dhbw.hangman.repository.WordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WordService {

    @Autowired
    private WordRepository wordRepository;

    public List<Word> findAll(){
        return wordRepository.findAll();
    }
}
