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


  override startNewRound() {
    if (this.isCurrentPlayer && !this.wordForOpponent) {
      this.wordOptions = this.getHardcodedWords();
      this.showWordSelection = true;
    } else {
      this.showWordSelection = false;
    }
    this.resetRoundState();
  }


  getHardcodedWords(): string[] {
    // Drei fest kodierte Wörter
    return ['APPLE', 'BANANA', 'CHERRY'];
  }

  selectWord(word: string) {
    if (this.isCurrentPlayer) {
      // Spieler kann nur das Wort für den Gegner auswählen, nicht für sich selbst
      this.wordForOpponent = word;
      this.showWordSelection = false;
      this.sendWordSelection();
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

  private resetRoundState() {
    this.guessedLetters = [];
    this.remainingLives = 6;
    this.hangmanImage = 'assets/hangman0.png';
    this.gameOver = false;
    this.gameWon = false;
  }

  override updateGameState(gameState: any) {
    console.log('Received game state update:', gameState);
    if (gameState) {
      if (gameState.type === 'WORD_SELECTION') {
        // Wenn der andere Spieler ein Wort auswählt
        if (gameState.selectedBy !== this.username) {
          // Das Wort des anderen Spielers wird als eigenes Wort gesetzt
          this.word = gameState.word;
          this.displayWord = Array(this.word.length).fill('_') as string[];
          this.showWordSelection = false;
        }
      } else {
        this.word = gameState.word ?? this.word;
        this.displayWord = gameState.displayWord ?? this.displayWord;
        this.remainingLives = gameState.remainingLives ?? this.remainingLives;
        this.gameOver = gameState.gameOver ?? this.gameOver;
        this.gameWon = gameState.gameWon ?? this.gameWon;
        this.currentRound = gameState.currentRound ?? this.currentRound;
        this.selectedRounds = gameState.selectedRounds ?? this.selectedRounds;
        this.currentPlayer = gameState.currentPlayer ?? this.currentPlayer;
        this.selectedMode = gameState.selectedMode ?? this.selectedMode;
        this.rounds = gameState.rounds ?? this.rounds;
        this.isCurrentPlayer = (this.username === this.currentPlayer?.name);
        //update hangman image vom anderen in der spiegelansicht
      }
    }
  }

}
