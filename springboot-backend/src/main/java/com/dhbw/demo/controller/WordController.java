package com.dhbw.demo.controller;

import com.dhbw.demo.model.Word;
import com.dhbw.demo.service.WordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class WordController {
    @Autowired
    private WordService wordService;


    @GetMapping("/all")
    public List<Word> getAll() {
        return wordService.findAll();
    }
}
