import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Models
import { Word } from '../models/word';
import { Difficulty } from '../models/difficulty.enum';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiUrl = 'http://localhost/api';

  constructor(private http: HttpClient) { }

  getWordsByDifficulty(difficulty: Difficulty): Observable<Word[]> {
    const params = new HttpParams().set('wordDifficulty', difficulty.toString());
    return this.http.get<Word[]>(`${this.apiUrl}/findWordsByDifficulty`, { params });
  }
}
