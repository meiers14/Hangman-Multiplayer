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

    /**
     * Initializes the database with default words.
     *
     * @param wordRepository The WordRepository to interact with the database.
     * @param initDatabase Flag indicating whether to initialize the database.
     * @return A CommandLineRunner that runs the initialization logic.
     */
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

    /**
     * Populates the database with default words based on different difficulty levels.
     *
     * @param wordRepository The WordRepository to save the words.
     */
    @Transactional
    protected void initializeDatabase(WordRepository wordRepository) {
        System.out.println("Initializing database with default words...");
        addWordsFromFile("words/easyWords.txt", Difficulty.LEICHT, wordRepository);
        addWordsFromFile("words/mediumWords.txt", Difficulty.MITTEL, wordRepository);
        addWordsFromFile("words/hardWords.txt", Difficulty.SCHWER, wordRepository);
        System.out.println("Database initialization completed.");
    }

    /**
     * Reads words from a file and saves them to the database if they don't already exist.
     *
     * @param fileName The path to the file containing the words.
     * @param difficulty The difficulty level associated with the words.
     * @param wordRepository The WordRepository for database operations.
     */
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
