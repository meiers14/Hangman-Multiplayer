import { Component, HostListener, OnInit } from '@angular/core';
import { WebSocketService } from '../services/game.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  alphabet: string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  guessedLetters: string[] = [];
  words: string[] = ['ANGULAR', 'TYPESCRIPT', 'COMPONENT', 'SERVICE', 'DIRECTIVE'];
  word: string = '';
  displayWord: string[] = [];
  remainingLives: number = 6;
  hangmanImage: string = 'assets/hangman0.png';
  gameOver: boolean = false;
  gameWon: boolean = false;
  currentRound: number = 1;
  maxRounds: number = 5;
  wins: number = 0;
  chatMessages: { sender: string, message: string, timestamp: string }[] = [];
  newMessage: string = '';

  constructor(private webSocketService: WebSocketService) { }

  ngOnInit() {
    this.startNewRound();

    this.webSocketService.messages$.subscribe(message => {
      const timestamp = new Date().toLocaleTimeString();
      this.chatMessages.push({ sender: 'Spieler', message: message.message, timestamp });
    });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if ((<HTMLElement>event.target).tagName === 'INPUT') {
      return;
    }
    const letter = event.key.toUpperCase();
    if (this.alphabet.includes(letter) && !this.guessedLetters.includes(letter) && !this.gameOver && !this.gameWon) {
      this.guessLetter(letter);
    }
  }

  @HostListener('window:keydown.enter', ['$event'])
  handleEnterKey(event: KeyboardEvent) {
    if ((<HTMLElement>event.target).tagName === 'INPUT') {
      this.sendMessage();
    } else if ((this.gameOver || this.gameWon) && this.currentRound <= this.maxRounds) {
      this.startNewRound();
    }
  }

  guessLetter(letter: string) {
    if (this.gameOver || this.gameWon) return;

    this.guessedLetters.push(letter);
    if (this.word.includes(letter)) {
      for (let i = 0; i < this.word.length; i++) {
        if (this.word[i] === letter) {
          this.displayWord[i] = letter;
        }
      }
      this.checkWin();
    } else {
      this.remainingLives--;
      if (this.remainingLives <= 0) {
        this.remainingLives = 0;
        this.gameOver = true;
      }
      this.updateHangmanImage();
    }
  }

  checkWin() {
    if (this.displayWord.join('') === this.word) {
      this.gameWon = true;
      this.wins++;
    }
  }

  updateHangmanImage() {
    const lifeStage = 6 - this.remainingLives;
    this.hangmanImage = `assets/hangman${lifeStage}.png`;
  }

  startNewRound() {
    if (this.currentRound > this.maxRounds) {
      this.gameOver = true;
      return;
    }

    this.guessedLetters = [];
    this.remainingLives = 6;
    this.hangmanImage = 'assets/hangman0.png';
    this.gameOver = false;
    this.gameWon = false;
    this.word = this.words[Math.floor(Math.random() * this.words.length)];
    this.displayWord = Array(this.word.length).fill('_');
    this.currentRound++;
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      this.webSocketService.sendMessage(this.newMessage);
      const timestamp = new Date().toLocaleTimeString();
      this.chatMessages.push({ sender: 'Spieler', message: this.newMessage, timestamp });
      this.newMessage = '';
    }
  }
}
