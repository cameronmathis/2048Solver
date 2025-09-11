import { GENETIC_ALGORITHM_CONFIG } from "./GeneticAlgorithm/config.js";
import { GeneticAlgorithm } from "./GeneticAlgorithm/GeneticAlgorithm.js";
import { Genome, playOneGame } from "./GeneticAlgorithm/Genome/index.js";
import { Board } from "./game/Board.js";
import { Logger } from "./utils/Logger.js";

async function main() {
  const logger: Logger = Logger.getInstance();
  const geneticAlgorithm: GeneticAlgorithm = new GeneticAlgorithm(
    GENETIC_ALGORITHM_CONFIG
  );

  const bestGenome: Genome = await geneticAlgorithm.run();
  logBestGenome(bestGenome);

  const numberOfGames: number = 1000;
  const results: GameResults = await runGames(bestGenome, numberOfGames);
  logResults(results, numberOfGames);

  logger.close();
}

type GameResults = {
  totalScore: number;
  gamesWon: number;
  bestScore: number;
  bestBoard: Board;
};

function logBestGenome(genome: Genome) {
  const logger: Logger = Logger.getInstance();
  logger.log("Best genome:", {
    empties: { value: genome.weightEmpties },
    merges: { value: genome.weightMerges },
    isolation: { value: genome.weightIsolation },
    smoothness: { value: genome.weightSmoothness },
    monotonicity: { value: genome.weightMonotonicity },
    mergeChain: { value: genome.weightMergeChain },
    progression: { value: genome.weightProgression },
    positional: { value: JSON.stringify(genome.weightPositional) },
  });
}

async function runGames(
  genome: Genome,
  numberOfGames: number
): Promise<GameResults> {
  const logger: Logger = Logger.getInstance();
  logger.log(`Running ${numberOfGames} games with the best genome...`);

  let totalScore: number = 0;
  let gamesWon: number = 0;
  let bestScore: number = 0;
  let bestBoard: Board = new Board();

  for (let i = 0; i < numberOfGames; i++) {
    const board: Board = await playOneGame(genome);
    totalScore += board.score;

    if (board.maxTile >= 2048) {
      gamesWon++;
    }

    if (board.score > bestScore) {
      bestScore = board.score;
      bestBoard = board;
    }
  }

  return { totalScore, gamesWon, bestScore, bestBoard };
}

function logResults(results: GameResults, numberOfGames: number) {
  const logger: Logger = Logger.getInstance();

  logger.log(`Results after ${numberOfGames} games:`);
  logger.log(
    `Reached 2048: ${results.gamesWon} times (${(
      (results.gamesWon / numberOfGames) *
      100
    ).toFixed(1)}%)`
  );
  logger.log(
    `Average score: ${(results.totalScore / numberOfGames).toFixed(2)}`
  );
  logger.log(`Best score: ${results.bestScore}`);
  logger.log("Highest scoring board:");

  results.bestBoard.print();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
