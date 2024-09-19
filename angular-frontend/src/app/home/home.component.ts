import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedDataService } from '../services/shared-data.service';

// Models
import { Lobby } from '../models/lobby';
import { Difficulty } from '../models/difficulty.enum';
import { Player } from '../models/player';

// Services
import { LobbyService } from '../services/lobby.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  lobbyCode: string = '';
  username: string = '';

  constructor(
    private router: Router, 
    private lobbyService: LobbyService, 
    private snackBar: MatSnackBar, 
    private sharedDataService: SharedDataService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      if (code) {
        this.lobbyCode = code;
      }
    });
  }

  createLobby(): void {
    const lobby: Lobby = {
      playerA: {
        name: this.username,
        role: 'A'
      },
      lobbyDifficulty: Difficulty.MITTEL
    };

    this.lobbyService.createLobby(lobby).subscribe({
      next: (lobby: Lobby) => {

        if (lobby.lobbyCode) {
          this.lobbyCode = lobby.lobbyCode;

          this.sharedDataService.set('lobbyCode', this.lobbyCode);
          this.sharedDataService.set('username', this.username);

          this.router.navigate(['/lobby'], { queryParams: { code: this.lobbyCode} });
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
    const lobby: Lobby = {
      lobbyCode: this.lobbyCode,
      playerB: {
        name: this.username,
        role: 'B'
      }
    };

    this.lobbyService.joinLobby(lobby).subscribe({
      next: (response: string) => {
        this.sharedDataService.set('lobbyCode', this.lobbyCode);
        this.sharedDataService.set('username', this.username);

        this.router.navigate(['/lobby'], { queryParams: { code: this.lobbyCode} });
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
