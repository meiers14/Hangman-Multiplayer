import {Component} from '@angular/core';
import {GameComponent} from '../game.component';

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

    override ngOnInit() {
        this.lobbyCode = this.sharedDataService.get('lobbyCode');
        this.username = this.sharedDataService.get('username');
        this.selectedMode = this.sharedDataService.get('selectedMode');
        this.selectedDifficulty = this.sharedDataService.get('selectedDifficulty');
        this.selectedRounds = this.sharedDataService.get('selectedRounds');

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

                this.getLobby();
                if (this.selectedDifficulty != undefined) {
                    this.rounds = Array(this.selectedRounds).fill(null);
                    this.roundsOpponent = Array(this.selectedRounds).fill(null);
                    this.getWords();
                }
            }
        });


    }

    override startNewRound() {
        if (this.currentRound >= this.selectedRounds) {
            return;
        }

        this.showWordSelection = true;
        this.wordSelectedBySelf = false;
        this.wordSelectedByOpponent = false;
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


    override getWords(): void {
        if (this.selectedDifficulty) {
            this.gameService.getWordsByDifficulty(this.selectedDifficulty).subscribe({
                next: (words) => {
                    this.words = words.map((word: { word: any }) => word.word);

                    if (this.words.length >= 6) {
                        const allSelectedWords = this.getRandomWords(this.words, 6);
                        this.wordOptions = allSelectedWords.slice(0, 3);
                        this.opponentWordOptions = allSelectedWords.slice(3, 6);
                        this.sendOpponentWordOptions();
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

    private getRandomWords(words: string[], count: number): string[] {
        const shuffled = words.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    private sendOpponentWordOptions() {
        const opponentWords = {
            type: 'WORD_OPTIONS',
            selectedBy: this.username,
            opponentWordOptions: this.opponentWordOptions
        };
        this.websocketService.sendMessage(`/app/game/${this.lobbyCode}`, opponentWords);
    }

    selectWord(word: string) {
        if (this.isCurrentPlayer && !this.wordForOpponent) {
            this.wordForOpponent = word;
            this.wordSelectedBySelf = true;
            this.sendWordSelection();
            this.checkIfBothSelected();
        }
    }

    private sendWordSelection() {
        const wordSelection = {
            type: 'WORD_SELECTION',
            word: this.wordForOpponent,
            selectedBy: this.username
        };
        this.websocketService.sendMessage(`/app/game/${this.lobbyCode}`, wordSelection);
    }

    private checkIfBothSelected() {
        if (this.wordSelectedBySelf && this.wordSelectedByOpponent) {
            this.showWordSelection = false;
        }
    }

    override switchPlayer() {
        return;
    }

    protected sendInitialRounds() {
        const gameState = {
            type: 'INITIAL_ROUNDS',
            rounds: this.rounds,
            selectedBy: this.username,
            selectedRounds: this.selectedRounds,
            lobbyCode: this.lobbyCode
        };
        console.log('Sending INITIAL_ROUNDS:', gameState);
        this.websocketService.sendMessage(`/app/game/${this.lobbyCode}`, gameState);
    }

    protected override sendGameUpdate() {
        const gameState = {
            currentRound: this.currentRound,
            selectedRounds: this.selectedRounds,
            selectedMode: this.selectedMode,
            rounds: this.rounds,
            selectedBy: this.username,
            remainingLives: this.remainingLives,
            type: 'GAME_STATE'
        };
        console.log('Sending game update:', gameState);
        this.websocketService.sendMessage(`/app/game/${this.lobbyCode}`, gameState);
    }

    override updateGameState(gameState: any) {
        if (gameState) {
            console.log('Username:', this.username);
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
                        break;

                    default:
                        console.error("Unbekannter Nachrichtentyp:", gameState.type);
                }
            }
        }
    }
}