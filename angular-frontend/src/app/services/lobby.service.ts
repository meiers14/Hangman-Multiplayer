import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Lobby } from '../models/lobby';
import { Observable } from 'rxjs';
import { Difficulty } from '../models/difficulty.enum';

@Injectable({
  providedIn: 'root'
})
export class LobbyService {
  private apiUrl = 'http://localhost/api';

  constructor(private http: HttpClient) {}

  createLobby(lobby: Lobby): Observable<Lobby> {
    return this.http.post(`${this.apiUrl}/createLobby`, lobby, {});
  }

  joinLobby(lobby: Lobby): Observable<string> {
    return this.http.put<string>(`${this.apiUrl}/joinLobby`, lobby, { responseType: 'text' as 'json' });
  }
  

  getLobbyByCode(lobbyCode: string): Observable<Lobby> {
    const params = new HttpParams()
      .set('lobbyCode', lobbyCode)
    return this.http.get<Lobby>(`${this.apiUrl}/findLobbyByLobbyCode`, { params });
  }

  leaveLobby(lobbyCode: string, username: string): Observable<string> {
    const params = new HttpParams()
      .set('lobbyCode', lobbyCode)
      .set('playerName', username);
    return this.http.delete<string>(`${this.apiUrl}/removePlayer`, { params, responseType: 'text' as 'json' });
  }
}
