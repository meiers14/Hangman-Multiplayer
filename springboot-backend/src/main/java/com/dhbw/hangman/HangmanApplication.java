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

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.dhbw.hangman.repository")
public class HangmanApplication {

	public static void main(String[] args) {
		SpringApplication.run(HangmanApplication.class, args);
	}

	@Bean
	CommandLineRunner run(LobbyRepository lobbyRepository, WordRepository wordRepository) {
		return args -> {
			Difficulty difficulty = Difficulty.valueOf("LEICHT");
				wordRepository.save(new Word(123, difficulty , "exampleWord"));
			System.out.println("Initial entity created");
		};
	}
}

