import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  playerName: string = '';
  lobbyCode: string = '';
  otherPlayerName: string = '';
  players: string[] = []; // Beispiel für ngFor

  validatePlayerName() : boolean {
    // Returns true if the entered username is unique
    return this.playerName != this.otherPlayerName;
  }

  joinFriend() {}

  createNewGame() {}
}
