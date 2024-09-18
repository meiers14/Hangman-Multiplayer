import { Component } from '@angular/core';
import { GameComponent } from '../game.component';
import { Difficulty } from '../../models/difficulty.enum';
import { Player } from '../../models/player';
import { Lobby } from '../../models/lobby';

@Component({
    selector: 'app-challenge-arena',
    templateUrl: './challenge-arena.component.html',
    styleUrls: ['../game.component.css']
})
export class ChallengeArenaComponent extends GameComponent {
    showWordSelection: boolean = true;
    wordOptions: string[] = [];
    opponentWordOptions: string[] = [];
    wordForOpponent?: string;
    wordSelectedByOpponent: boolean = false;
    wordSelectedBySelf: boolean = false;
    hangmanImageOpponent: string = 'assets/hangman0.png';
    remainingLivesOpponent: number = 6;
    override isCurrentPlayer: boolean = true;
    override rounds: string[] = [];
    roundsOpponent: string[] = [];
    opponentFinished: boolean = false;
    override user!: Player;

    /**
     * Initializes the component by retrieving necessary game data and setting up WebSocket subscriptions.
     */
    override async  ngOnInit() {
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
     * Initializes the game by retrieving lobby details, setting up rounds, and getting words.
     */
    override async initializeGame() {
        try {
            this.getLobby();
            if (this.selectedRounds !== 0) {
                this.rounds = Array(this.selectedRounds).fill(null);
                this.roundsOpponent = Array(this.selectedRounds).fill(null);
                this.sendGameUpdate();
                this.getWords();
            }
        } catch (error) {
            console.error('Fehler bei der Initialisierung des Spiels:', error);
        }
    }

    /**
     * Retrieves the lobby details using the lobby code and sets up the players.
     */
    override getLobby(): void {
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
                    this.currentPlayer = this.user
                }
            },
            error: (error) => {
                console.error('Fehler:', error);
                this.snackBar.open('Fehler beim Abrufen der Lobby', 'Schließen', {duration: 3000});
            }
        });
    }

    /**
     * Starts a new round by selecting words for both players and resetting the game state.
     */
    override startNewRound() {
        if (this.currentRound >= this.selectedRounds) {
            return;
        }

        if (!this.words || this.words.length === 0) {
            console.error('Keine Wörter verfügbar.');
            return;
        }

        const allSelectedWords = this.getRandomWords(this.words, 6);
        this.wordOptions = allSelectedWords.slice(0, 3);
        this.opponentWordOptions = allSelectedWords.slice(3, 6);
        this.sendOpponentWordOptions();
        this.showWordSelection = true;
        this.wordSelectedBySelf = false;
        this.wordSelectedByOpponent = false;
        this.opponentFinished = false;
        this.guessedLetters = [];
        this.remainingLives = 6;
        this.hangmanImage = 'assets/hangman0.png';
        this.remainingLivesOpponent = 6;
        this.hangmanImageOpponent = 'assets/hangman0.png';
        this.gameOver = false;
        this.gameWon = false;
        this.currentRound++;
        if (this.currentRound == 1) {
            this.sendInitialRounds();
        }
        this.sendGameUpdate()
    }

    /**
     * Retrieves words from the API based on the selected difficulty level.
     */
    override getWords(): void {
        if (this.selectedDifficulty) {
            this.gameService.getWordsByDifficulty(this.selectedDifficulty).subscribe({
                next: (words) => {
                    this.words = words.map((word: { word: any }) => word.word);

                    if (this.words.length >= 6) {
                        this.startNewRound();
                    } else {
                        console.error('Nicht genügend Wörter von der API erhalten.');
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
     * Randomly selects a given number of words from the provided word list.
     *
     * @param words List of words to select from.
     * @param count Number of words to select.
     * @returns Array of selected words.
     */
    private getRandomWords(words: string[], count: number): string[] {
        const shuffled = words.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }


    /**
     * Sends the opponent's word options to the WebSocket.
     */
    private sendOpponentWordOptions() {
        const opponentWords = {
            type: 'WORD_OPTIONS',
            selectedBy: this.username,
            opponentWordOptions: this.opponentWordOptions
        };
        this.websocketService.sendMessage(`/app/game/${this.lobbyCode}`, opponentWords);
    }

    /**
     * Selects a word for the opponent and sends the selection to the WebSocket.
     *
     * @param word The selected word.
     */
    selectWord(word: string) {
        if (this.isCurrentPlayer) {
            this.wordForOpponent = word;
            this.wordSelectedBySelf = true;
            this.sendWordSelection();
            this.checkIfBothSelected();
        }
    }

    /**
     * Sends the word selected by the player to the WebSocket.
     */
    private sendWordSelection() {
        const wordSelection = {
            type: 'WORD_SELECTION',
            word: this.wordForOpponent,
            selectedBy: this.username
        };
        this.websocketService.sendMessage(`/app/game/${this.lobbyCode}`, wordSelection);
    }

    /**
     * Checks if both players have selected their words. If so, hides the word selection.
     */
    private checkIfBothSelected() {
        if (this.wordSelectedBySelf && this.wordSelectedByOpponent) {
            this.showWordSelection = false;
        }
    }

    /**
     * Switches the current player (no action in this case).
     */
    override switchPlayer() {
        return;
    }

    /**
     * Sends the initial round setup to the WebSocket.
     */
    protected sendInitialRounds() {
        const gameState = {
            type: 'INITIAL_ROUNDS',
            rounds: this.rounds,
            selectedBy: this.username,
            selectedRounds: this.selectedRounds,
            lobbyCode: this.lobbyCode
        };
        this.websocketService.sendMessage(`/app/game/${this.lobbyCode}`, gameState);
    }

    /**
     * Sends the current game state to the WebSocket, including round, life, and game status.
     */
    override sendGameUpdate() {
        const gameState = {
            currentRound: this.currentRound,
            selectedRounds: this.selectedRounds,
            rounds: this.rounds,
            selectedBy: this.username,
            remainingLives: this.remainingLives,
            gameOver: this.gameOver,
            gameWon: this.gameWon,
            showWordSelection: this.showWordSelection,
            opponentFinished: this.opponentFinished,
            type: 'GAME_STATE'
        };
        this.websocketService.sendMessage(`/app/game/${this.lobbyCode}`, gameState);
    }

    /**
     * Updates the game state based on data received from the WebSocket.
     *
     * @param gameState The new game state received.
     */
    override updateGameState(gameState: any) {
        if (gameState) {
            if (gameState.selectedBy !== this.username) {
                switch (gameState.type) {
                    case 'WORD_SELECTION':
                        this.word = gameState.word;
                        this.displayWord = Array(this.word.length).fill('_') as string[];
                        this.wordSelectedByOpponent = true;
                        this.checkIfBothSelected();
                        break;

                    case 'WORD_OPTIONS':
                        this.wordOptions = gameState.opponentWordOptions;
                        break;

                    case 'INITIAL_ROUNDS':
                        this.selectedRounds = gameState.selectedRounds ?? this.selectedRounds;
                        this.rounds = gameState.rounds ?? this.rounds;
                        this.roundsOpponent = gameState.rounds ?? this.rounds;
                        this.lobbyCode = gameState.lobbyCode ?? this.lobbyCode;
                        break;

                    case 'GAME_STATE':
                        this.remainingLivesOpponent = gameState.remainingLives ?? this.remainingLivesOpponent;
                        const lifeStageOpponent = 6 - this.remainingLivesOpponent;
                        this.hangmanImageOpponent = `assets/hangman${lifeStageOpponent}.png`;
                        this.roundsOpponent = gameState.rounds ?? this.roundsOpponent;
                        this.currentRound = gameState.currentRound ?? this.currentRound;

                        if (gameState.gameOver || gameState.gameWon) {
                            this.opponentFinished = true;
                        }
                        if (gameState.showWordSelection) {
                            this.resetWordSelectionState();
                        }
                        break;
                }
            }
        }
    }

    /**
     * Resets the word selection state and relevant game variables.
     */
    private resetWordSelectionState() {
        this.wordSelectedBySelf = false;
        this.wordSelectedByOpponent = false;
        this.showWordSelection = true;
        this.opponentFinished = false;
        this.guessedLetters = [];
        this.remainingLives = 6;
        this.hangmanImage = 'assets/hangman0.png';
        this.remainingLivesOpponent = 6;
        this.hangmanImageOpponent = 'assets/hangman0.png';
        this.gameOver = false;
        this.gameWon = false;
    }
}
