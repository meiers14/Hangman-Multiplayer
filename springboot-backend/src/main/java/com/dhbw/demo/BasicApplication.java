package com.dhbw.demo;

import com.dhbw.demo.model.Difficulty;
import com.dhbw.demo.model.Word;
import com.dhbw.demo.repository.LobbyRepository;
import com.dhbw.demo.repository.WordRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.dhbw.demo.repository")
public class BasicApplication {

	public static void main(String[] args) {
		SpringApplication.run(BasicApplication.class, args);
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

