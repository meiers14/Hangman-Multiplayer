package com.dhbw.hangman;

import com.dhbw.hangman.model.Difficulty;
import com.dhbw.hangman.model.Word;
import com.dhbw.hangman.repository.WordRepository;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.dhbw.hangman.repository")
public class HangmanApplication {

    public static void main(String[] args) {
        SpringApplication.run(HangmanApplication.class, args);
    }

    @Bean
    CommandLineRunner run(WordRepository wordRepository, @Value("${INIT_DATABASE:false}") boolean initDatabase) {
        return args -> {
            if (initDatabase && wordRepository.count() == 0) {
                System.out.println("Initializing database...");
                initializeDatabase(wordRepository);
            } else {
                System.out.println("Database initialization is skipped or already completed.");
            }
        };
    }

    @Transactional
    private void initializeDatabase(WordRepository wordRepository) {
        System.out.println("Initializing database with default words...");
        addWordsFromFile("words/easyWords.txt", Difficulty.LEICHT, wordRepository);
        addWordsFromFile("words/mediumWords.txt", Difficulty.MITTEL, wordRepository);
        addWordsFromFile("words/hardWords.txt", Difficulty.SCHWER, wordRepository);
        System.out.println("Database initialization completed.");
    }

    private void addWordsFromFile(String fileName, Difficulty difficulty, WordRepository wordRepository) {
        wordRepository.findByWordDifficulty(difficulty).forEach(word -> {
            System.out.println("Existing word: " + word.getWord() + " [" + difficulty + "]");
        });

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(
                getClass().getClassLoader().getResourceAsStream(fileName), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String wordText = line.trim();
                Word word = new Word(difficulty, wordText);
                if (!wordRepository.existsWordByWord(wordText)) {
                    wordRepository.save(word);
                    System.out.println("Added word: " + wordText + " [" + difficulty + "]");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
