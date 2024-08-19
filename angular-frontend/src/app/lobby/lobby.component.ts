import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedDataService } from '../shared-data.service';

// Models
import { Lobby } from '../models/lobby';
import { Difficulty } from '../models/difficulty.enum';

// Services
import { LobbyService } from '../services/lobby.service';
import { WebsocketService } from '../services/websocket.service';

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

    constructor(
        private router: Router,
        private lobbyService: LobbyService,
        private snackBar: MatSnackBar,
        private sharedDataService: SharedDataService,
        private websocketService: WebsocketService
    ) { }

    ngOnInit(): void {
        this.lobbyCode = this.sharedDataService.get('lobbyCode');
        this.username = this.sharedDataService.get('username');

        this.getLobby();

        this.websocketService.isConnected().subscribe(connected => {
            if (connected) {
                this.websocketService.subscribeToLobby(this.lobbyCode, (lobby: Lobby) => {
                    this.handleLobbyUpdate(lobby);
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
                this.handleLobbyUpdate(lobby);
            },
            error: (error) => {
                console.error('Fehler:', error);
                this.snackBar.open(error.error || 'Fehler beim Abrufen der Lobby', 'Schließen', { duration: 3000 });
            }
        });
    }

    handleLobbyUpdate(lobby: Lobby): void {
        console.log('Lobby updated:', lobby);
        
        // Set lobby
        this.lobby = lobby;

        // Set players
        this.players = [];
        if (this.lobby.playerA) {
            this.players.push(this.lobby.playerA);
        }
        if (this.lobby.playerB) {
            this.players.push(this.lobby.playerB);
        }

        // Set player role
        this.determineRole();

        // Set difficulty
        if (this.lobby.lobbyDifficulty) {
            this.selectedDifficultyValue = this.difficultyToNumber(this.lobby.lobbyDifficulty);
            this.updateDifficulty();
        }
    }

    determineRole(): void {
        if (this.lobby.playerA === this.username) {
            this.role = 'A';
        } else if (this.lobby.playerB === this.username) {
            this.role = 'B';
        }
    }

    difficultyToNumber(difficulty: Difficulty): number {
        // Cast difficulty object to number for slider
        switch (difficulty) {
            case Difficulty.LEICHT:
                return 0;
            case Difficulty.MITTEL:
                return 1;
            case Difficulty.SCHWER:
                return 2;
            default:
                return -1;
        }
    }

    updateDifficulty(): void {
        // Cast difficulty number to object, update locally
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

    copyLobbyCode(): void {
        // Copy lobby code into buffer
        navigator.clipboard.writeText(this.lobbyCode).then(() => {
            this.snackBar.open('Lobby-Code kopiert: ' + this.lobbyCode, 'Schließen', { duration: 3000 });
        });
    }

    copyInviteLink(): void {
        // Copy URL with lobby code for invitation
        const inviteLink = `${window.location.origin}/?code=${this.lobbyCode}`;
        navigator.clipboard.writeText(inviteLink).then(() => {
            this.snackBar.open('Einladungslink kopiert: ' + inviteLink, 'Schließen', { duration: 3000 });
        });
    }    

    selectMode(mode: string): void {
        this.selectedMode = mode;
    }

    startGame(): void {
        this.confirmDifficultyChange();
        
        // Navigate to Game Component
        this.router.navigate(['/game'], { queryParams: { code: this.lobbyCode } });

    }

    confirmDifficultyChange(): void {
        // API call updates difficulty in database
        this.lobbyService.updateDifficulty(this.lobbyCode, this.difficulty).subscribe({
            next: (response: string) => {
                console.log(response);
                this.snackBar.open(response, 'Schließen', { duration: 3000 });
            },
            error: (error) => {
                console.error('Fehler:', error);
                this.snackBar.open(error.error || 'Fehler beim Aktualisieren der Schwierigkeit', 'Schließen', { duration: 3000 });
            }
        });
    }

    leaveLobby(): void {
        // API call removes player from current lobby, deletes lobby if no players after
        this.lobbyService.leaveLobby(this.lobbyCode, this.username).subscribe({
            next: (response: string) => {
                console.log(response);

                // Navigates back to Home Component
                this.router.navigate(['/']);
                this.snackBar.open(response, 'Schließen', { duration: 3000 });
            },
            error: (error) => {
                console.error('Fehler:', error);
                this.snackBar.open(error.error || 'Fehler beim Verlassen der Lobby', 'Schließen', { duration: 3000 });
            }
        });
    }
}
