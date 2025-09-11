import { Logger } from "../utils/Logger.js";

export type Direction = "up" | "down" | "left" | "right";

export class Board {
  private readonly _grid: number[][];
  private _score: number;
  private _maxTile: number;
  private static readonly _serializeBuffer: string[] = new Array(31).fill("");
  private logger: Logger;

  constructor(initialGrid?: number[][], initialScore: number = 0) {
    this._grid = initialGrid
      ? initialGrid.map((row: number[]): number[] => row.slice())
      : Array.from({ length: 4 }, (): number[] => Array(4).fill(0));
    this._score = initialScore;
    this._maxTile = this.calculateMaxTile();
    this.logger = Logger.getInstance();

    if (!initialGrid) {
      this.addRandomTile();
      this.addRandomTile();
    }
  }

  private calculateMaxTile(): number {
    let maxValue: number = 0;

    for (let row: number = 0; row < 4; row++) {
      for (let column: number = 0; column < 4; column++) {
        maxValue = Math.max(maxValue, this._grid[row][column]);
      }
    }

    return maxValue;
  }

  private addRandomTile(): boolean {
    const emptyCells: { row: number; column: number }[] = this.emptyCells;

    if (emptyCells.length === 0) {
      return false;
    }

    const randomIndex: number = Math.floor(Math.random() * emptyCells.length);
    const { row, column } = emptyCells[randomIndex];
    const newValue: number = Math.random() < 0.9 ? 2 : 4;
    this.grid[row][column] = newValue;
    this._maxTile = Math.max(this._maxTile, newValue);

    return true;
  }

  public get grid(): number[][] {
    return this._grid;
  }

  public get score(): number {
    return this._score;
  }

  public get maxTile(): number {
    return this._maxTile;
  }

  public get isGameOver(): boolean {
    return this.availableMoves.length === 0;
  }

  public get emptyCells(): { row: number; column: number }[] {
    const emptyCells: { row: number; column: number }[] = [];

    for (let row: number = 0; row < 4; row++) {
      for (let column: number = 0; column < 4; column++) {
        if (this.grid[row][column] === 0) {
          emptyCells.push({ row, column });
        }
      }
    }

    return emptyCells;
  }

  public get availableMoves(): Direction[] {
    const validMoves = new Set<Direction>();

    for (let row: number = 0; row < 4 && validMoves.size < 2; row++) {
      const { positive, negative } = this.canMove(this.grid[row]);

      if (positive) {
        validMoves.add("left");
      }

      if (negative) {
        validMoves.add("right");
      }
    }

    for (let column: number = 0; column < 4 && validMoves.size < 4; column++) {
      const columnValues = [
        this.grid[0][column],
        this.grid[1][column],
        this.grid[2][column],
        this.grid[3][column],
      ];
      const { positive, negative } = this.canMove(columnValues);

      if (positive) {
        validMoves.add("up");
      }

      if (negative) {
        validMoves.add("down");
      }
    }

    return Array.from(validMoves);
  }

  private canMove(values: number[]): { positive: boolean; negative: boolean } {
    let canMovePositive: boolean = false;
    let canMoveNegative: boolean = false;
    let lastValue: number = values[0];

    for (let i: number = 1; i < values.length; i++) {
      const currentValue: number = values[i];

      if (currentValue === 0 && lastValue !== 0) {
        canMoveNegative = true;
      } else if (currentValue !== 0) {
        if (lastValue === 0 || lastValue === currentValue) {
          canMovePositive = true;
          canMoveNegative = lastValue === currentValue ? true : canMoveNegative;
        }
      }

      lastValue = currentValue;
    }

    return { positive: canMovePositive, negative: canMoveNegative };
  }

  public print(): void {
    const borderLine: string = "+----+----+----+----+";
    this.logger.log(borderLine);

    for (let row: number = 0; row < 4; row++) {
      let rowString: string = "|";

      for (let column: number = 0; column < 4; column++) {
        const cellValue: string =
          this.grid[row][column] === 0
            ? " "
            : this.grid[row][column].toString();
        rowString += cellValue.padStart(4, " ") + "|";
      }

      this.logger.log(rowString);
      this.logger.log(borderLine);
    }

    this.logger.log(`Score: ${this.score}`);
  }

  public clone(): Board {
    return new Board(this.grid, this.score);
  }

  public move(direction: Direction, withRandom: boolean = true): boolean {
    const boardStateBefore: string = this.serialize();

    switch (direction) {
      case "up":
        for (let column: number = 0; column < 4; column++) {
          this.processColumn(column, +1);
        }

        break;
      case "down":
        for (let column: number = 0; column < 4; column++) {
          this.processColumn(column, -1);
        }

        break;
      case "left":
        for (let row: number = 0; row < 4; row++) {
          this.processRow(row, +1);
        }

        break;
      case "right":
        for (let row: number = 0; row < 4; row++) {
          this.processRow(row, -1);
        }

        break;
    }

    const boardStateAfter: string = this.serialize();
    const boardChanged: boolean = boardStateBefore !== boardStateAfter;

    if (boardChanged && withRandom) {
      this.addRandomTile();
    }

    return boardChanged;
  }

  private serialize(): string {
    let bufferIndex: number = 0;

    for (let row: number = 0; row < 4; row++) {
      for (let column: number = 0; column < 4; column++) {
        Board._serializeBuffer[bufferIndex++] =
          this._grid[row][column].toString();

        if (column < 3) {
          Board._serializeBuffer[bufferIndex++] = ",";
        }
      }

      if (row < 3) {
        Board._serializeBuffer[bufferIndex++] = "|";
      }
    }

    return Board._serializeBuffer.slice(0, bufferIndex).join("");
  }

  private processColumn(column: number, direction: 1 | -1): void {
    const columnValues: number[] = [
      this.grid[0][column],
      this.grid[1][column],
      this.grid[2][column],
      this.grid[3][column],
    ];

    const processedValues: number[] = this.processLine(columnValues, direction);

    for (let row: number = 0; row < 4; row++) {
      this.grid[row][column] = processedValues[row];
    }
  }

  private processRow(row: number, direction: 1 | -1): void {
    const rowValues: number[] = this.grid[row].slice();
    const processedValues: number[] = this.processLine(rowValues, direction);
    this.grid[row] = processedValues;
  }

  private processLine(line: number[], direction: 1 | -1): number[] {
    const orderedValues: number[] =
      direction === 1 ? line : line.slice().reverse();

    const compressedValues: number[] = orderedValues.filter(
      (value: number): boolean => value !== 0
    );

    const mergedValues: number[] = [];
    let index: number = 0;

    while (index < compressedValues.length) {
      if (
        index + 1 < compressedValues.length &&
        compressedValues[index] === compressedValues[index + 1]
      ) {
        const mergedValue: number = compressedValues[index] * 2;
        mergedValues.push(mergedValue);
        this._score += mergedValue;
        this._maxTile = Math.max(this._maxTile, mergedValue);
        index += 2;
      } else {
        mergedValues.push(compressedValues[index]);
        index += 1;
      }
    }

    while (mergedValues.length < 4) {
      mergedValues.push(0);
    }

    const finalValues: number[] =
      direction === 1 ? mergedValues : mergedValues.slice().reverse();

    return finalValues;
  }
}
