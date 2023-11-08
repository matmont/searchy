import { Events, dispatch } from "../lib/problem/events";
import Problem from "../lib/problem/problem";
import { cellId } from "../lib/utils";

class Renderer {
  problem: Problem;
  gridDOM: HTMLElement;

  constructor(problem: Problem) {
    this.problem = problem;
    this.gridDOM = document.getElementById("grid")!;
    document.addEventListener(Events.GRID_CHANGED, () => this.drawGrid());
    document.addEventListener(Events.SEARCH_STARTED, () => this.drawSearch());
    document.addEventListener(Events.SEARCH_DRAW_FINISHED, () => {
      this.drawSolution();
      this.drawSearchStats();
    });
  }

  public drawGrid() {
    const { numberOfColumns, numberOfRows } = this.problem.grid;
    const { playerCellId, goalCellId } = this.problem;
    this.gridDOM.textContent = "";
    const gridContainerRect =
      this.gridDOM.parentElement?.getBoundingClientRect();
    if (!gridContainerRect) return;
    const widthOfColumns = Math.floor(
      (gridContainerRect.width - 2 * numberOfColumns) / numberOfColumns
    );
    const heightOfRows = Math.floor(
      (gridContainerRect.height - 2 * numberOfRows) / numberOfRows
    );
    const selectedCellSize = Math.min(widthOfColumns, heightOfRows);
    this.gridDOM.style.gridTemplateColumns = `repeat(${numberOfColumns}, ${selectedCellSize}px)`;
    this.gridDOM.style.gridTemplateRows = `repeat(${numberOfRows}, ${selectedCellSize}px)`;
    for (let i = 0; i < numberOfRows; i++) {
      for (let j = 0; j < numberOfColumns; j++) {
        const cell = document.createElement("div");
        cell.setAttribute("class", "cell");
        cell.setAttribute("id", cellId(i, j));
        this.gridDOM?.appendChild(cell);
      }
    }

    const children = this.gridDOM.childNodes;
    for (var i = 0; i < children.length; i++) {
      if (children[i].nodeType === Node.ELEMENT_NODE) {
        // nodeType 3 is a text node
        const childNode = children[i] as HTMLElement;
        const cellId = childNode.getAttribute("id");
        if (!!this.problem.walls.get(cellId ?? "")) {
          childNode.classList.add("wall");
        }
      }
    }

    if (!!playerCellId) {
      const playerCell = document.getElementById(playerCellId);
      playerCell?.classList.add("player");
    }

    if (!!goalCellId) {
      const goalCell = document.getElementById(goalCellId);
      goalCell?.classList.add("goal");
    }
  }

  public drawSearch() {
    const fpsInterval = 1000 / 30;
    let stepDrawnCounter = 0;
    let then = Date.now();
    function update(problem: Problem, gridDom: HTMLElement) {
      if (
        problem.searchState.steps[stepDrawnCounter] == undefined &&
        problem.searchState.state === "idle"
      ) {
        dispatch(Events.SEARCH_DRAW_FINISHED);
        return;
      }
      requestAnimationFrame(() => update(problem, gridDom));
      const now = Date.now();
      const elapsed = now - then;
      if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval);
        const currentStep = problem.searchState.steps[stepDrawnCounter];
        if (!currentStep) {
          return;
        }
        // Drawing!
        const children = gridDom.childNodes;
        for (var i = 0; i < children.length; i++) {
          if (children[i].nodeType === Node.ELEMENT_NODE) {
            const childNode = children[i] as HTMLElement;
            const cellId = childNode.getAttribute("id");
            childNode.classList.remove("player");
            childNode.classList.remove("visited");
            childNode.classList.remove("solution");
            childNode.classList.remove("frontier");
            if (!cellId) return;
            if (currentStep.frontier.find((item) => item.id === cellId)) {
              childNode.classList.add("frontier");
            }
            if (currentStep.playerPosition === cellId) {
              childNode.classList.add("player");
            }
            if (currentStep.visitedCells.get(cellId)) {
              childNode.classList.add("visited");
            }
          }
        }

        stepDrawnCounter += 1;
      }
    }
    requestAnimationFrame(() => update(this.problem, this.gridDOM));
  }

  public drawSolution = () => {
    this.problem.searchState.solutionPath?.forEach((cellId) => {
      const cell = document.getElementById(cellId);
      if (!cell) return;
      cell.classList.add("solution");
    });
    if (!!this.problem.searchState.startingPlayerPosition) {
      const startingPlayerCell = document.getElementById(
        this.problem.searchState.startingPlayerPosition
      );
      startingPlayerCell?.classList.add("player");
    }
  };

  public drawSearchStats = () => {
    const algorithmStats = document.getElementById("stat-algorithm");
    algorithmStats!.querySelector(".stat-value")!.textContent =
      this.problem.searchState.selectedAlgorithm;
    const stepsStats = document.getElementById("stat-steps");
    stepsStats!.querySelector(".stat-value")!.textContent =
      this.problem.searchState.steps.length.toString();
    const timeStats = document.getElementById("stat-time");
    timeStats!.querySelector(".stat-value")!.textContent =
      this.formatElapsedTime(this.problem.searchState.elapsedTime);
    document.getElementById("stats-data")?.classList.remove("not-visible");
    document
      .getElementById("empty-stats-placeholder")
      ?.classList.add("not-visible");
  };

  private formatElapsedTime = (elapsedTime?: number) => {
    if (elapsedTime == undefined) {
      return `N/A`;
    }
    if (elapsedTime < 1000) {
      return `${elapsedTime}ms`;
    }
    return `${(this.problem.searchState.elapsedTime! / 1000).toFixed(2)}s`;
  };
}

export default Renderer;
