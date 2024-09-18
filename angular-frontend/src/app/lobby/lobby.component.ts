import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedDataService } from '../services/shared-data.service';
import { Lobby } from '../models/lobby';
import { Difficulty } from '../models/difficulty.enum';
import { GameMode } from '../models/game-mode';
import { GameModeId } from '../models/game-mode-id.enum';
import { Player } from '../models/player';
import { LobbyService } from '../services/lobby.service';
import { WebsocketService } from '../services/websocket.service';
import { DifficultyHelper } from '../helper/DifficultyHelper';
import { GAME_MODES } from '../configs/game-modes.config';

@Component({
    selector: 'app-lobby',
    templateUrl: './lobby.component.html',
    styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {
    lobbyCode: string = '';
    username: string = '';
    lobby!: Lobby;
    players: Player[] = [];
    user!: Player;
    gameModes: GameMode[] = GAME_MODES;
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

                this.websocketService.sendMessage(`/app/game/${this.lobbyCode}`, {
                    action: 'request_settings'
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
                this.handleLobbyUpdate(lobby);
            },
            error: (error) => {
                console.error('Fehler:', error);
                this.snackBar.open(error.error || 'Fehler beim Abrufen der Lobby', 'Schließen', { duration: 3000 });
            }
        });
    }

    handleLobbyUpdate(lobby: Lobby): void {
        this.lobby = lobby;
        this.players = [];

        if (this.lobby.playerA) {
            this.players.push(this.lobby.playerA);
        }
        if (this.lobby.playerB) {
            this.players.push(this.lobby.playerB);
        }

        if (this.username === this.players[0].name) {
            this.user = this.players[0];
        } else {
            this.user = this.players[1];
        }

        if (this.user.role === 'A') {
            this.websocketService.sendMessage(`/app/game/${this.lobbyCode}`, {
                action: 'update_settings',
                modeId: this.selectedMode.id,
                difficultyValue: DifficultyHelper.toNumber(this.selectedDifficulty),
                selectedRounds: this.selectedRounds
            });
        }
    }
    

    handleLobbySettingsUpdate(update: any): void {
    
        if (update.action === 'start') {
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
    
            if (this.user.role === 'A') {
                this.websocketService.sendMessage(`/app/game/${this.lobbyCode}`, {
                    action: 'update_settings',
                    modeId: this.selectedMode.id,
                    difficultyValue: DifficultyHelper.toNumber(this.selectedDifficulty),
                    selectedRounds: this.selectedRounds
                });
            }
        } else if (update.action === 'update_settings') {

            if (update.modeId !== undefined) {
                this.selectedMode = this.gameModes.find(mode => mode.id === update.modeId)!;
            }

            if (update.difficultyValue !== undefined) {
                this.selectedDifficulty = DifficultyHelper.fromNumber(update.difficultyValue);
            }

            if (update.selectedRounds !== undefined) {
                this.selectedRounds = update.selectedRounds;
            }
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
            selectedRounds: this.selectedRounds
        });
    }
    
    
    copyLobbyCode(): void {
        navigator.clipboard.writeText(this.lobbyCode).then(() => {
            this.snackBar.open('Lobby-Code kopiert: ' + this.lobbyCode, 'Schließen', { duration: 3000 });
        });
    }

    copyInviteLink(): void {
        const inviteLink = `${window.location.origin}/?code=${this.lobbyCode}`;
        navigator.clipboard.writeText(inviteLink).then(() => {
            this.snackBar.open('Einladungslink kopiert: ' + inviteLink, 'Schließen', { duration: 3000 });
        });
    }

    startGame(): void {
        this.updateDifficulty(DifficultyHelper.toNumber(this.selectedDifficulty));
        this.updateRounds();
        this.websocketService.sendMessage(`/app/game/${this.lobbyCode}`, {
            action: 'start',
            modeId: this.selectedMode.id,
            difficultyValue: DifficultyHelper.toNumber(this.selectedDifficulty),
            selectedRounds: this.selectedRounds
        });

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

    /**
     * Leaves the lobby and navigates to the home page.
     */
    leaveLobby(): void {
        this.lobbyService.leaveLobby(this.lobbyCode, this.username).subscribe({
            next: (response: string) => {
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
