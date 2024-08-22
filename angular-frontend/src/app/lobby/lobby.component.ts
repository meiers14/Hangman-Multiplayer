import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedDataService } from '../services/shared-data.service';

// Models
import { Lobby } from '../models/lobby';
import { Difficulty } from '../models/difficulty.enum';
import { GameMode } from '../models/game-mode';

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

    // User Role
    role: string = '';

    // Lobby Settings
    selectedDifficultyValue!: number;
    selectedDifficultyLabel: string = '';
    selectedMode: any;

    // Game Modes
    gameModes: GameMode[] = [
        {
            id: 1,
            name: 'Hangman Duell Royale',
            description: 'Tritt gegen andere Spieler an und sammle Punkte in mehreren Runden. Der Spieler mit den meisten Punkten gewinnt.',
            image: 'assets/hangman6.png'
        },
        {
            id: 2,
            name: 'Hangman Challenge Arena',
            description: 'Wähle schwierige Wörter für deinen Gegner und versuche als erster, die erforderliche Punktzahl zu erreichen.',
            image: 'assets/hangman6.png'
        },
        {
            id: 3,
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

                this.websocketService.subscribeToGame(this.lobbyCode, (update: any) => {
                    this.handleGameSettingsUpdate(update);
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

        // Setze die Lobby-Daten
        this.lobby = lobby;

        // Setze die Spieler
        this.players = [];
        if (this.lobby.playerA) {
            this.players.push(this.lobby.playerA);
        }
        if (this.lobby.playerB) {
            this.players.push(this.lobby.playerB);
        }

        // Setze die Spielerrolle
        this.determineRole();

        // Setze den Spielmodus
        this.selectMode(2);

        // Setze die Schwierigkeit basierend auf den Lobby-Daten
        if (lobby.lobbyDifficulty) {
            this.difficulty = lobby.lobbyDifficulty;
            this.selectedDifficultyValue = this.difficultyToNumber(this.difficulty);
            this.selectedDifficultyLabel = this.difficultyToLabel(this.difficulty);
        } else {
            // Wenn keine Schwierigkeit gesetzt ist, setze einen Standardwert
            this.selectedDifficultyValue = 2;
            this.difficulty = Difficulty.MITTEL;
            this.selectedDifficultyLabel = 'MITTEL';
        }
    }

    handleGameSettingsUpdate(update: any): void {
        if (update.action === 'start') {
            // Weiterleitung für Spieler B
            switch (update.modeId) {
                case 1:
                    this.router.navigate(['/game1'], { queryParams: { code: this.lobbyCode } });
                    break;
                case 2:
                    this.router.navigate(['/game2'], { queryParams: { code: this.lobbyCode } });
                    break;
                case 3:
                    this.router.navigate(['/game3'], { queryParams: { code: this.lobbyCode } });
                    break;
            }
        } else {
            if (update.modeId !== undefined) {
                this.selectedMode = this.gameModes.find(mode => mode.id === update.modeId);
            }
            if (update.difficulty !== undefined) {
                console.log('Empfangene Schwierigkeit:', update.difficulty);

                if (update.difficultyValue !== undefined && update.difficultyLabel !== undefined) {
                    this.selectedDifficultyValue = update.difficultyValue;
                    this.selectedDifficultyLabel = update.difficultyLabel;
                    this.difficulty = update.difficulty;
                } else {
                    console.error('Fehlende Werte für Schwierigkeit in der Nachricht:', update);
                }
            }
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
                return 1;
            case Difficulty.MITTEL:
                return 2;
            case Difficulty.SCHWER:
                return 3;
        }
    }

    difficultyToLabel(difficulty: Difficulty): string {
        switch (difficulty) {
            case Difficulty.LEICHT:
                return 'LEICHT';
            case Difficulty.MITTEL:
                return 'MITTEL';
            case Difficulty.SCHWER:
                return 'SCHWER';
            default:
                return 'UNBEKANNT';
        }
    }

    updateDifficulty(): void {
        switch (this.selectedDifficultyValue) {
            case 1:
                this.selectedDifficultyLabel = 'LEICHT';
                this.difficulty = Difficulty.LEICHT;
                break;
            case 2:
                this.selectedDifficultyLabel = 'MITTEL';
                this.difficulty = Difficulty.MITTEL;
                break;
            case 3:
                this.selectedDifficultyLabel = 'SCHWER';
                this.difficulty = Difficulty.SCHWER;
                break;
        }
        console.log(this.difficulty);

        if (this.role === 'A') {
            this.websocketService.sendMessage(`/app/game/${this.lobbyCode}`, {
                difficultyValue: this.selectedDifficultyValue,
                difficultyLabel: this.selectedDifficultyLabel,
                difficulty: this.difficulty
            });
        }
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

    selectMode(modeId: number): void {
        if (this.role === 'A') {
            this.selectedMode = this.gameModes.find(mode => mode.id === modeId);
            this.sharedDataService.set('selectedMode', this.selectedMode);

            // Nachricht über WebSocket senden
            this.websocketService.sendMessage(`/app/game/${this.lobbyCode}`, {
                modeId: modeId
            });
        }
    }

    startGame(): void {
        this.confirmDifficultyChange();

        // WebSocket-Nachricht senden
        this.websocketService.sendMessage(`/app/game/${this.lobbyCode}`, {
            action: 'start',
            modeId: this.selectedMode.id,
            difficultyValue: this.selectedDifficultyValue
        });

        // Weiterleitung für Spieler A
        switch (this.selectedMode.id) {
            case 1:
                this.router.navigate(['/game1'], { queryParams: { code: this.lobbyCode } });
                break;
            case 2:
                this.router.navigate(['/game2'], { queryParams: { code: this.lobbyCode } });
                break;
            case 3:
                this.router.navigate(['/game3'], { queryParams: { code: this.lobbyCode } });
                break;
        }
    }


    confirmDifficultyChange(): void {
        if (!this.difficulty) {
            console.error('Schwierigkeit ist nicht gesetzt.');
            this.snackBar.open('Fehler: Schwierigkeit nicht gesetzt.', 'Schließen', { duration: 3000 });
            return;
        }

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
