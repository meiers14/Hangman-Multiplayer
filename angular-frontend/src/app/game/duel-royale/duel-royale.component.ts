import { Component } from '@angular/core';
import { GameComponent } from '../game.component';

@Component({
  selector: 'app-duel-royale',
  templateUrl: './duel-royale.component.html',
  styleUrls: ['../game.component.css']
})
export class DuelRoyaleComponent extends GameComponent {
  /**
   * Overrides the guessLetter method to include role-based round tracking
   * for a duel-style hangman game.
   * @param letter The guessed letter by the current player.
   */
  override guessLetter(letter: string) {
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
    } 
    else {
      this.remainingLives--;
      if (this.remainingLives <= 0) {
        this.remainingLives = 0;
        this.rounds[this.currentRound - 1] = this.user.role;
        this.gameOver = true;
      }
      this.updateHangmanImage();
      this.switchPlayer();
      this.sendGameUpdate();
    }
  }


  /**
   * Overrides the checkWin method to record the round's winner based on the player's role.
   */
  override checkWin() {
    if (this.displayWord.join('') === this.word) {
      this.gameWon = true;
      this.wins++;
      this.rounds[this.currentRound - 1] = this.user.role;
      this.switchPlayer();
      this.sendGameUpdate();
    }
  }
}
