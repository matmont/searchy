import { FrontierNode, SearchState } from "../problem/types";

self.onmessage = (e) => {
  try {
    const startingSearchState = e.data as SearchState;
    const {
      selectedAlgorithm,
      startingPlayerPosition,
      steps,
      goalPosition,
      walls,
    } = startingSearchState;
    const frontier: FrontierNode[] = [
      {
        cost: 0,
        id: startingPlayerPosition!,
      },
    ];
    const visited = new Map<string, boolean>();
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
        default:
          break;
      }
      if (!currentNode) return;
      const { id } = currentNode;
      if (visited.get(id)) break;
      visited.set(id, true);
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
            if (visited.get(targetNodeId) || walls?.get(targetNodeId)) break;
            frontier.push({
              id: targetNodeId,
              cost: currentNode!.cost + 1,
              parent: currentNode!,
            });
            break;
          case 1:
            targetNodeId = `${+row + 1}@${+column}`;
            if (visited.get(targetNodeId) || walls?.get(targetNodeId)) break;
            frontier.push({
              id: targetNodeId,
              cost: currentNode!.cost + 1,
              parent: currentNode!,
            });
            break;
          case 2:
            targetNodeId = `${+row}@${+column + 1}`;
            if (visited.get(targetNodeId) || walls?.get(targetNodeId)) break;
            frontier.push({
              id: targetNodeId,
              cost: currentNode!.cost + 1,
              parent: currentNode!,
            });
            break;
          case 3:
            targetNodeId = `${+row - 1}@${+column}`;
            if (visited.get(targetNodeId) || walls?.get(targetNodeId)) break;
            frontier.push({
              id: targetNodeId,
              cost: currentNode!.cost + 1,
              parent: currentNode!,
            });
            break;
        }
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
