import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LobbyService } from '../services/lobby.service';
import { Lobby } from '../models/lobby';
import { Difficulty } from '../models/difficulty.enum';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedDataService } from '../shared-data.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {
  // Shared Data
  lobbyCode: string = '';
  username: string = '';

  // Database
  lobby!: Lobby;
  difficulty!: Difficulty;
  players: string[] = [];

  // Frontend Component
  role: string = '';
  selectedDifficultyValue!: number;
  selectedDifficultyLabel: string = '';
  selectedMode: string = '';

  gameModes = [
    {
      name: 'Hangman Duell Royale',
      description: 'Tritt gegen andere Spieler an und sammle Punkte in mehreren Runden. Der Spieler mit den meisten Punkten gewinnt.',
      image: 'assets/hangman6.png'
    },
    {
      name: 'Hangman Challenge Arena',
      description: 'Wähle schwierige Wörter für deinen Gegner und versuche als erster, die erforderliche Punktzahl zu erreichen.',
      image: 'assets/hangman6.png'
    },
    {
      name: 'Hangman Kooperationsmission',
      description: 'Arbeite mit anderen Spielern zusammen, um Wörter zu erraten und sammle gemeinsam Punkte, um das Spiel zu gewinnen.',
      image: 'assets/hangman6.png'
    }
  ];

  constructor(private router: Router, private lobbyService: LobbyService, private snackBar: MatSnackBar, private sharedDataService: SharedDataService) { }

  ngOnInit(): void {
    this.lobbyCode = this.sharedDataService.get('lobbyCode');
    this.username = this.sharedDataService.get('username');
    this.getLobby();
  }

  getLobby(): void {
    this.lobbyService.getLobbyByCode(this.lobbyCode).subscribe({
      next: (lobby: Lobby) => {
        // On refreshing the page
        if (!lobby || lobby === null) {
          this.router.navigate(['/']);
          throw new Error('Lobby ist null oder nicht gefunden');
        }

        console.log(lobby);
        this.lobby = lobby;

        if (this.lobby.playerA && this.lobby.playerA != '') {
          this.players.push(this.lobby.playerA);
        }
        if (this.lobby.playerB && this.lobby.playerB.trim() != '') {
          this.players.push(this.lobby.playerB);
        }

        this.determineRole();

        if (lobby.lobbyDifficulty) {
          this.selectedDifficultyValue = this.difficultyToNumber(lobby.lobbyDifficulty);
        }
        this.updateDifficulty();
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

  determineRole(): void {
    if (this.lobby.playerA === this.username) {
      this.role = 'A';
    } else if (this.lobby.playerB === this.username) {
      this.role = 'B';
    }
  }

  difficultyToNumber(difficulty: Difficulty): number {
    switch (difficulty) {
      case Difficulty.LEICHT:
        return 0;
      case Difficulty.MITTEL:
        return 1;
      case Difficulty.SCHWER:
        return 2;
    }
  }

  updateDifficulty(): void {
    switch (this.selectedDifficultyValue) {
      case 0:
        this.selectedDifficultyLabel = 'LEICHT';
        this.difficulty = Difficulty.LEICHT;
        break;
      case 1:
        this.selectedDifficultyLabel = 'MITTEL';
        this.difficulty = Difficulty.MITTEL;
        break;
      case 2:
        this.selectedDifficultyLabel = 'SCHWER';
        this.difficulty = Difficulty.SCHWER;
        break;
      default:
        this.selectedDifficultyLabel = '';
        break;
    }
    console.log(this.difficulty);
  }

  copyLobbyCode() {
    navigator.clipboard.writeText(this.lobbyCode).then(() => {
      this.snackBar.open('Lobby-Code kopiert: ' + this.lobbyCode, 'Schließen', { duration: 3000 });
    });
  }

  // copyInviteLink() {
  //   const inviteLink = `${window.location.origin}/${this.lobbyCode}`;
  //   navigator.clipboard.writeText(inviteLink).then(() => {
  //     alert('Einladungslink kopiert: ' + inviteLink);
  //   });
  // }

  selectMode(mode: string) {
    this.selectedMode = mode;
  }

  startGame(): void {
    // if (this.selectedMode && this.players.length >= 2) {
    //   this.confirmDifficultyChange();
    // }
    this.confirmDifficultyChange();
    this.router.navigate(['/game']);
  }

  confirmDifficultyChange(): void {
    this.lobbyService.updateDifficulty(this.lobbyCode, this.difficulty).subscribe({
      next: (response: string) => {
        console.log(response);
        this.snackBar.open(response, 'Schließen', { duration: 3000 });
      },
      error: (error) => {
        console.error('Fehler:', error);
        if (error.error) {
          this.snackBar.open(error.error, 'Schließen', { duration: 3000 });
        } else {
          this.snackBar.open('Fehler beim Beitreten der Lobby', 'Schließen', { duration: 3000 });
        }
      }
    });
  }

  leaveLobby() {
    this.lobbyService.leaveLobby(this.lobbyCode, this.username).subscribe({
      next: (response: string) => {
        console.log(response);
        this.router.navigate(['/']);
        this.snackBar.open(response, 'Schließen', { duration: 3000 });
      },
      error: (error) => {
        console.error('Fehler:', error);
        if (error.error) {
          this.snackBar.open(error.error, 'Schließen', { duration: 3000 });
        } else {
          this.snackBar.open('Fehler beim Beitreten der Lobby', 'Schließen', { duration: 3000 });
        }
      }
    });
  }
}
