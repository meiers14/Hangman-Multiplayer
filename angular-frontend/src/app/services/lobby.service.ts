import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LobbyService {
  private difficulty: number = 2;

  constructor() { }

  getDifficulty(): number {
    return this.difficulty;
  }

  setDifficulty(difficulty: number): void {
    this.difficulty = difficulty;
  }
}
