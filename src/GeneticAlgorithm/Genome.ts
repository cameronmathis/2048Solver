import { HeuristicBot } from "../bot/HeuristicBot.js";
import { NEUTRAL_GENOME_WEIGHTS } from "../config.js";
import { Board, Direction } from "../game/Board.js";

export type Genome = {
  weightEmpties: number;
  weightMerges: number;
  weightEdge: number;
  weightCorner: number;
  weightMaxTile: number;
  weightMaxTilePosition: number;
  weightIsolation: number;
  weightSmoothness: number;
  weightMonotonicity: number;
  weightGradient: number;
  weightMergeChain: number;
};

export type GenomeWeightsConfig = {
  [key: string]: { value: number; influence?: number };
};

export function generateGenome(): Genome {
  const CONFIG = NEUTRAL_GENOME_WEIGHTS;

  function biasedRandom(bias: number, influence: number = 1): number {
    const clampedInfluence: number = Math.min(Math.max(influence, 0), 1);
    const randomValue: number = Math.random() * 2 - 1;
    return bias * (1 - clampedInfluence) + randomValue * clampedInfluence;
  }

  return {
    weightEmpties: biasedRandom(CONFIG.empties.value, CONFIG.empties.influence),
    weightMerges: biasedRandom(CONFIG.merges.value, CONFIG.merges.influence),
    weightEdge: biasedRandom(CONFIG.edge.value, CONFIG.edge.influence),
    weightCorner: biasedRandom(CONFIG.corner.value, CONFIG.corner.influence),
    weightMaxTile: biasedRandom(CONFIG.maxTile.value, CONFIG.maxTile.influence),
    weightMaxTilePosition: biasedRandom(
      CONFIG.maxTilePosition.value,
      CONFIG.maxTilePosition.influence
    ),
    weightIsolation: biasedRandom(
      CONFIG.isolation.value,
      CONFIG.isolation.influence
    ),
    weightSmoothness: biasedRandom(
      CONFIG.smoothness.value,
      CONFIG.smoothness.influence
    ),
    weightMonotonicity: biasedRandom(
      CONFIG.monotonicity.value,
      CONFIG.monotonicity.influence
    ),
    weightGradient: biasedRandom(
      CONFIG.gradient.value,
      CONFIG.gradient.influence
    ),
    weightMergeChain: biasedRandom(
      CONFIG.mergeChain.value,
      CONFIG.mergeChain.influence
    ),
  };
}

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

export function mutate(
  genome: Genome,
  rate: number = 0.2,
  sigma: number = 0.2
): Genome {
  const newGenome: Genome = { ...genome };
  for (const key of Object.keys(newGenome) as (keyof Genome)[]) {
    if (Math.random() < rate) {
      newGenome[key] += gaussian(0, sigma);
    }
  }
  return newGenome;
}

function gaussian(mu: number = 0, sigma: number = 1): number {
  let x: number = 0;
  let y: number = 0;
  while (x === 0) {
    x = Math.random();
  }
  while (y === 0) {
    y = Math.random();
  }
  return (
    mu + sigma * Math.sqrt(-2.0 * Math.log(x)) * Math.cos(2.0 * Math.PI * y)
  );
}

export function crossover(
  genomeA: Genome,
  genomeB: Genome,
  alpha?: number
): Genome {
  alpha = alpha ?? Math.random();
  const child: Genome = {} as Genome;
  for (const key of Object.keys(genomeA) as (keyof Genome)[]) {
    child[key] = genomeA[key] * alpha + genomeB[key] * (1 - alpha);
  }
  return child;
}
