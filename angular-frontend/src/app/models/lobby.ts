import { Difficulty } from "./difficulty.enum";

export interface Lobby {
    id?: number;
    lobbyCode?: string;
    playerA?: string;
    playerB?: string;
    lobbyDifficulty?: Difficulty;
}
