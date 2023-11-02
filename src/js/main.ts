import "../style.css";
import { Events } from "./lib/problem/events";
import Problem from "./lib/problem/problem";
import { Algorithms } from "./lib/problem/types";
import Renderer from "./ui/renderer";

document.addEventListener("DOMContentLoaded", () => {
  const problem = new Problem();
  const renderer = new Renderer(problem);
  renderer.drawGrid();
  initController(problem);
  problem.generateMaze();
});

const initController = (problem: Problem): boolean => {
  const numberOfRowsController = document.getElementById(
    "rows-controller"
  ) as HTMLInputElement;
  const numberOfColumnsController = document.getElementById(
    "columns-controller"
  ) as HTMLInputElement;
  if (!numberOfRowsController || !numberOfColumnsController) return false;
  problem.setNumberOfColumns(+numberOfColumnsController.value);
  problem.setNumberOfRows(+numberOfRowsController.value);

  numberOfColumnsController.oninput = (event) => {
    if (!!event.target && "value" in event.target) {
      problem.setNumberOfColumns(+(event.target.value as string));
    }
  };
  numberOfRowsController.oninput = (event) => {
    if (!!event.target && "value" in event.target) {
      problem.setNumberOfRows(+(event.target.value as string));
    }
  };

  const mazeGenBtn = document.getElementById("maze-generation-button");
  if (mazeGenBtn) mazeGenBtn.onclick = () => problem.generateMaze();

  const searchStartBtn = document.getElementById("search-start-button");
  if (searchStartBtn) searchStartBtn.onclick = () => problem.start();

  document.addEventListener(Events.SEARCH_STARTED, () => {
    const inputs = document
      .getElementById("controllers")
      ?.querySelectorAll("input, button, select");
    console.log(inputs?.length);
    if (!inputs) return;
    for (let input of inputs) {
      input.setAttribute("disabled", "true");
    }
  });

  document.addEventListener(Events.SEARCH_DRAW_FINISHED, () => {
    const inputs = document
      .getElementById("controllers")
      ?.querySelectorAll("input, button, select");
    if (!inputs) return;
    for (let input of inputs) {
      input.removeAttribute("disabled");
    }
  });

  const algorithmSelector = document.getElementById(
    "algorithm-controller"
  ) as HTMLSelectElement;
  console.log(algorithmSelector);
  Object.values(Algorithms).forEach((value) => {
    const algorithmOption = document.createElement("option");
    algorithmOption.text = value;
    algorithmOption.value = value;
    algorithmSelector?.appendChild(algorithmOption);
  });
  if (!!algorithmSelector) {
    algorithmSelector.onchange = (event) => {
      if (!!event.target && "value" in event.target) {
        problem.searchState.selectedAlgorithm = event.target
          .value as Algorithms;
      }
    };
  }
  return true;
};
