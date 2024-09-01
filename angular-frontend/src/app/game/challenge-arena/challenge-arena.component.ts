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
    opponentWordOptions: string[] = []; // Wortoptionen für den Gegner
    wordForOpponent?: string;
    wordSelectedByOpponent: boolean = false; // Trackt, ob der Gegner sein Wort ausgewählt hat
    wordSelectedBySelf: boolean = false; // Trackt, ob man selbst ein Wort für den Gegner ausgewählt hat

    override ngOnInit() {
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

    override startNewRound() {
        if (this.currentRound >= this.selectedRounds) {
            return;
        }
        this.showWordSelection = true; // Zeige die Wortauswahl an, bis beide Spieler gewählt haben
        this.wordSelectedBySelf = false; // Reset nach jeder Runde
        this.wordSelectedByOpponent = false; // Reset nach jeder Runde
        this.guessedLetters = [];
        this.remainingLives = 6;
        this.hangmanImage = 'assets/hangman0.png';
        this.gameOver = false;
        this.gameWon = false;
        this.currentRound++;
        this.sendGameUpdate()
    }

    override getWords(): void {
        if (this.selectedDifficulty) {
            this.gameService.getWordsByDifficulty(this.selectedDifficulty).subscribe({
                next: (words) => {
                    this.words = words.map((word: { word: any }) => word.word);

                    if (this.words.length >= 6) {

                        const allSelectedWords = this.getRandomWords(this.words, 6);
                        this.wordOptions = allSelectedWords.slice(0, 3); // 3 Wörter für den aktuellen Spieler
                        this.opponentWordOptions = allSelectedWords.slice(3, 6); // 3 unterschiedliche Wörter für den Gegner
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
        const wordOptionsMessage = {
            type: 'WORD_OPTIONS',
            selectedBy: this.username,
            opponentWordOptions: this.opponentWordOptions,
            lobbyCode: this.lobbyCode
        };
        this.websocketService.sendMessage(`/app/game/${this.lobbyCode}`, wordOptionsMessage);
    }

    selectWord(word: string) {
        if (this.isCurrentPlayer && !this.wordForOpponent) {
            this.wordForOpponent = word;
            this.wordSelectedBySelf = true;
            this.sendWordSelection();
            this.checkIfBothSelected();
            this.sendGameUpdate();
        }
    }

    private sendWordSelection() {
        const selectionMessage = {
            type: 'WORD_SELECTION',
            word: this.wordForOpponent,
            selectedBy: this.username,
            lobbyCode: this.lobbyCode
        };
        this.websocketService.sendMessage(`/app/game/${this.lobbyCode}`, selectionMessage);
    }

    private checkIfBothSelected() {
        if (this.wordSelectedBySelf && this.wordSelectedByOpponent) {
            // Beide Spieler haben gewählt, das Spiel kann fortgesetzt werden
            this.showWordSelection = false;
        }
    }

    override updateGameState(gameState: any) {
        console.log('Received game state update:', gameState);
        if (gameState) {
            this.currentRound = gameState.currentRound ?? this.currentRound;
            this.selectedRounds = gameState.selectedRounds ?? this.selectedRounds;
            this.selectedMode = gameState.selectedMode ?? this.selectedMode;
            this.rounds = gameState.rounds ?? this.rounds;
            if (gameState.type === 'WORD_SELECTION') {
                if (gameState.selectedBy !== this.username) {
                    this.word = gameState.word;
                    this.displayWord = Array(this.word.length).fill('_') as string[];
                    this.wordSelectedByOpponent = true;
                    this.checkIfBothSelected();
                }
            } else if (gameState.type === 'WORD_OPTIONS') {
                if (gameState.selectedBy !== this.username) {
                    this.wordOptions = gameState.opponentWordOptions;
                }
            }
        }
    }
}
