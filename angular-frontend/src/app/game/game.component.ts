import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedDataService } from '../services/shared-data.service';

// Models
import { Lobby } from '../models/lobby';
import { Difficulty } from '../models/difficulty.enum';
import { GameMode } from '../models/game-mode';
import { Player } from '../models/player';

// Services
import { LobbyService } from '../services/lobby.service';
import { GameService } from '../services/game.service';
import { WebsocketService } from '../services/websocket.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  // Shared Data
  lobbyCode: string = '';
  username: string = '';
  selectedMode!: GameMode;

  // Database
  lobby!: Lobby;
  difficulty: Difficulty = Difficulty.MITTEL;
  players!: Player[];
  user!: Player;
  words!: string[];

  // Game 
  alphabet: string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  guessedLetters!: string[];

  word!: string;
  displayWord!: string[];
  
  remainingLives: number = 6;
  hangmanImage: string = 'assets/hangman0.png';

  gameOver: boolean = false;
  gameWon: boolean = false;

  currentPlayer!: Player;
  isCurrentPlayer: boolean = false;

  currentRound: number = 1;
  maxRounds: number = 5;
  rounds!: string[];

  wins: number = 0;

  // Chat 
  chatMessages: { sender: string, message: string, timestamp: string }[] = [];
  newMessage: string = '';

  constructor(
      private router: Router,
      private lobbyService: LobbyService,
      private gameService: GameService,
      private snackBar: MatSnackBar,
      private sharedDataService: SharedDataService,
      private websocketService: WebsocketService
  ) {}

  ngOnInit() {
    this.lobbyCode = this.sharedDataService.get('lobbyCode');
    this.username = this.sharedDataService.get('username');
    this.selectedMode = this.sharedDataService.get('selectedMode');

    this.rounds = Array(this.maxRounds).fill(null);
    
    this.currentRound = 1;

    this.getLobby();
    this.startNewRound();

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

  getLobby(): void {
    // API call returns Lobby object
    this.lobbyService.getLobbyByCode(this.lobbyCode).subscribe({
      next: (lobby: Lobby) => {
        if (!lobby || lobby === null) {
          // Navigate to Home Component if no lobby object was found
          this.router.navigate(['/']);
          throw new Error('Lobby ist null oder nicht gefunden');
        }
        // Set local variables
        this.lobby = lobby;
        if (lobby.playerA != null && lobby.playerB != null) {
          this.players = [lobby.playerA, lobby.playerB];
        }
        if (lobby.lobbyDifficulty) {
          this.difficulty = lobby.lobbyDifficulty;
        }
        
        this.getWords();

        // Set local user
        if (this.username === this.players[0].name) {
          this.user = this.players[0];
        }
        else {
          this.user = this.players[1];
        }

         // Set player A as current player
         this.currentPlayer = this.user
         this.isCurrentPlayer = (this.user === this.currentPlayer);
      },
      error: (error) => {
        console.error('Fehler:', error);
        this.snackBar.open('Fehler beim Abrufen der Lobby', 'Schließen', { duration: 3000 });
      }
    });
  }

  getWords(): void {
    this.gameService.getWordsByDifficulty(this.difficulty).subscribe({
      next: (words) => {
        this.words = words.map((word: { word: any}) => word.word);
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
  }


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

  @HostListener('window:keydown.enter', ['$event'])
  handleEnterKey(event: KeyboardEvent) {
    if ((<HTMLElement>event.target).tagName === 'INPUT') {
      this.sendMessage();
    } else if ((this.gameOver || this.gameWon) && this.currentRound <= this.maxRounds) {
      this.startNewRound();
    }
  }

  guessLetter(letter: string) {
    if (!this.isCurrentPlayer || this.gameOver || this.gameWon) return;

    this.guessedLetters.push(letter);
    if (this.word.includes(letter)) {
      // Display guessed letter if it is correct
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
      // Game is over if no lives remain befor finish guessing the word
      if (this.remainingLives <= 0) {
        this.remainingLives = 0;
        this.gameOver = true;
      }
      this.updateHangmanImage();
      this.switchPlayer();
      this.sendGameUpdate();
    }
  }


  checkWin() {
    if (this.displayWord.join('') === this.word) {
      this.gameWon = true;
      this.wins++;
      this.rounds[this.currentRound - 1] = this.user.role;
      this.switchPlayer();
      this.sendGameUpdate();
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
    console.log(this.word);
    this.displayWord = Array(this.word.length).fill('_') as string[];
    this.currentRound++;
    this.sendGameUpdate();
  }

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

  leaveGame() {
    this.router.navigate(['/lobby'], { queryParams: { code: this.lobbyCode } });

  }

  private sendGameUpdate() {
    const gameState = {
      word: this.word,
      displayWord: this.displayWord,
      remainingLives: this.remainingLives,
      gameOver: this.gameOver,
      gameWon: this.gameWon,
      currentRound: this.currentRound,
      maxRounds: this.maxRounds,
      guessedLetters: this.guessedLetters,
      currentPlayer: this.currentPlayer,
      selectedMode: this.selectedMode
    };
    this.websocketService.sendMessage(`/app/game/${this.lobbyCode}`, gameState);
  }

  private updateGameState(gameState: any) {
    if (gameState) {
      this.word = gameState.word || this.word;
      this.displayWord = gameState.displayWord || this.displayWord;
      this.remainingLives = gameState.remainingLives !== undefined ? gameState.remainingLives : this.remainingLives;
      this.gameOver = gameState.gameOver !== undefined ? gameState.gameOver : this.gameOver;
      this.gameWon = gameState.gameWon !== undefined ? gameState.gameWon : this.gameWon;
      this.currentRound = gameState.currentRound !== undefined ? gameState.currentRound : this.currentRound;
      this.maxRounds = gameState.maxRounds !== undefined ? gameState.maxRounds : this.maxRounds;
      this.guessedLetters = gameState.guessedLetters || this.guessedLetters;
      this.currentPlayer = gameState.currentPlayer || this.currentPlayer;
      this.selectedMode = gameState.selectedMode || this.selectedMode;
      this.isCurrentPlayer = (this.username === this.currentPlayer.name);
      this.updateHangmanImage();
    }
  }

  private switchPlayer() {
    this.currentPlayer = this.players.find(player => player.name !== this.currentPlayer.name) || this.currentPlayer;
    this.isCurrentPlayer = (this.username === this.currentPlayer.name);
  }
}
