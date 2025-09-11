import { GenomeWeightsConfig } from "./../GeneticAlgorithm/Genome/index.js";
import { GeneticAlgorithmConfig } from "./GeneticAlgorithm.js";

const NEUTRAL_GENOME_WEIGHTS: GenomeWeightsConfig = {
  empties: { value: 1, influence: 1 },
  merges: { value: 1, influence: 1 },
  isolation: { value: 1, influence: 1 },
  smoothness: { value: 1, influence: 1 },
  monotonicity: { value: 1, influence: 1 },
  mergeChain: { value: 1, influence: 1 },
  progression: { value: 1, influence: 1 },
  positional: {
    value: [
      [1, 1, 1, 1],
      [1, 1, 1, 1],
      [1, 1, 1, 1],
      [1, 1, 1, 1],
    ],
    influence: 1,
  },
};

export const GENOME_WEIGHTS: GenomeWeightsConfig = NEUTRAL_GENOME_WEIGHTS;

export const GENETIC_ALGORITHM_CONFIG: GeneticAlgorithmConfig = {
  generations: 1000,
  populationSize: 100,
  gamesPerGenome: 5,
  eliteCount: 5,
  tournamentSize: 3,
  mutationRate: 0.2,
  adaptiveMutation: true,
  minMutationRate: 0.05,
  maxMutationRate: 0.3,
  randomImmigrants: 3,
};
