import { GeneticAlgorithmConfig } from "./GeneticAlgorithm/GeneticAlgorithm.js";
import { GenomeWeightsConfig } from "./GeneticAlgorithm/Genome.js";

export const NEUTRAL_GENOME_WEIGHTS: GenomeWeightsConfig = {
  empties: { value: 1 },
  merges: { value: 1 },
  edge: { value: 1 },
  corner: { value: 1 },
  maxTile: { value: 1 },
  maxTilePosition: { value: 1 },
  isolation: { value: 1 },
  smoothness: { value: 1 },
  monotonicity: { value: 1 },
  gradient: { value: 1 },
  mergeChain: { value: 1 },
};

export const GENOME_WEIGHTS: GenomeWeightsConfig = {
  empties: { value: 0.7, influence: 0.7 },
  merges: { value: 0.5, influence: 0.7 },
  edge: { value: 0.3, influence: 0.7 },
  corner: { value: 0.3, influence: 0.7 },
  maxTile: { value: 0.9, influence: 0.7 },
  maxTilePosition: { value: 0.8, influence: 0.7 },
  isolation: { value: 0.2, influence: 0.7 },
  smoothness: { value: 0.8, influence: 0.7 },
  monotonicity: { value: 0.7, influence: 0.7 },
  gradient: { value: 0.2, influence: 0.7 },
  mergeChain: { value: 0.5, influence: 0.7 },
};

export const GENETIC_ALGORITHM_CONFIG: GeneticAlgorithmConfig = {
  generations: 100,
  populationSize: 100,
  gamesPerGenome: 5,
  eliteCount: 5,
  tournamentSize: 3,
  mutationRate: 0.2,
  adaptiveMutation: true,
  minMutationRate: 0.05,
  maxMutationRate: 0.1,
};
