import { Genome } from "./Genome.js";

export function mutate(
  genome: Genome,
  rate: number = 0.2,
  sigma: number = 0.2
): Genome {
  const newGenome: Genome = { ...genome };

  for (const key of Object.keys(newGenome) as (keyof Genome)[]) {
    if (key === "weightPositional") {
      newGenome.weightPositional = newGenome.weightPositional.map(
        (row: number[]): number[] =>
          row.map((cell: number): number =>
            Math.random() < rate ? cell + gaussian(0, sigma) : cell
          )
      );
    } else if (Math.random() < rate) {
      (newGenome[key] as number) += gaussian(0, sigma);
    }
  }

  return newGenome;
}

function gaussian(mu: number = 0, sigma: number = 1): number {
  let x: number = 0;
  let y: number = 0;

  while (x === 0) {
    x = Math.random();
  }

  while (y === 0) {
    y = Math.random();
  }

  return (
    mu + sigma * Math.sqrt(-2.0 * Math.log(x)) * Math.cos(2.0 * Math.PI * y)
  );
}

export function crossover(
  genomeA: Genome,
  genomeB: Genome,
  alpha?: number
): Genome {
  const actualAlpha = alpha ?? Math.random();
  const child: Genome = {} as Genome;

  for (const key of Object.keys(genomeA) as (keyof Genome)[]) {
    if (key === "weightPositional") {
      child.weightPositional = genomeA.weightPositional.map(
        (row: number[], rowIndex: number): number[] =>
          row.map(
            (cell: number, cellIndex: number): number =>
              cell * actualAlpha +
              (genomeB.weightPositional[rowIndex][cellIndex] * (1 - actualAlpha) || 0)
          )
      );
    } else {
      (child[key] as number) =
        (genomeA[key] as number) * actualAlpha +
        (genomeB[key] as number) * (1 - actualAlpha);
    }
  }

  return child;
}
