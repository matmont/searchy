import { FrontierNode, SearchState } from "../problem/types";

self.onmessage = (e) => {
  try {
    const startingSearchState = e.data as SearchState;
    const startingTime = performance.now();
    const {
      selectedAlgorithm,
      startingPlayerPosition,
      steps,
      goalPosition,
      walls,
    } = startingSearchState;
    const frontier: FrontierNode[] = [
      {
        depth: 0,
        id: startingPlayerPosition!,
        heuristic:
          selectedAlgorithm === "A*"
            ? manhattanDistance(startingPlayerPosition!, goalPosition!)
            : 0,
      },
    ];
    const visited = new Map<string, number>();
    let stepCounter = 0;
    let currentNode: FrontierNode | null = null;
    while (!!frontier.length) {
      currentNode = null;
      switch (selectedAlgorithm) {
        case "DFS":
          currentNode = frontier.pop()!;
          break;
        case "BFS":
          currentNode = frontier.shift()!;
          break;
        case "A*":
          currentNode = frontier
            .sort((a, b) => {
              return a.depth + a.heuristic - (b.depth + b.heuristic);
            })
            .shift()!;
          break;
        default:
          break;
      }
      if (!currentNode) return;
      const { id, depth, heuristic } = currentNode;
      if (isVisitedBetter(id, depth + heuristic, visited)) {
        continue;
      }
      visited.set(id, depth + heuristic);
      if (id === goalPosition) {
        steps.push({
          frontier,
          visitedCells: new Map(visited),
          playerPosition: currentNode.id,
          goalPosition: goalPosition!,
        });
        const solutionPath = buildSolutionPath(currentNode);
        postMessage({
          type: "MESSAGE@STEP",
          stepNumber: 0,
          payload: {
            ...startingSearchState,
            solutionPath,
            elapsedTime: performance.now() - startingTime,
            steps,
          } as SearchState,
        });

        postMessage({
          type: "MESSAGE@SEARCH_FINISHED",
        });
        return;
      }
      let targetNodeId = "";
      const [row, column] = id.split("@");
      const actions = [0, 1, 2, 3].sort(() => 0.5 - Math.random());
      actions.forEach((action) => {
        switch (action) {
          case 0:
            targetNodeId = `${+row}@${+column - 1}`;
            if (walls?.get(targetNodeId)) return;
            break;
          case 1:
            targetNodeId = `${+row + 1}@${+column}`;
            if (walls?.get(targetNodeId)) return;
            break;
          case 2:
            targetNodeId = `${+row}@${+column + 1}`;
            if (walls?.get(targetNodeId)) return;
            break;
          case 3:
            targetNodeId = `${+row - 1}@${+column}`;
            if (walls?.get(targetNodeId)) return;
            break;
        }
        frontier.push({
          id: targetNodeId,
          depth: currentNode!.depth + 1,
          parent: currentNode!,
          heuristic:
            selectedAlgorithm === "A*"
              ? manhattanDistance(targetNodeId, goalPosition!)
              : 0,
        });
      });

      steps.push({
        frontier,
        visitedCells: new Map(visited),
        playerPosition: currentNode.id,
        goalPosition: goalPosition!,
      });
      postMessage({
        type: "MESSAGE@STEP",
        stepNumber: 0,
        payload: {
          ...startingSearchState,
          steps,
        } as SearchState,
      });

      stepCounter += 1;
    }
  } catch {
    console.log("MALE!");
  }
};

const buildSolutionPath = (node: FrontierNode) => {
  let solution = [node.id];
  let parent = node.parent;
  while (parent != null) {
    solution.push(parent.id);
    parent = parent.parent;
  }
  return solution;
};

const manhattanDistance = (id_cell: string, id_goal: string) => {
  const [row_a, col_a] = id_cell.split("@");
  const [row_goal, col_goal] = id_goal.split("@");
  return Math.abs(+row_a - +row_goal) + Math.abs(+col_a - +col_goal);
};

const isVisitedBetter = (
  id: string,
  cost: number,
  visited: Map<string, number>
) => {
  if (typeof visited.get(id) == null) return false;
  if (visited.get(id)! < cost) return true;
  return false;
};
