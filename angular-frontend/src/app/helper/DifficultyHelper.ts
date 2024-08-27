import { Difficulty } from "../models/difficulty.enum";

export class DifficultyHelper {
    static fromNumber(value: number): Difficulty {
        switch (value) {
            case 1:
                return Difficulty.LEICHT;
            case 2:
                return Difficulty.MITTEL;
            case 3:
                return Difficulty.SCHWER;
            default:
                throw new Error('Invalid Difficulty value');
        }
    }

    static toNumber(difficulty: Difficulty): number {
        switch (difficulty) {
            case Difficulty.LEICHT:
                return 1;
            case Difficulty.MITTEL:
                return 2;
            case Difficulty.SCHWER:
                return 3;
            default:
                throw new Error('Invalid Difficulty enum');
        }
    }
}
