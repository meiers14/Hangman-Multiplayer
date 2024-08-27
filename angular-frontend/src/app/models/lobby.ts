import { Player } from "./player";
import { Difficulty } from "./difficulty.enum";

export interface Lobby {
    id?: number;
    lobbyCode?: string;
    playerA?: Player;
    playerB?: Player;
    lobbyDifficulty?: Difficulty;
}
