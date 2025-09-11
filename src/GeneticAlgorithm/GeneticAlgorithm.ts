import { Logger } from "../utils/Logger.js";
import {
  crossover,
  evaluateGenome,
  generateGenome,
  Genome,
  mutate,
} from "./Genome/index.js";

export type GeneticAlgorithmConfig = {
  generations: number;
  populationSize: number;
  gamesPerGenome: number;
  eliteCount: number;
  tournamentSize: number;
  mutationRate: number;
  adaptiveMutation?: boolean;
  minMutationRate?: number;
  maxMutationRate?: number;
  randomImmigrants?: number;
};

export class GeneticAlgorithm {
  private readonly config: GeneticAlgorithmConfig;
  private logger: Logger;

  constructor(config: GeneticAlgorithmConfig) {
    this.config = config;
    this.logger = Logger.getInstance();
  }

  async run(): Promise<Genome> {
    const population: Genome[] = this.initializePopulation();
    const bestGenome = await this.evolvePopulation(population);

    return bestGenome;
  }

  private async evolvePopulation(population: Genome[]): Promise<Genome> {
    let bestGenome: Genome = population[0];
    let bestFitness: number = -Infinity;

    for (
      let generation: number = 0;
      generation < this.config.generations;
      generation++
    ) {
      const {
        fitnesses,
        bestGenome: generationalBestGenome,
        bestFitness: generationalBestFitness,
      } = await this.evaluatePopulation(population);

      if (generationalBestFitness > bestFitness) {
        bestGenome = generationalBestGenome;
        bestFitness = generationalBestFitness;
      }

      this.logGenerationStats(generation, fitnesses, bestFitness);
      this.logBestGenome(generation, bestGenome);

      population = this.createNextGeneration(population, fitnesses, generation);
    }

    return bestGenome;
  }

  private initializePopulation(): Genome[] {
    return Array.from({ length: this.config.populationSize }, () =>
      generateGenome()
    );
  }

  private async evaluatePopulation(
    population: Genome[]
  ): Promise<{ fitnesses: number[]; bestGenome: Genome; bestFitness: number }> {
    const fitnesses: number[] = [];
    let bestGenome: Genome = population[0];
    let bestFitness: number = -Infinity;

    for (let i: number = 0; i < population.length; i++) {
      const fitness: number = await evaluateGenome(
        population[i],
        this.config.gamesPerGenome
      );
      fitnesses.push(fitness);

      if (fitness > bestFitness) {
        bestGenome = population[i];
        bestFitness = fitness;
      }
    }

    return { fitnesses, bestGenome, bestFitness };
  }

  private logGenerationStats(
    generation: number,
    fitnesses: number[],
    bestFitness: number
  ): void {
    const averageFitness: number =
      fitnesses.reduce((x, y) => x + y, 0) / fitnesses.length;
    const maxFitness: number = Math.max(...fitnesses);

    this.logger.log(
      `Generation ${generation + 1}/${
        this.config.generations
      } - Average Generation Fitness: ${averageFitness.toFixed(
        1
      )}, Max Generational Fitness: ${maxFitness.toFixed(
        1
      )}, Best Overall Fitness: ${bestFitness.toFixed(1)}`
    );
  }

  private logBestGenome(generation: number, genome: Genome): void {
    this.logger.log(
      `Generation ${generation + 1}/${this.config.generations} - Best Genome:`,
      {
        empties: { value: genome.weightEmpties },
        merges: { value: genome.weightMerges },
        isolation: { value: genome.weightIsolation },
        smoothness: { value: genome.weightSmoothness },
        monotonicity: { value: genome.weightMonotonicity },
        mergeChain: { value: genome.weightMergeChain },
        progression: { value: genome.weightProgression },
        positional: { value: JSON.stringify(genome.weightPositional) },
      }
    );
  }

