import {Component, HostListener, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {SharedDataService} from '../services/shared-data.service';

// Models
import {Lobby} from '../models/lobby';
import {Difficulty} from '../models/difficulty.enum';
import {GameMode} from '../models/game-mode';
import {Player} from '../models/player';

// Services
import {LobbyService} from '../services/lobby.service';
import {GameService} from '../services/game.service';
import {WebsocketService} from '../services/websocket.service';

@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
    // From Shared Data
    lobbyCode: string = '';
    username: string = '';
    selectedMode!: GameMode;
    selectedDifficulty!: Difficulty;
    selectedRounds!: number;

    // From Database
    lobby!: Lobby;
    players: Player[] = [];
    user!: Player;
    words!: string[];

    // Game
    alphabet: string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    guessedLetters: string[] = [];

    word!: string;
    displayWord!: string[];

    remainingLives: number = 6;
    hangmanImage: string = 'assets/hangman0.png';

    gameOver: boolean = false;
    gameWon: boolean = false;

    currentPlayer!: Player;
    isCurrentPlayer: boolean = false;

    currentRound: number = 0;
    rounds!: string[];

    wins: number = 0;

    // Chat
    chatMessages: { sender: string, message: string, timestamp: string }[] = [];
    newMessage: string = '';

    constructor(
        private router: Router,
        private lobbyService: LobbyService,
        private gameService: GameService,
        private snackBar: MatSnackBar,
        private sharedDataService: SharedDataService,
        public  websocketService: WebsocketService
    ) {
    }

    ngOnInit() {
        this.lobbyCode = this.sharedDataService.get('lobbyCode');
        this.username = this.sharedDataService.get('username');
        this.selectedMode = this.sharedDataService.get('selectedMode');
        this.selectedDifficulty = this.sharedDataService.get('selectedDifficulty');
        this.selectedRounds = this.sharedDataService.get('selectedRounds');

        this.rounds = Array(this.selectedRounds).fill(null);


        this.getLobby();

        this.websocketService.isConnected().subscribe(connected => {
            if (connected) {
                this.websocketService.subscribeToChat(this.lobbyCode, (message) => {
                    const timestamp = new Date().toLocaleTimeString();
                    this.chatMessages.push({
                        sender: message.username || 'Unknown',
                        message: message.message,
                        timestamp
                    });
                });

                this.websocketService.subscribeToGame(this.lobbyCode, (gameState) => {
                    this.updateGameState(gameState);
                });
            }
        });
    }

    getLobby(): void {
        // API call returns Lobby object
        this.lobbyService.getLobbyByCode(this.lobbyCode).subscribe({
            next: (lobby: Lobby) => {
                if (!lobby || lobby === null) {
                    // Navigate to Home Component if no lobby object was found
                    this.router.navigate(['/']);
                    throw new Error('Lobby ist null oder nicht gefunden');
                }
                // Set local variables
                this.lobby = lobby;
                if (lobby.playerA != null && lobby.playerB != null) {
                    this.players = [lobby.playerA, lobby.playerB];
                }

                this.getWords();

                // Set local user
                if (this.username === this.players[0].name) {
                    this.user = this.players[0];
                } else {
                    this.user = this.players[1];
                }

                // Set player A as current player
                this.currentPlayer = this.user
                this.isCurrentPlayer = (this.user === this.currentPlayer);
            },
            error: (error) => {
                console.error('Fehler:', error);
                this.snackBar.open('Fehler beim Abrufen der Lobby', 'Schließen', {duration: 3000});
            }
        });
    }

    getWords(): void {
        if (this.selectedDifficulty) {
            this.gameService.getWordsByDifficulty(this.selectedDifficulty).subscribe({
                next: (words) => {
                    this.words = words.map((word: { word: any }) => word.word);
                    if (this.words.length > 0) {
                        this.startNewRound();
                    } else {
                        console.error('Keine Wörter von der API erhalten.');
                    }
                },
                error: (error) => {
                    console.error('Fehler beim Abrufen der Wörter:', error);
                }
            });
        } else {
            console.error('Schwierigkeitsgrad ist nicht definiert.');
        }
    }


    @HostListener('window:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if ((<HTMLElement>event.target).tagName === 'INPUT') {
            return;
        }

        if (!this.isCurrentPlayer || this.gameOver || this.gameWon) {
            return;
        }

        const letter = event.key.toUpperCase();
        if (this.alphabet.includes(letter) && !this.guessedLetters.includes(letter)) {
            this.guessLetter(letter);
        }
    }

    @HostListener('window:keydown.enter', ['$event'])
    handleEnterKey(event: KeyboardEvent) {
        if ((<HTMLElement>event.target).tagName === 'INPUT') {
            this.sendMessage();
        } else if ((this.gameOver || this.gameWon) && this.currentRound < this.selectedRounds) {
            this.startNewRound();
        }
    }

    guessLetter(letter: string) {
        if (!this.isCurrentPlayer || this.gameOver || this.gameWon) return;

        this.guessedLetters.push(letter);
        if (this.word.includes(letter)) {
            // Display guessed letter if it is correct
            for (let i = 0; i < this.word.length; i++) {
                if (this.word[i] === letter) {
                    this.displayWord[i] = letter;
                }
            }
            this.updateHangmanImage();
            this.sendGameUpdate();
            this.checkWin();
        } else {
            this.remainingLives--;
            // Game is over if no lives remain befor finish guessing the word
            if (this.remainingLives <= 0) {
                this.remainingLives = 0;
                this.rounds[this.currentRound - 1] = 'L';
                this.gameOver = true;
            }
            this.updateHangmanImage();
            this.switchPlayer();
            this.sendGameUpdate();
        }
    }


    checkWin() {
        if (this.displayWord.join('') === this.word) {
            this.gameWon = true;
            this.wins++;
            this.rounds[this.currentRound - 1] = 'W';
            this.switchPlayer();
            this.sendGameUpdate();
        }
    }

    updateHangmanImage() {
        const lifeStage = 6 - this.remainingLives;
        this.hangmanImage = `assets/hangman${lifeStage}.png`;
    }

    startNewRound() {
        if (this.currentRound >= this.selectedRounds) {
            return;
        }
        if (!this.words || this.words.length === 0) {
            console.error('Keine Wörter verfügbar.');
            return;
        }
        this.guessedLetters = [];
        this.remainingLives = 6;
        this.hangmanImage = 'assets/hangman0.png';
        this.gameOver = false;
        this.gameWon = false;
        this.word = this.words[Math.floor(Math.random() * this.words.length)];
        this.displayWord = Array(this.word.length).fill('_') as string[];
        this.currentRound++;
        this.sendGameUpdate();
    }

    sendMessage() {
        if (this.newMessage.trim()) {
            const chatMessage = {
                username: this.username,
                message: this.newMessage,
                lobbyCode: this.lobbyCode
            };
            this.websocketService.sendMessage('/app/send', chatMessage);
            this.newMessage = '';
        }
    }

    leaveGame() {
        this.router.navigate(['/lobby'], {queryParams: {code: this.lobbyCode}});
    }

    protected sendGameUpdate() {
        const gameState = {
            word: this.word,
            displayWord: this.displayWord,
            remainingLives: this.remainingLives,
            gameOver: this.gameOver,
            gameWon: this.gameWon,
            currentRound: this.currentRound,
            selectedRounds: this.selectedRounds,
            guessedLetters: this.guessedLetters,
            currentPlayer: this.currentPlayer,
            selectedMode: this.selectedMode,
            rounds: this.rounds
        };
        console.log('Sending game update:', gameState);
        this.websocketService.sendMessage(`/app/game/${this.lobbyCode}`, gameState);
    }

    updateGameState(gameState: any) {
        console.log('Received game state update:', gameState);
        if (gameState) {
            this.word = gameState.word ?? this.word;
            this.displayWord = gameState.displayWord ?? this.displayWord;
            this.remainingLives = gameState.remainingLives ?? this.remainingLives;
            this.gameOver = gameState.gameOver ?? this.gameOver;
            this.gameWon = gameState.gameWon ?? this.gameWon;
            this.currentRound = gameState.currentRound ?? this.currentRound;
            this.selectedRounds = gameState.selectedRounds ?? this.selectedRounds;
            this.guessedLetters = gameState.guessedLetters ?? this.guessedLetters;
            this.currentPlayer = gameState.currentPlayer ?? this.currentPlayer;
            this.selectedMode = gameState.selectedMode ?? this.selectedMode;
            this.rounds = gameState.rounds ?? this.rounds;
            this.isCurrentPlayer = (this.username === this.currentPlayer?.name);
            this.updateHangmanImage();
        }
    }

    switchPlayer() {
        this.currentPlayer = this.players.find(player => player.name !== this.currentPlayer.name) || this.currentPlayer;
        this.isCurrentPlayer = (this.username === this.currentPlayer.name);
    }
}
