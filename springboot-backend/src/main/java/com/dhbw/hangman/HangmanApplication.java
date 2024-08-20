package com.dhbw.hangman;

import com.dhbw.hangman.model.Difficulty;
import com.dhbw.hangman.model.Word;
import com.dhbw.hangman.repository.WordRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.Set;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.dhbw.hangman.repository")
public class HangmanApplication {

    public static void main(String[] args) {
        SpringApplication.run(HangmanApplication.class, args);
    }

    @Bean
    CommandLineRunner run(WordRepository wordRepository) {
        return args -> {
            if (wordRepository.count() == 0) {
                System.out.println("No words found in database. Starting database initialization...");
                initializeDatabase(wordRepository);
            } else {
                System.out.println("Database already initialized with " + wordRepository.count() + " words.");
            }
        };
    }

    @Transactional
    private void initializeDatabase(WordRepository wordRepository) {
        addWordsFromFile("words/easyWords.txt", Difficulty.LEICHT, wordRepository);
        addWordsFromFile("words/mediumWords.txt", Difficulty.MITTEL, wordRepository);
        addWordsFromFile("words/hardWords.txt", Difficulty.SCHWER, wordRepository);
        System.out.println("Database initialization completed.");
    }

    private void addWordsFromFile(String fileName, Difficulty difficulty, WordRepository wordRepository) {
        Set<String> existingWordsSet = new HashSet<>(
                wordRepository.findByWordDifficulty(difficulty).stream().map(Word::getWord).toList());
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(
                getClass().getClassLoader().getResourceAsStream(fileName), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String wordText = line.trim();
                if (!existingWordsSet.contains(wordText)) {
                    wordRepository.save(new Word(difficulty, wordText));
                    existingWordsSet.add(wordText); // Add the word to the set to prevent duplicates within the same
                                                    // session
                    System.out.println("Added word: " + wordText + " with difficulty: " + difficulty);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
