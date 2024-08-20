import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { GameComponent } from './game/game.component';
import { LobbyComponent } from './lobby/lobby.component';
import { DuelRoyaleComponent } from './game/duel-royale/duel-royale.component';
import { ChallengeArenaComponent } from './game/challenge-arena/challenge-arena.component';
import { CooperationMissionComponent } from './game/cooperation-mission/cooperation-mission.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'lobby', component: LobbyComponent },
  { path: 'game1', component: DuelRoyaleComponent },
  { path: 'game2', component: ChallengeArenaComponent },
  { path: 'game3', component: CooperationMissionComponent },
  // Weitere Routen hier hinzufügen
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    GameComponent,
    LobbyComponent,
    DuelRoyaleComponent,
    ChallengeArenaComponent,
    CooperationMissionComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(routes),
    CommonModule,
    HttpClientModule
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
