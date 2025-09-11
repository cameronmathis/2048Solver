import { Board } from "../../game/Board.js";
import { Genome } from "../../GeneticAlgorithm/Genome/index.js";

const logarithmCache: number[] = Array.from(
  { length: 65536 },
  (_, index: number): number => (index > 0 ? Math.log2(index) : 0)
);

/**
 * Calculates a score based on the number of available merges on the board.
 * More potential merges are generally better.
 */
export function countWeightedMerges(board: Board): number {
  let mergeScore: number = 0;

  for (let row: number = 0; row < 4; row++) {
    for (let column: number = 0; column < 3; column++) {
      const currentValue: number = board.grid[row][column];
      const nextValue: number = board.grid[row][column + 1];

      if (currentValue !== 0 && currentValue === nextValue) {
        mergeScore += logarithmCache[currentValue];
      }
    }
  }

  for (let column: number = 0; column < 4; column++) {
    for (let row: number = 0; row < 3; row++) {
      const currentValue: number = board.grid[row][column];
      const nextValue: number = board.grid[row + 1][column];

      if (currentValue !== 0 && currentValue === nextValue) {
        mergeScore += logarithmCache[currentValue];
      }
    }
  }

  return mergeScore;
}

/**
 * Measures how similar adjacent tile values are.
 * A high smoothness score means tiles are next to other tiles of similar value,
 * which makes them easier to merge.
 */
export function calculateSmoothnessScore(board: Board): number {
  let smoothnessScore: number = 0;

  for (let row: number = 0; row < 4; row++) {
    for (let column: number = 0; column < 4; column++) {
      const currentValue: number = board.grid[row][column];

      if (currentValue === 0) {
        continue;
      }

      const currentLogValue: number = logarithmCache[currentValue];

      for (let nextColumn: number = column + 1; nextColumn < 4; nextColumn++) {
        if (board.grid[row][nextColumn] !== 0) {
          smoothnessScore -= Math.abs(
            currentLogValue - logarithmCache[board.grid[row][nextColumn]]
          );
          break;
        }
      }

      for (let nextRow: number = row + 1; nextRow < 4; nextRow++) {
        if (board.grid[nextRow][column] !== 0) {
          smoothnessScore -= Math.abs(
            currentLogValue - logarithmCache[board.grid[nextRow][column]]
          );
          break;
        }
      }
    }
  }

  return smoothnessScore;
}

/**
 * Rewards the board for having tile values that are generally increasing or decreasing
 * along each row and column. This encourages an organized board state.
 */
export function calculateMonotonicityScore(board: Board): number {
  let monotonicityScore: number = 0;

  const calculateLineMonotonicity = (line: number[]): number => {
    let increasing: number = 0;
    let decreasing: number = 0;

    for (let index: number = 0; index < line.length - 1; index++) {
      if (line[index] !== 0 && line[index + 1] !== 0) {
        const difference: number =
          logarithmCache[line[index + 1]] - logarithmCache[line[index]];

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

/**
 * Penalizes high-value tiles that are not adjacent to a tile of the same value.
 * This discourages creating isolated "dead-end" tiles that are hard to merge.
 */
export function calculateIsolationPenalty(board: Board): number {
  let isolationPenalty: number = 0;

  for (let row: number = 0; row < 4; row++) {
    for (let column: number = 0; column < 4; column++) {
      const currentValue: number = board.grid[row][column];

      if (currentValue < 16) {
        continue;
      }

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

/**
 * Calculates a score based on the value of tiles in specific positions.
 * The genetic algorithm learns which positions are more valuable (e.g., corners).
 */
export function calculatePositionalScore(board: Board, genome: Genome): number {
  let score: number = 0;

  for (let row: number = 0; row < 4; row++) {
    for (let column: number = 0; column < 4; column++) {
      score += board.grid[row][column] * genome.weightPositional[row][column];
    }
  }

  return score;
}

/**
 * Encourages the board to have tiles in an increasing sequence along all directions.
 * This helps in building up large tiles from smaller ones.
 */
export function calculateProgressionScore(board: Board): number {
  let score: number = 0;
  const directions: { x: number; y: number }[] = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];

  for (let row: number = 0; row < 4; row++) {
    for (let column: number = 0; column < 4; column++) {
      const currentValue: number = board.grid[row][column];

      if (currentValue === 0) {
        continue;
      }

      let bestNeighborDiff: number = -Infinity;

      for (const direction of directions) {
        let nextRow: number = row + direction.y;
        let nextColumn: number = column + direction.x;

        while (
          nextRow >= 0 &&
          nextRow < 4 &&
          nextColumn >= 0 &&
          nextColumn < 4
        ) {
          const nextValue: number = board.grid[nextRow][nextColumn];

          if (nextValue !== 0) {
            const diff: number =
              logarithmCache[nextValue] - logarithmCache[currentValue];

            if (diff > bestNeighborDiff) {
              bestNeighborDiff = diff;
            }

            break;
          }

          nextRow += direction.y;
          nextColumn += direction.x;
        }
      }

      score += bestNeighborDiff;
    }
  }

  return score;
}

/**
 * Rewards creating chains of identical, mergeable tiles.
 * This sets up future moves that can cause a cascade of merges.
 */
export function calculateMergeChainScore(board: Board): number {
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

    return chainLength > 1 ? chainLength * logarithmCache[value] : 0;
  };

  for (let row: number = 0; row < 4; row++) {
    for (let column: number = 0; column < 4; column++) {
      score += checkChain(row, column, "horizontal");
      score += checkChain(row, column, "vertical");
    }
  }

  return score;
}
