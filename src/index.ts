import { GeneticAlgorithm } from "./GeneticAlgorithm/GeneticAlgorithm.js";
import { Genome, playOneGame } from "./GeneticAlgorithm/Genome.js";
import { GENETIC_ALGORITHM_CONFIG } from "./config.js";
import { Board } from "./game/Board.js";
import { Logger } from "./utils/Logger.js";

async function main() {
  const logger = Logger.getInstance();
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

  const numberOfGames = 1000;
  logger.log(`Running ${numberOfGames} games with the best genome...`);
  let gamesWon = 0;
  let bestScore = 0;
  let bestBoard: Board = new Board();

  let gameIndex = 0;
  while (gameIndex++ < numberOfGames) {
    const board = await playOneGame(best);
    if (board.maxTile >= 2048) gamesWon++;
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
  logger.log(`Best score achieved: ${bestScore}`);
  logger.log("Best scoring board:");
  bestBoard.print();

  logger.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
