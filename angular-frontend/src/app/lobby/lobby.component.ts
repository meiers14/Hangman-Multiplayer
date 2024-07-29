import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LobbyService } from '../services/lobby.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {
  lobbyCode: string = '';
  gameModes = [
    {
      name: 'Hangman Duell Royale',
      description: 'Tritt gegen andere Spieler an und sammle Punkte in mehreren Runden. Der Spieler mit den meisten Punkten gewinnt.',
      image: 'assets/hangman6.png'
    },
    {
      name: 'Hangman Challenge Arena',
      description: 'Wähle schwierige Wörter für deinen Gegner und versuche als erster, die erforderliche Punktzahl zu erreichen.',
      image: 'assets/hangman6.png'
    },
    {
      name: 'Hangman Kooperationsmission',
      description: 'Arbeite mit anderen Spielern zusammen, um Wörter zu erraten und sammle gemeinsam Punkte, um das Spiel zu gewinnen.',
      image: 'assets/hangman6.png'
    }
  ];
  selectedMode: string = '';
  players: string[] = ['Spieler1', 'Spieler2'];
  difficulty: number = 2;
  difficultyLabel: string = 'MITTEL';

  constructor(private route: ActivatedRoute, private router: Router, private lobbyService: LobbyService) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.lobbyCode = params['lobbyCode'];
    });
    this.difficulty = this.lobbyService.getDifficulty();
    this.updateDifficultyLabel();
  }

  leaveLobby() {
    this.router.navigate(['/']);
  }

  selectMode(mode: string) {
    this.selectedMode = mode;
  }

  updateDifficulty() {
    this.lobbyService.setDifficulty(this.difficulty);
    this.updateDifficultyLabel();
  }

  updateDifficultyLabel() {
    switch(this.difficulty) {
      case 1:
        this.difficultyLabel = 'EINFACH';
        break;
      case 2:
        this.difficultyLabel = 'MITTEL';
        break;
      case 3:
        this.difficultyLabel = 'SCHWER';
        break;
    }
  }

  copyInviteLink() {
    const inviteLink = `${window.location.origin}/${this.lobbyCode}`;
    navigator.clipboard.writeText(inviteLink).then(() => {
      alert('Einladungslink kopiert: ' + inviteLink);
    });
  }

  startGame() {
    if (this.selectedMode && this.players.length >= 2) {
      alert('Spiel gestartet!');
      // Hier können Sie die Logik zum Starten des Spiels hinzufügen
    }
  }
}
