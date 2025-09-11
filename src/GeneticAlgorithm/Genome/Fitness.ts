import { HeuristicBot } from "../../bot/HeuristicBot.js";
import { Board, Direction } from "../../game/Board.js";
import { Genome } from "./Genome.js";

export async function evaluateGenome(
  genome: Genome,
  runs: number
): Promise<number> {
  let total: number = 0;

  for (let i: number = 0; i < runs; i++) {
    total += (await playOneGame(genome)).score;
  }

  return total / runs;
}

export async function playOneGame(
  genome: Genome,
  doPrintGame?: boolean
): Promise<Board> {
  const bot: HeuristicBot = new HeuristicBot(genome);
  const board: Board = new Board();

  while (!board.isGameOver) {
    const move: Direction = bot.decideMove(board);

    if (move === null) {
      break;
    }

    board.move(move, true);

    if (doPrintGame) {
      board.print();
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return board;
}
