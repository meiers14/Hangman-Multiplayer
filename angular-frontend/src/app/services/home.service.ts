import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Lobby } from '../models/lobby';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  createLobby(lobby: Lobby): Observable<Lobby> {
    return this.http.post(`${this.apiUrl}/createLobby`, lobby, {});
  }

  joinLobby(lobbyCode: string, playerB: string): Observable<string> {
    const params = new HttpParams()
      .set('lobbyCode', lobbyCode)
      .set('playerB', playerB);
    return this.http.put(`${this.apiUrl}/joinLobby`, {}, { params, responseType: 'text' });
  }
}
