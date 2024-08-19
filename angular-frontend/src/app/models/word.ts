import { Difficulty } from './difficulty.enum';

export interface Word {
  id: number;
  wordDifficulty: Difficulty;
  word: string;
}