  private createNextGeneration(
    population: Genome[],
    fitnesses: number[],
    generation: number
  ): Genome[] {
    const sortedPopulation: Genome[] = this.sortPopulationByFitness(
      population,
      fitnesses
    );

    const nextGeneration: Genome[] = this.selectElites(sortedPopulation);

    const randomImmigrants = this.config.randomImmigrants ?? 0;

    for (let i = 0; i < randomImmigrants; i++) {
      if (nextGeneration.length < this.config.populationSize) {
        nextGeneration.push(generateGenome());
      }
    }

    const mutationRate: number = this.calculateGenerationalMutationRate(
      generation,
      sortedPopulation
    );

    if (this.config.adaptiveMutation) {
      const diversity: number =
        this.calculatePopulationDiversity(sortedPopulation);
      this.logger.log(
        `Generation ${generation + 1}/${
          this.config.generations
        } - Diversity: ${diversity.toFixed(
          4
        )}, Mutation Rate: ${mutationRate.toFixed(4)}`
      );
    }

    while (nextGeneration.length < this.config.populationSize) {
      const child: Genome = this.breedChild(
        sortedPopulation,
        fitnesses,
        mutationRate
      );
      nextGeneration.push(child);
    }

    return nextGeneration;
  }

  private sortPopulationByFitness(
    population: Genome[],
    fitnesses: number[]
  ): Genome[] {
    const indices: number[] = population
      .map((_, i) => i)
      .sort((x, y) => fitnesses[y] - fitnesses[x]);

    return indices.map((i) => population[i]);
  }

  private selectElites(sortedPopulation: Genome[]): Genome[] {
    return sortedPopulation.slice(0, this.config.eliteCount);
  }

  private calculatePopulationDiversity(population: Genome[]): number {
    let diversity: number = 0;

    for (let i = 0; i < population.length; i++) {
      for (let ii = i + 1; ii < population.length; ii++) {
        diversity += this.genomeDistance(population[i], population[ii]);
      }
    }

    return diversity / ((population.length * (population.length - 1)) / 2);
  }

  private genomeDistance(genomeA: Genome, genomeB: Genome): number {
    return Object.keys(genomeA).reduce((sum, key) => {
      if (key === "weightPositional") {
        const positionalA: number[][] = genomeA.weightPositional;
        const positionalB: number[][] = genomeB.weightPositional;
        let positionalSum: number = 0;

        for (let i: number = 0; i < positionalA.length; i++) {
          for (let j: number = 0; j < positionalA[i].length; j++) {
            positionalSum += Math.pow(positionalA[i][j] - positionalB[i][j], 2);
          }
        }

        return sum + positionalSum;
      }

      return (
        sum +
        Math.pow(
          (genomeA[key as keyof Genome] as number) -
            (genomeB[key as keyof Genome] as number),
          2
        )
      );
    }, 0);
  }

  private calculateGenerationalMutationRate(
    generation: number,
    population?: Genome[]
  ): number {
    if (!this.config.adaptiveMutation) {
      return (
        this.config.mutationRate *
        Math.exp(-5 * (generation / this.config.generations))
      );
    }

    const diversity: number = population
      ? this.calculatePopulationDiversity(population)
      : 1;
    const diversityFactor: number = Math.exp(-diversity * 2);
    const generationFactor: number = Math.exp(
      -2 * (generation / this.config.generations)
    );

    let adaptiveRate: number;

    if (diversity < 0.1) {
      adaptiveRate = this.config.mutationRate * (1.5 + diversityFactor);
    } else {
      adaptiveRate =
        (this.config.mutationRate * (diversityFactor + generationFactor)) / 2;
    }

    const minRate: number = this.config.minMutationRate ?? 0.05;
    const maxRate: number = this.config.maxMutationRate ?? 0.3;

    return Math.max(minRate, Math.min(maxRate, adaptiveRate));
  }

  private breedChild(
    sortedPopulation: Genome[],
    fitnesses: number[],
    mutationRate: number
  ): Genome {
    const parent1: Genome = this.tournament(
      sortedPopulation,
      fitnesses,
      this.config.tournamentSize
    );
    const parent2: Genome = this.tournament(
      sortedPopulation,
      fitnesses,
      this.config.tournamentSize
    );

    let child: Genome = crossover(parent1, parent2);
    child = mutate(child, mutationRate);

    return child;
  }

  private tournament(
    population: Genome[],
    fitnesses: number[],
    tournamentSize: number
  ): Genome {
    let best: { genome: Genome; fitness: number } | null = null;

    for (let round: number = 0; round < tournamentSize; round++) {
      const index: number = Math.floor(Math.random() * population.length);
      const genome: Genome = population[index];
      const fitness = fitnesses[index];

      if (!best || fitness > best.fitness) {
        best = { genome, fitness };
      }
    }

    return best!.genome;
  }
}
