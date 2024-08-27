import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedDataService } from '../services/shared-data.service';

// Models
import { Lobby } from '../models/lobby';
import { Difficulty } from '../models/difficulty.enum';
import { GameMode } from '../models/game-mode';
import { GameModeId } from '../models/game-mode-id.enum';
import { Player } from '../models/player';

// Services
import { LobbyService } from '../services/lobby.service';
import { WebsocketService } from '../services/websocket.service';

// Helper and Configs
import { DifficultyHelper } from '../helper/DifficultyHelper';
import { GAME_MODES } from '../configs/game-modes.config';

@Component({
    selector: 'app-lobby',
    templateUrl: './lobby.component.html',
    styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {
    // From Shared Data
    lobbyCode: string = '';
    username: string = '';

    // From Database
    lobby!: Lobby;
    players: Player[] = [];
    user!: Player;

    // From Config
    gameModes: GameMode[] = GAME_MODES;

    // Lobby Settings stored in Shared Data
    selectedDifficulty: Difficulty = Difficulty.MITTEL;
    DifficultyHelper = DifficultyHelper;
    selectedMode: GameMode = this.gameModes.find(mode => mode.id === GameModeId.DUELL_ROYALE)!;
    selectedRounds: number = 5;

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
                    this.handleLobbySettingsUpdate(update);
                });
    
                // Wenn der Spieler B der Lobby beitritt, fordert er die aktuellen Einstellungen von Spieler A an
                this.websocketService.sendMessage(`/app/game/${this.lobbyCode}`, {
                    action: 'request_settings'
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
    
        // Set local user and role
        if (this.username === this.players[0].name) {
            this.user = this.players[0];
        } else {
            this.user = this.players[1];
        }
    
        // Senden Sie die aktuellen Einstellungen über WebSocket, wenn Spieler A ist
        if (this.user.role === 'A') {
            this.websocketService.sendMessage(`/app/game/${this.lobbyCode}`, {
                action: 'update_settings',
                modeId: this.selectedMode.id,
                difficultyValue: DifficultyHelper.toNumber(this.selectedDifficulty),
                rounds: this.selectedRounds
            });
        }
    }
    

    handleLobbySettingsUpdate(update: any): void {
        console.log('Received update:', update);
    
        if (update.action === 'start') {
            // Weiterleitung für Spieler B basierend auf dem gewählten Spielmodus
            switch (update.modeId) {
                case GameModeId.DUELL_ROYALE:
                    this.router.navigate(['/game1'], { queryParams: { code: this.lobbyCode } });
                    break;
                case GameModeId.CHALLENGE_ARENA:
                    this.router.navigate(['/game2'], { queryParams: { code: this.lobbyCode } });
                    break;
                case GameModeId.KOOPERATIONSMISSION:
                    this.router.navigate(['/game3'], { queryParams: { code: this.lobbyCode } });
                    break;
                default:
                    console.error('Unbekannter Spielmodus:', update.modeId);
            }
        } else if (update.action === 'request_settings') {
            console.log('Received request_settings. Role:', this.user.role);
    
            if (this.user.role === 'A') {
                console.log('Player A is sending current settings...');
    
                // Spieler A sendet die aktuellen Einstellungen
                this.websocketService.sendMessage(`/app/game/${this.lobbyCode}`, {
                    action: 'update_settings',
                    modeId: this.selectedMode.id,
                    difficultyValue: DifficultyHelper.toNumber(this.selectedDifficulty),
                    rounds: this.selectedRounds
                });
            }
        } else if (update.action === 'update_settings') {
            console.log('Settings update received:', update);
    
            // Verarbeite das Update für den Spielmodus
            if (update.modeId !== undefined) {
                this.selectedMode = this.gameModes.find(mode => mode.id === update.modeId)!;
            }
    
            // Verarbeite das Update für die Schwierigkeit
            if (update.difficultyValue !== undefined) {
                this.selectedDifficulty = DifficultyHelper.fromNumber(update.difficultyValue);
            }
    
            // Verarbeite das Update für die Rundenanzahl
            if (update.rounds !== undefined) {
                this.selectedRounds = update.rounds;
            }
    
            console.log('Settings updated:', this.selectedMode, this.selectedDifficulty, this.selectedRounds);
        }
    }    
        
    updateMode(value: number): void {
        this.selectedMode = this.gameModes.find(m => m.id === value)!;
        this.sharedDataService.set('selectedMode', this.selectedMode);
    
        this.websocketService.sendMessage(`/app/game/${this.lobbyCode}`, {
            action: 'update_settings',
            modeId: this.selectedMode.id
        });
    }
    
    updateDifficulty(value: number): void {
        this.selectedDifficulty = DifficultyHelper.fromNumber(value);
        this.sharedDataService.set('selectedDifficulty', this.selectedDifficulty);
    
        this.websocketService.sendMessage(`/app/game/${this.lobbyCode}`, {
            action: 'update_settings',
            difficultyValue: DifficultyHelper.toNumber(this.selectedDifficulty)
        });
    }
    
    updateRounds(): void {
        this.sharedDataService.set('selectedRounds', this.selectedRounds);
    
        this.websocketService.sendMessage(`/app/game/${this.lobbyCode}`, {
            action: 'update_settings',
            rounds: this.selectedRounds
        });
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

    startGame(): void {
        // WebSocket-Nachricht senden
        this.websocketService.sendMessage(`/app/game/${this.lobbyCode}`, {
            action: 'start',
            modeId: this.selectedMode.id,
            difficultyValue: this.selectedDifficulty,
            rounds: this.selectedRounds
        });

        // Weiterleitung für Spieler A
        switch (this.selectedMode.id) {
            case GameModeId.DUELL_ROYALE:
                this.router.navigate(['/game1'], { queryParams: { code: this.lobbyCode } });
                break;
            case GameModeId.CHALLENGE_ARENA:
                this.router.navigate(['/game2'], { queryParams: { code: this.lobbyCode } });
                break;
            case GameModeId.KOOPERATIONSMISSION:
                this.router.navigate(['/game3'], { queryParams: { code: this.lobbyCode } });
                break;
        }
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
