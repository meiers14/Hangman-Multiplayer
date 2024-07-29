import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private lobbies: { [key: string]: { players: string[]; maxPlayers: number } } = {
    'ABC123': { players: ['Alice'], maxPlayers: 2 },
    'XYZ789': { players: ['Bob', 'Charlie'], maxPlayers: 3 }
  };

  constructor() {}

  isLobbyCodeValid(lobbyCode: string): boolean {
    return this.lobbies.hasOwnProperty(lobbyCode);
  }

  isLobbyFull(lobbyCode: string): boolean {
    return this.lobbies[lobbyCode].players.length >= this.lobbies[lobbyCode].maxPlayers;
  }

  isUsernameTaken(lobbyCode: string, username: string): boolean {
    return this.lobbies[lobbyCode].players.includes(username);
  }

  generateLobbyCode(): string {
    return "TEST12"
  }
}
