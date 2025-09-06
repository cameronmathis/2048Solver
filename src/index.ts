import { GeneticAlgorithm } from "./GeneticAlgorithm/GeneticAlgorithm.js";
import { Genome, playOneGame } from "./GeneticAlgorithm/Genome.js";
import { GENETIC_ALGORITHM_CONFIG } from "./config.js";
import { Board } from "./game/Board.js";
import { Logger } from "./utils/Logger.js";

async function main() {
  const logger: Logger = Logger.getInstance();
  const geneticAlgorithm: GeneticAlgorithm = new GeneticAlgorithm(
    GENETIC_ALGORITHM_CONFIG
  );

  const best: Genome = await geneticAlgorithm.run();
  logger.log("Best genome:", {
    empties: { value: best.weightEmpties },
    merges: { value: best.weightMerges },
    edge: { value: best.weightEdge },
    corner: { value: best.weightCorner },
    maxTile: { value: best.weightMaxTile },
    maxTilePosition: { value: best.weightMaxTilePosition },
    isolation: { value: best.weightIsolation },
    smoothness: { value: best.weightSmoothness },
    monotonicity: { value: best.weightMonotonicity },
    gradient: { value: best.weightGradient },
    mergeChain: { value: best.weightMergeChain },
  });

  const numberOfGames: number = 1000;
  logger.log(`Running ${numberOfGames} games with the best genome...`);
  let totalScore: number = 0;
  let gamesWon: number = 0;
  let bestScore: number = 0;
  let bestBoard: Board = new Board();

  let gameIndex: number = 0;
  while (gameIndex++ < numberOfGames) {
    const board: Board = await playOneGame(best);
    totalScore += board.score;
    if (board.maxTile >= 2048) {
      gamesWon++;
    }
    if (board.score > bestScore) {
      bestScore = board.score;
      bestBoard = board;
    }
  }

  logger.log(`Results after ${numberOfGames} games:`);
  logger.log(
    `Reached 2048: ${gamesWon} times (${(
      (gamesWon / numberOfGames) *
      100
    ).toFixed(1)}%)`
  );
  logger.log(`Average score: ${(totalScore / numberOfGames).toFixed(2)}`);
  logger.log(`Best score: ${bestScore}`);
  logger.log("Highest scoring board:");
  bestBoard.print();

  logger.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
