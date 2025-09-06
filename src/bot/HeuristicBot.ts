import { Genome } from "../GeneticAlgorithm/Genome.js";
import { Board, Direction } from "../game/Board.js";

export class HeuristicBot {
  private static readonly logarithmCache: number[] = Array.from(
    { length: 65536 },
    (_, index: number): number => (index > 0 ? Math.log2(index) : 0)
  );

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
      if (!boardClone.move(currentMove, false)) continue;

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
      genome.weightMerges * this.countWeightedMerges(board) +
      genome.weightEdge * this.calculateEdgeScore(board) +
      genome.weightCorner * this.calculateMaxTileCornerScore(board) +
      genome.weightMaxTile * this.snakePatternBonus(board) +
      genome.weightMaxTilePosition * this.calculateMaxTilePositionScore(board) -
      genome.weightIsolation * this.calculateIsolationPenalty(board) +
      genome.weightSmoothness * this.calculateSmoothnessScore(board) +
      genome.weightMonotonicity * this.calculateMonotonicityScore(board) +
      genome.weightGradient * this.calculateGradientScore(board) +
      genome.weightMergeChain * this.calculateMergeChainScore(board)
    );
  }

  private calculateGradientScore(board: Board): number {
    let score: number = 0;
    const weights: number[][] = [
      [16, 15, 14, 13],
      [9, 10, 11, 12],
      [8, 7, 6, 5],
      [1, 2, 3, 4],
    ];

    for (let row: number = 0; row < 4; row++) {
      for (let column: number = 0; column < 4; column++) {
        score += board.grid[row][column] * weights[row][column];
      }
    }
    return score;
  }

  private calculateMergeChainScore(board: Board): number {
    let score: number = 0;
    const checkChain: (
      row: number,
      column: number,
      direction: "horizontal" | "vertical"
    ) => number = (
      row: number,
      column: number,
      direction: "horizontal" | "vertical"
    ): number => {
      let chainLength: number = 1;
      let value: number = board.grid[row][column];
      if (value === 0) {
        return 0;
      }

      if (direction === "horizontal") {
        for (let c: number = column + 1; c < 4; c++) {
          if (board.grid[row][c] === value) {
            chainLength++;
          } else {
            break;
          }
        }
      } else {
        for (let r: number = row + 1; r < 4; r++) {
          if (board.grid[r][column] === value) {
            chainLength++;
          } else {
            break;
          }
        }
      }
      return chainLength > 1
        ? chainLength * HeuristicBot.logarithmCache[value]
        : 0;
    };

    for (let row: number = 0; row < 4; row++) {
      for (let column: number = 0; column < 4; column++) {
        score += checkChain(row, column, "horizontal");
        score += checkChain(row, column, "vertical");
      }
    }
    return score;
  }

  private countWeightedMerges(board: Board): number {
    let mergeScore: number = 0;

    for (let row: number = 0; row < 4; row++) {
      for (let column: number = 0; column < 3; column++) {
        const currentValue: number = board.grid[row][column];
        const nextValue: number = board.grid[row][column + 1];
        if (currentValue !== 0 && currentValue === nextValue) {
          mergeScore += HeuristicBot.logarithmCache[currentValue];
        }
      }
    }

    for (let column: number = 0; column < 4; column++) {
      for (let row: number = 0; row < 3; row++) {
        const currentValue: number = board.grid[row][column];
        const nextValue: number = board.grid[row + 1][column];
        if (currentValue !== 0 && currentValue === nextValue) {
          mergeScore += HeuristicBot.logarithmCache[currentValue];
        }
      }
    }

    return mergeScore;
  }

  private calculateEdgeScore(board: Board): number {
    let edgeScore: number = 0;
    for (let row: number = 0; row < 4; row++) {
      for (let column: number = 0; column < 4; column++) {
        if (row === 0 || row === 3 || column === 0 || column === 3) {
          edgeScore += board.grid[row][column];
        }
      }
    }
    return edgeScore;
  }

  private calculateMaxTileCornerScore(board: Board): number {
    const maxTileValue: number = board.maxTile;
    let cornerScore: number = 0;
    const preferredCorner: [number, number] = [3, 3];
    const cornerPositions: [number, number][] = [
      [0, 0],
      [0, 3],
      [3, 0],
      [3, 3],
    ];

    for (const [row, column] of cornerPositions) {
      if (board.grid[row][column] === maxTileValue) {
        cornerScore +=
          row === preferredCorner[0] && column === preferredCorner[1] ? 20 : 5;
      }
    }
    return cornerScore;
  }

  private calculateIsolationPenalty(board: Board): number {
    let isolationPenalty: number = 0;
    for (let row: number = 0; row < 4; row++) {
      for (let column: number = 0; column < 4; column++) {
        const currentValue: number = board.grid[row][column];
        if (currentValue < 16) continue;

        const neighborPositions: [number, number][] = [
          [row - 1, column],
          [row + 1, column],
          [row, column - 1],
          [row, column + 1],
        ];

        const hasMatchingNeighbor: boolean = neighborPositions.some(
          ([neighborRow, neighborColumn]: [number, number]): boolean =>
            neighborRow >= 0 &&
            neighborRow < 4 &&
            neighborColumn >= 0 &&
            neighborColumn < 4 &&
            board.grid[neighborRow][neighborColumn] === currentValue
        );

        if (!hasMatchingNeighbor) {
          isolationPenalty += Math.log2(currentValue);
        }
      }
    }
    return isolationPenalty;
  }

  private calculateMaxTilePositionScore(board: Board): number {
    const maxTileValue: number = board.maxTile;
    let positionScore: number = 0;
    for (let row: number = 0; row < 4; row++) {
      for (let column: number = 0; column < 4; column++) {
        if (board.grid[row][column] === maxTileValue) {
          positionScore += row === 3 && column === 3 ? 10 : 2;
        }
      }
    }
    return positionScore;
  }

  private calculateSmoothnessScore(board: Board): number {
    let smoothnessScore: number = 0;

    for (let row: number = 0; row < 4; row++) {
      for (let column: number = 0; column < 4; column++) {
        const currentValue: number = board.grid[row][column];
        if (currentValue === 0) continue;
        const currentLogValue: number =
          HeuristicBot.logarithmCache[currentValue];

        for (
          let nextColumn: number = column + 1;
          nextColumn < 4;
          nextColumn++
        ) {
          if (board.grid[row][nextColumn] !== 0) {
            smoothnessScore -= Math.abs(
              currentLogValue -
                HeuristicBot.logarithmCache[board.grid[row][nextColumn]]
            );
            break;
          }
        }

        for (let nextRow: number = row + 1; nextRow < 4; nextRow++) {
          if (board.grid[nextRow][column] !== 0) {
            smoothnessScore -= Math.abs(
              currentLogValue -
                HeuristicBot.logarithmCache[board.grid[nextRow][column]]
            );
            break;
          }
        }
      }
    }

    return smoothnessScore;
  }

  private calculateMonotonicityScore(board: Board): number {
    let monotonicityScore: number = 0;

    const calculateLineMonotonicity = (line: number[]): number => {
      let increasing: number = 0;
      let decreasing: number = 0;

      for (let index: number = 0; index < line.length - 1; index++) {
        if (line[index] !== 0 && line[index + 1] !== 0) {
          const difference: number =
            HeuristicBot.logarithmCache[line[index + 1]] -
            HeuristicBot.logarithmCache[line[index]];
          if (difference > 0) {
            increasing += difference;
          } else {
            decreasing -= difference;
          }
        }
      }
      return Math.max(increasing, decreasing);
    };

    for (let row: number = 0; row < 4; row++) {
      monotonicityScore += calculateLineMonotonicity(board.grid[row]);
    }

    for (let column: number = 0; column < 4; column++) {
      const columnValues: number[] = [
        board.grid[0][column],
        board.grid[1][column],
        board.grid[2][column],
        board.grid[3][column],
      ];
      monotonicityScore += calculateLineMonotonicity(columnValues);
    }

    return monotonicityScore;
  }

  private snakePatternBonus(board: Board): number {
    let snakeBonus: number = 0;

    const snakePattern: [number, number][] = [
      [3, 3],
      [3, 2],
      [3, 1],
      [3, 0],
      [2, 0],
      [2, 1],
      [2, 2],
      [2, 3],
      [1, 3],
      [1, 2],
      [1, 1],
      [1, 0],
      [0, 0],
      [0, 1],
      [0, 2],
      [0, 3],
    ];

    for (let index: number = 0; index < snakePattern.length - 1; index++) {
      const [currentRow, currentColumn]: [number, number] = snakePattern[index];
      const [nextRow, nextColumn]: [number, number] = snakePattern[index + 1];

      const currentValue: number = board.grid[currentRow][currentColumn];
      const nextValue: number = board.grid[nextRow][nextColumn];

      if (
        currentValue !== 0 &&
        nextValue !== 0 &&
        HeuristicBot.logarithmCache[currentValue] >=
          HeuristicBot.logarithmCache[nextValue]
      ) {
        snakeBonus +=
          HeuristicBot.logarithmCache[currentValue] -
          HeuristicBot.logarithmCache[nextValue];
      }
    }
    return snakeBonus;
  }
}
