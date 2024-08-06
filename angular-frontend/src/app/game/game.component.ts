import { Component, HostListener, OnInit } from '@angular/core';
import { GameService } from '../services/game.service';
import { Lobby } from '../models/lobby';
import { Difficulty } from '../models/difficulty.enum';
import { LobbyService } from '../services/lobby.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedDataService } from '../shared-data.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  lobbyCode: string = '';
  username: string = '';

  lobby!: Lobby;
  difficulty!: Difficulty;
  players: string[] = [];

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

  constructor(
      private router: Router,
      private lobbyService: LobbyService,
      private snackBar: MatSnackBar,
      private sharedDataService: SharedDataService,
      private gameService: GameService
  ) {}

  ngOnInit() {
    this.lobbyCode = this.sharedDataService.get('lobbyCode');
    this.username = this.sharedDataService.get('username');
    this.getLobby();

    this.startNewRound();

    this.gameService.isConnected().subscribe(connected => {
      if (connected) {
        this.gameService.subscribe(this.lobbyCode, (message) => {
          console.log(`Message received for lobby code: ${this.lobbyCode}`); // Konsolenausgabe für den Lobby-Code
          const timestamp = new Date().toLocaleTimeString();
          this.chatMessages.push({
            sender: message.username || 'Unknown',
            message: message.message,
            timestamp
          });
        });
      }
    });
  }

  getLobby(): void {
    this.lobbyService.getLobbyByCode(this.lobbyCode).subscribe({
      next: (lobby: Lobby) => {
        if (!lobby || lobby === null) {
          this.router.navigate(['/']);
          throw new Error('Lobby ist null oder nicht gefunden');
        }

        this.lobby = lobby;

        if (this.lobby.playerA && this.lobby.playerA != '') {
          this.players.push(this.lobby.playerA);
        }
        if (this.lobby.playerB && this.lobby.playerB.trim() != '') {
          this.players.push(this.lobby.playerB);
        }

        if (lobby.lobbyDifficulty) {
          this.difficulty = lobby.lobbyDifficulty;
        }
      },
      error: (error) => {
        console.error('Fehler:', error);
        if (error.error) {
          this.snackBar.open(error.error, 'Schließen', { duration: 3000 });
        } else {
          this.snackBar.open('Fehler beim Abrufen der Lobby', 'Schließen', { duration: 3000 });
        }
      }
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
      const chatMessage = {
        username: this.username,
        message: this.newMessage,
        lobbyCode: this.lobbyCode
      };
      console.log(`Sending message to lobby code: ${this.lobbyCode}`, chatMessage); // Debugging-Ausgabe
      this.gameService.sendMessage('/app/send', chatMessage);
      this.newMessage = '';
    }
  }


  leaveGame() {
    this.router.navigate(['/lobby']);
  }
}
