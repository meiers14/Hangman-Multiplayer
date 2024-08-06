package com.dhbw.hangman;

import com.dhbw.hangman.model.Difficulty;
import com.dhbw.hangman.model.Word;
import com.dhbw.hangman.repository.LobbyRepository;
import com.dhbw.hangman.repository.WordRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.dhbw.hangman.repository")
public class HangmanApplication {

    private static final Object lock = new Object();

    public static void main(String[] args) {
        SpringApplication.run(HangmanApplication.class, args);
    }

    @Bean
    CommandLineRunner run(LobbyRepository lobbyRepository, WordRepository wordRepository) {
        return args -> {
            synchronized (lock) {
                if (wordRepository.count() == 0) {
                    initializeDatabase(wordRepository);
                } else {
                    System.out.println("Database already initialized");
                }
            }
        };
    }

    private void initializeDatabase(WordRepository wordRepository) {
        addWordsFromFile("words/easyWords.txt", Difficulty.LEICHT, wordRepository);
        addWordsFromFile("words/mediumWords.txt", Difficulty.MITTEL, wordRepository);
        addWordsFromFile("words/hardWords.txt", Difficulty.SCHWER, wordRepository);
        System.out.println("Initial entities created");
    }

    private void addWordsFromFile(String fileName, Difficulty difficulty, WordRepository wordRepository) {
        // Get all existing words for the given difficulty
        List<Word> existingWords = wordRepository.findByWordDifficulty(difficulty);
        Set<String> existingWordsSet = new HashSet<>();
        for (Word word : existingWords) {
            existingWordsSet.add(word.getWord());
        }

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(
                getClass().getClassLoader().getResourceAsStream(fileName), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String wordText = line.trim();
                if (!existingWordsSet.contains(wordText)) {
                    wordRepository.save(new Word(difficulty, wordText));
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
