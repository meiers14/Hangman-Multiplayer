import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { HomeService } from '../services/home.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  username: string = '';
  lobbyCode: string = '';
  errorMessages: string[] = [];

  constructor(private router: Router, private homeService: HomeService) {}

  joinGame(form: NgForm) {
    this.errorMessages = [];
    if (form.valid) {
      if (this.validateJoinGame()) {
        // Logik für das Beitreten eines Spiels
        console.log("Joining game...");
        this.router.navigate(['/game'], { queryParams: { username: this.username, lobbyCode: this.lobbyCode } });
      }
    } else {
      form.controls['lobbyCode'].markAsTouched();
    }
  }

  createGame() {
    // Logik für das Erstellen eines neuen Spiels
    console.log("Creating game...");
    this.router.navigate(['/game'], { queryParams: { username: this.username } });
  }

  validateJoinGame(): boolean {
    if (!this.homeService.isLobbyCodeValid(this.lobbyCode)) {
      this.errorMessages.push("Der eingegebene Lobby-Code existiert nicht.");
      return false;
    }

    if (this.homeService.isLobbyFull(this.lobbyCode)) {
      this.errorMessages.push("Die Lobby ist bereits voll.");
      return false;
    }

    if (this.homeService.isUsernameTaken(this.lobbyCode, this.username)) {
      this.errorMessages.push("Der Benutzername ist bereits in der Lobby vorhanden.");
      return false;
    }

    return true;
  }
}
