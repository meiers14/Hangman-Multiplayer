import { Component } from '@angular/core';
import { GameComponent } from '../game.component';

@Component({
  selector: 'app-challenge-arena',
  templateUrl: './challenge-arena.component.html',
  styleUrls: ['../game.component.css']
})
export class ChallengeArenaComponent extends GameComponent {
  showWordSelection: boolean = true;
  wordOptions: string[] = [];
  wordForOpponent?: string;
  wordSelectedByOpponent: boolean = false; // Trackt, ob der Gegner sein Wort ausgewählt hat
  wordSelectedBySelf: boolean = false; // Trackt, ob man selbst ein Wort für den Gegner ausgewählt hat

  override ngOnInit() {
    super.ngOnInit();
    this.startNewRound();
    this.websocketService.isConnected().subscribe(connected => {
      if (connected) {
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
    this.wordOptions = this.getHardcodedWords();
    this.showWordSelection = true; // Zeige die Wortauswahl an, bis beide Spieler gewählt haben
    this.wordSelectedBySelf = false; // Reset nach jeder Runde
    this.wordSelectedByOpponent = false; // Reset nach jeder Runde
    this.guessedLetters = [];
    this.remainingLives = 6;
    this.hangmanImage = 'assets/hangman0.png';
    this.gameOver = false;
    this.gameWon = false;
    this.currentRound++;
    this.sendGameUpdate();
  }

  override getWords(){}

  getHardcodedWords(): string[] {
    return ['APPLE', 'BANANA', 'CHERRY'];
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
      if (gameState.type === 'WORD_SELECTION') {
        if (gameState.selectedBy !== this.username) {
          // Gegner hat ein Wort ausgewählt
          this.word = gameState.word;
          this.displayWord = Array(this.word.length).fill('_') as string[];
          this.wordSelectedByOpponent = true;
          this.checkIfBothSelected();
          this.currentRound = gameState.currentRound ?? this.currentRound;
          this.selectedRounds = gameState.selectedRounds ?? this.selectedRounds;
          this.selectedMode = gameState.selectedMode ?? this.selectedMode;
          this.rounds = gameState.rounds ?? this.rounds;
        }
      } else {
        this.currentRound = gameState.currentRound ?? this.currentRound;
        this.selectedRounds = gameState.selectedRounds ?? this.selectedRounds;
        this.selectedMode = gameState.selectedMode ?? this.selectedMode;
        this.rounds = gameState.rounds ?? this.rounds;

      }
    }
  }
}
