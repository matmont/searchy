export interface Grid {
  numberOfRows: number;
  numberOfColumns: number;
}

export interface Coordinates {
  row: number;
  column: number;
}

export enum Actions {
  UP,
  RIGHT,
  LEFT,
  BOTTOM,
}

export enum Algorithms {
  DFS = "DFS",
  BFS = "BFS",
}

export interface FrontierNode {
  id: string;
  parent?: FrontierNode;
  cost: number;
}

export interface SearchState {
  state: "idle" | "running";
  startingPlayerPosition?: string;
  goalPosition?: string;
  grid?: Grid;
  walls?: Map<string, boolean>;
  selectedAlgorithm: Algorithms;
  solutionPath?: string[];
  elapsedTime?: number;
  steps: {
    playerPosition: string;
    goalPosition: string;
    visitedCells: Map<string, boolean>;
    frontier: FrontierNode[];
  }[];
}
