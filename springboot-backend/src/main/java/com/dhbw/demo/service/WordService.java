package com.dhbw.demo.service;

import com.dhbw.demo.model.Lobby;
import com.dhbw.demo.model.Word;
import com.dhbw.demo.repository.WordRepository;
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
