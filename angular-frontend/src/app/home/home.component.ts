import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HomeService } from '../services/home.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Lobby } from '../models/lobby';
import { Difficulty } from '../models/difficulty.enum';
import { SharedDataService } from '../shared-data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  // Shared Data
  lobbyCode: string = '';
  username: string = '';

  constructor(private router: Router, private homeService: HomeService, private snackBar: MatSnackBar, private sharedDataService: SharedDataService) { }

  createLobby(): void {
    const lobby: Lobby = {
      playerA: this.username,
      lobbyDifficulty: Difficulty.MITTEL
    };

    this.homeService.createLobby(lobby).subscribe({
      next: (lobby: Lobby) => {
        console.log(lobby);
        if (lobby.lobbyCode) {
          this.lobbyCode = lobby.lobbyCode;
          this.sharedDataService.set('lobbyCode', this.lobbyCode);
          this.sharedDataService.set('username', this.username);
          this.router.navigate(['/lobby'], { state: { lobbyCode: this.lobbyCode, username: this.username } });
          this.snackBar.open('Neue Lobby erfolgreich erstellt', 'Schließen', { duration: 3000 });
        }
      },
      error: (error) => {
        console.error('Fehler:', error);
        if (error.error) {
          this.snackBar.open(error.error, 'Schließen', { duration: 3000 });
        } else {
          this.snackBar.open('Fehler beim Erstellen der Lobby', 'Schließen', { duration: 3000 });
        }
      }
    });
  }

  joinLobby(): void {
    this.homeService.joinLobby(this.lobbyCode, this.username).subscribe({
      next: (response: string) => {
        console.log(response);
        this.sharedDataService.set('lobbyCode', this.lobbyCode);
        this.sharedDataService.set('username', this.username);
        this.router.navigate(['/lobby']);
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
