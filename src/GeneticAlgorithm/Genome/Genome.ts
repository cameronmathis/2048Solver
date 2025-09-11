import { GENOME_WEIGHTS } from "../config.js";

export type Genome = {
  // Encourages having more empty cells, which provides more room to maneuver.
  weightEmpties: number;
  // Rewards board states that have a higher number of potential merges.
  weightMerges: number;
  // Prefers board states where adjacent tiles have similar values, avoiding large value "cliffs".
  weightSmoothness: number;
  // Encourages tile values to be consistently increasing or decreasing along rows and columns.
  weightMonotonicity: number;
  // Penalizes high-value tiles that are isolated from other similar tiles, avoiding dead ends.
  weightIsolation: number;
  // Assigns a specific strategic value to each of the 16 cells on the board.
  weightPositional: number[][];
  // Rewards tiles that are positioned to build into larger tiles (e.g., a 128 next to a 256).
  weightProgression: number;
  // Rewards creating chains of identical tiles, which sets up future cascade merges.
  weightMergeChain: number;
};

export type GenomeWeightsConfig = {
  [key: string]:
    | { value: number; influence?: number }
    | { value: number[][]; influence?: number };
};

export function generateGenome(): Genome {
  const CONFIG = GENOME_WEIGHTS;

  function biasedRandom(bias: number, influence: number = 1): number {
    const clampedInfluence: number = Math.min(Math.max(influence, 0), 1);
    const randomValue: number = Math.random() * 2 - 1;

    return bias * (1 - clampedInfluence) + randomValue * clampedInfluence;
  }

  return {
    weightEmpties: biasedRandom(
      CONFIG.empties.value as number,
      CONFIG.empties.influence
    ),
    weightMerges: biasedRandom(
      CONFIG.merges.value as number,
      CONFIG.merges.influence
    ),
    weightSmoothness: biasedRandom(
      CONFIG.smoothness.value as number,
      CONFIG.smoothness.influence
    ),
    weightMonotonicity: biasedRandom(
      CONFIG.monotonicity.value as number,
      CONFIG.monotonicity.influence
    ),
    weightIsolation: biasedRandom(
      CONFIG.isolation.value as number,
      CONFIG.isolation.influence
    ),
    weightPositional: (CONFIG.positional.value as number[][]).map(
      (row: number[]): number[] =>
        row.map((cell: number): number =>
          biasedRandom(cell, CONFIG.positional.influence)
        )
    ),
    weightProgression: biasedRandom(
      CONFIG.progression.value as number,
      CONFIG.progression.influence
    ),
    weightMergeChain: biasedRandom(
      CONFIG.mergeChain.value as number,
      CONFIG.mergeChain.influence
    ),
  };
}
