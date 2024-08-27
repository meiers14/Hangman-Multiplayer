import { GameMode } from "../models/game-mode";
import { GameModeId } from "../models/game-mode-id.enum";

export const GAME_MODES: GameMode[] = [
    {
        id: GameModeId.DUELL_ROYALE,
        name: 'Hangman Duell Royale',
        description: 'Tritt gegen andere Spieler an und sammle Punkte in mehreren Runden. Der Spieler mit den meisten Punkten gewinnt.',
        image: 'assets/hangman6.png'
    },
    {
        id: GameModeId.CHALLENGE_ARENA,
        name: 'Hangman Challenge Arena',
        description: 'Wähle schwierige Wörter für deinen Gegner und versuche als erster, die erforderliche Punktzahl zu erreichen.',
        image: 'assets/hangman6.png'
    },
    {
        id: GameModeId.KOOPERATIONSMISSION,
        name: 'Hangman Kooperationsmission',
        description: 'Arbeite mit anderen Spielern zusammen, um Wörter zu erraten und sammle gemeinsam Punkte, um das Spiel zu gewinnen.',
        image: 'assets/hangman6.png'
    }
];
