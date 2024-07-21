CREATE TABLE IF NOT EXISTS Lobby (
                       Id INT AUTO_INCREMENT PRIMARY KEY,
                       lobbyCode VARCHAR(255) NOT NULL,
                       playerA VARCHAR(255),
                       playerB VARCHAR(255),
                       lobbyDifficulty VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS Word (
                      Id INT AUTO_INCREMENT PRIMARY KEY,
                      wordDifficulty VARCHAR(255)
);