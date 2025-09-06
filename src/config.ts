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

export const OPTIMIZED_GENOME_WEIGHTS: GenomeWeightsConfig = {
  empties: { value: 0.530567642055551 },
  merges: { value: 0.25911355123565794 },
  edge: { value: 0.025802603941722697 },
  corner: { value: 0.06961120281274318 },
  maxTile: { value: 0.40671379055226253 },
  maxTilePosition: { value: 0.41869085784691645 },
  isolation: { value: 0.15495942340214536 },
  smoothness: { value: 0.6648946944285923 },
  monotonicity: { value: 0.16975427140119653 },
  gradient: { value: 0.014250664241146484 },
  mergeChain: { value: 0.3938771145213853 },
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
  maxMutationRate: 0.3,
};
