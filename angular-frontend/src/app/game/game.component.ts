import {Component, HostListener, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {SharedDataService} from '../services/shared-data.service';
import {Lobby} from '../models/lobby';
import {Difficulty} from '../models/difficulty.enum';
import {Player} from '../models/player';
import {LobbyService} from '../services/lobby.service';
import {GameService} from '../services/game.service';
import {WebsocketService} from '../services/websocket.service';

@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

    lobbyCode: string = '';
    username: string = '';
    selectedDifficulty: Difficulty = Difficulty.MITTEL;
    selectedRounds: number = 0;


    lobby!: Lobby;
    players: Player[] = [];
    user!: Player;
    words: string[] = [];


    alphabet: string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    guessedLetters: string[] = [];

    word: string = '';
    displayWord: string[] = [];

    remainingLives: number = 6;
    hangmanImage: string = 'assets/hangman0.png';

    gameOver: boolean = false;
    gameWon: boolean = false;

    currentPlayer!: Player;
    isCurrentPlayer: boolean = false;

    currentRound: number = 0;
    rounds: string[] = [];

    wins: number = 0;

    chatMessages: { sender: string, message: string, timestamp: string }[] = [];
    newMessage: string = '';

    constructor(
        public router: Router,
        public lobbyService: LobbyService,
        public gameService: GameService,
        public snackBar: MatSnackBar,
        public  sharedDataService: SharedDataService,
        public  websocketService: WebsocketService
    ) {
    }

    /**
     * Lifecycle hook that is called after the component has initialized.
     * Sets up WebSocket connections and retrieves initial game settings.
     */
    async ngOnInit() {
        this.lobbyCode = this.sharedDataService.get('lobbyCode') ?? '';
        this.username = this.sharedDataService.get('username') ?? '';
        this.selectedDifficulty = this.sharedDataService.get('selectedDifficulty') ?? Difficulty.MITTEL;
        this.selectedRounds = this.sharedDataService.get('selectedRounds') ?? 0;

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
                    if (gameState) {
                        if (gameState.action === 'return_to_lobby') {
                            this.router.navigate(['/lobby'], { queryParams: { code: this.lobbyCode } });
                        } else {
                            this.updateGameState(gameState);
                        }
                    }
                });

                this.websocketService.sendMessage(`/app/game/${this.lobbyCode}`, {
                });
            }
        });

        await this.initializeGame();
    }

    /**
     * Initializes the game, retrieves lobby and word data, and sets up game rounds.
     */
    protected async initializeGame() {
        try {
            this.getLobby();
            if (this.selectedRounds !== 0) {
                this.rounds = Array(this.selectedRounds).fill(null);
                this.sendGameUpdate();
                this.getWords();
            }
        } catch (error) {
            console.error('Fehler bei der Initialisierung des Spiels:', error);
        }
    }

    /**
     * Fetches lobby details from the server based on the lobby code.
     */
    getLobby(): void {
        this.lobbyService.getLobbyByCode(this.lobbyCode).subscribe({
            next: (lobby: Lobby) => {
                if (!lobby || lobby === null) {
                    this.router.navigate(['/']);
                    throw new Error('Lobby ist null oder nicht gefunden');
                }
                this.lobby = lobby;
                if (lobby.playerA != null && lobby.playerB != null) {
                    this.players = [lobby.playerA, lobby.playerB];
                }

                if (this.username === this.players[0].name) {
                    this.user = this.players[0];
                    this.isCurrentPlayer = true;
                    this.currentPlayer = this.user
                } else {
                     this.user = this.players[1];
                 }
            },
            error: (error) => {
                console.error('Fehler:', error);
                this.snackBar.open('Fehler beim Abrufen der Lobby', 'Schließen', {duration: 3000});
            }
        });
    }

    /**
     * Fetches words from the server based on the selected difficulty level.
     */
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


    /**
     * Handles keyboard input to guess a letter if it's the current player's turn.
     * @param event The keyboard event triggered by pressing a key.
     */
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

    /**
     * Handles pressing the Enter key to send chat messages or start a new round.
     * @param event The keyboard event triggered by pressing Enter.
     */
    @HostListener('window:keydown.enter', ['$event'])
    handleEnterKey(event: KeyboardEvent) {
        if ((<HTMLElement>event.target).tagName === 'INPUT') {
            this.sendMessage();
        } else if ((this.gameOver || this.gameWon) && this.currentRound < this.selectedRounds) {
            this.startNewRound();
        }
    }

    /**
     * Processes a guessed letter and checks if it's in the word.
     * Updates the game state based on the correctness of the guess.
     * @param letter The guessed letter.
     */
    guessLetter(letter: string) {
        if (!this.isCurrentPlayer || this.gameOver || this.gameWon) return;

        this.guessedLetters.push(letter);
        if (this.word.includes(letter)) {
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

    /**
     * Checks if the player has guessed all the letters in the word, indicating a win.
     */
    checkWin() {
        if (this.displayWord.join('') === this.word) {
            this.gameWon = true;
            this.wins++;
            this.rounds[this.currentRound - 1] = 'W';
            this.switchPlayer();
            this.sendGameUpdate();
        }
    }

    /**
     * Updates the hangman image based on the remaining lives of the player.
     */
    updateHangmanImage() {
        const lifeStage = 6 - this.remainingLives;
        this.hangmanImage = `assets/hangman${lifeStage}.png`;
    }

    /**
     * Starts a new round of the game by resetting the state and selecting a new word.
     */
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

    /**
     * Sends a chat message typed by the player to the WebSocket server.
     */
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

    /**
     * Leaves the current game and navigates back to the lobby.
     */
    leaveGame() {
        this.router.navigate(['/lobby'], {queryParams: {code: this.lobbyCode}});
    }

    /**
     * Sends the current game state to the WebSocket server to update other players.
     */
    sendGameUpdate() {
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
            rounds: this.rounds,
            lobbyCode: this.lobbyCode
        };
        this.websocketService.sendMessage(`/app/game/${this.lobbyCode}`, gameState);
    }

    /**
     * Updates the game state locally based on the game state received from the server.
     * @param gameState The current game state from the server.
     */
    updateGameState(gameState: any) {
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
            this.rounds = gameState.rounds ?? this.rounds;
            this.isCurrentPlayer = (this.username === this.currentPlayer?.name);
            this.updateHangmanImage();
        }
    }

    /**
     * Switches the active player to the other player in the lobby.
     */
    switchPlayer() {
        this.currentPlayer = this.players.find(player => player.name !== this.currentPlayer.name) || this.currentPlayer;
        this.isCurrentPlayer = (this.username === this.currentPlayer.name);
    }

    /**
     * Sends a message to return to the lobby and navigates the player back to the lobby screen.
     */
    returnToLobby() {
        this.websocketService.sendMessage(`/app/game/${this.lobbyCode}`, {
            action: 'return_to_lobby'
        });

        this.router.navigate(['/lobby'], { queryParams: { code: this.lobbyCode } });
    }
}
