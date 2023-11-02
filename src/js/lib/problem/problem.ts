import { generateMaze } from "../maze/generator";
import { Events, dispatch } from "./events";
import { Grid, SearchState, Algorithms } from "./types";

class Problem {
  private _grid: Grid = {
    numberOfColumns: 15,
    numberOfRows: 15,
  };
  private _playerCellId: string | undefined;
  private _goalCellId: string | undefined;
  /**
   * a Map where keys are id of cells 'i@j' and keys a boolean indicating
   * whether the cell is a wall or not
   */
  private _walls: Map<string, boolean> = new Map();
  private _searchState: SearchState = {
    state: "idle",
    steps: [],
    selectedAlgorithm: Algorithms.DFS,
  };
  private _searchingWorker: Worker | undefined;

  get playerCellId() {
    return this._playerCellId;
  }

  get grid() {
    return this._grid;
  }

  get walls() {
    return this._walls;
  }

  get goalCellId() {
    return this._goalCellId;
  }

  get searchState() {
    return this._searchState;
  }

  public setNumberOfColumns(cols: number) {
    this._grid.numberOfColumns = cols;
    dispatch(Events.GRID_CHANGED);
  }

  public setNumberOfRows(rows: number) {
    this._grid.numberOfRows = rows;
    dispatch(Events.GRID_CHANGED);
  }

  public generateMaze() {
    const { numberOfColumns, numberOfRows } = this._grid;
    const [generatedWalls, playerCell, goalCell] = generateMaze(
      numberOfRows,
      numberOfColumns
    );
    this._walls = generatedWalls;
    this._playerCellId = playerCell;
    this._goalCellId = goalCell;
    dispatch(Events.GRID_CHANGED);
  }

  public start() {
    if (!this._playerCellId || !this._goalCellId) return;
    if (typeof Worker !== "undefined") {
      if (!!this._searchingWorker) this._searchingWorker.terminate();

      this._searchState.state = "running";
      this._searchState.steps = [];
      this._searchState.startingPlayerPosition = this._playerCellId;
      this._searchState.goalPosition = this._goalCellId;
      this._searchState.grid = this._grid;
      this._searchState.walls = this._walls;

      this._searchingWorker = new Worker(
        new URL("../workers/searchWorker.ts", import.meta.url)
      );
      this._searchingWorker.postMessage(this._searchState);
      this._searchingWorker.onmessage = (e) => {
        const message = e.data;
        if (message.type === "MESSAGE@STEP") {
          this._searchState = message.payload;
          dispatch(Events.SEARCH_NEW_STEP);
        } else if (message.type === "MESSAGE@SEARCH_FINISHED") {
          this._searchingWorker?.terminate();
          this._searchState.state = "idle";
          dispatch(Events.SEARCH_FINISHED);
        }
      };
      dispatch(Events.SEARCH_STARTED);
    } else {
      console.log("WEWE");
      // TODO: implement an alternative strategy without WebWorker usage
    }
  }
}

export default Problem;
