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

  override startNewRound() {
    // Zeige die Wortauswahl bei jeder neuen Runde an
    this.wordOptions = this.getHardcodedWords();
    this.showWordSelection = true;
    this.resetRoundState();
  }

  getHardcodedWords(): string[] {
    // Drei fest kodierte Wörter
    return ['APPLE', 'BANANA', 'CHERRY'];
  }

  selectWord(word: string) {
    this.word = word;
    this.displayWord = Array(this.word.length).fill('_') as string[];
    this.showWordSelection = false;
    this.sendGameUpdate();
  }

  private resetRoundState() {
    this.guessedLetters = [];
    this.remainingLives = 6;
    this.hangmanImage = 'assets/hangman0.png';
    this.gameOver = false;
    this.gameWon = false;
  }
}
