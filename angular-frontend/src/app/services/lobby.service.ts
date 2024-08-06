import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Lobby } from '../models/lobby';
import { Observable } from 'rxjs';
import { Difficulty } from '../models/difficulty.enum';

@Injectable({
  providedIn: 'root'
})
export class LobbyService {
  private apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  getLobbyByCode(lobbyCode: string): Observable<Lobby> {
    const params = new HttpParams()
      .set('lobbyCode', lobbyCode)
    return this.http.get<Lobby>(`${this.apiUrl}/findLobbyByLobbyCode`, { params });
  }

  updateDifficulty(lobbyCode: string, selectedDifficulty: Difficulty): Observable<string> {
    const params = new HttpParams()
      .set('lobbyCode', lobbyCode)
      .set('lobbyDifficulty', selectedDifficulty.toString());
    return this.http.put<string>(`${this.apiUrl}/updateDifficulty`, {}, { params, responseType: 'text' as 'json' });
  }

  leaveLobby(lobbyCode: string, username: string): Observable<string> {
    const params = new HttpParams()
      .set('lobbyCode', lobbyCode)
      .set('playerName', username);
    return this.http.delete<string>(`${this.apiUrl}/removePlayer`, { params, responseType: 'text' as 'json' });
  }
}
