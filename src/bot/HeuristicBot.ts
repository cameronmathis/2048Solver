import { Board, Direction } from "../game/Board.js";
import { Genome } from "../GeneticAlgorithm/Genome/index.js";
import * as heuristics from "./heuristics/index.js";

export class HeuristicBot {
  private readonly genome: Genome;

  constructor(genome: Genome) {
    this.genome = genome;
  }

  public decideMove(board: Board): Direction {
    const availableMoves: Direction[] = board.availableMoves;
    let bestMove: Direction = availableMoves[0];
    let bestScore: number = -Infinity;

    for (const currentMove of availableMoves) {
      const boardClone: Board = board.clone();

      if (!boardClone.move(currentMove, false)) {
        continue;
      }

      const moveScore: number = this.evaluateBoard(boardClone);

      if (moveScore > bestScore) {
        bestScore = moveScore;
        bestMove = currentMove;
      }
    }

    return bestMove;
  }

  private evaluateBoard(board: Board): number {
    const genome: Genome = this.genome;

    return (
      genome.weightEmpties * board.emptyCells.length +
      genome.weightMerges * heuristics.countWeightedMerges(board) +
      genome.weightSmoothness * heuristics.calculateSmoothnessScore(board) +
      genome.weightMonotonicity * heuristics.calculateMonotonicityScore(board) -
      genome.weightIsolation * heuristics.calculateIsolationPenalty(board) +
      heuristics.calculatePositionalScore(board, genome) +
      genome.weightProgression * heuristics.calculateProgressionScore(board) +
      genome.weightMergeChain * heuristics.calculateMergeChainScore(board)
    );
  }
}
