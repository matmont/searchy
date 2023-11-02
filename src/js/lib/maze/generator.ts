import { cellId } from "../utils";

enum DFSActions {
  UP,
  RIGHT,
  BOTTOM,
  LEFT,
}

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomKey(collection: Map<string, unknown>) {
  let index = Math.floor(Math.random() * collection.size);
  let cntr = 0;
  for (let key of collection.keys()) {
    if (cntr++ === index) {
      return key;
    }
  }
}

export const generateMaze = (
  numberOfRows: number,
  numberOfColumns: number
): [Map<string, boolean>, string, string] => {
  const walls = new Map<string, boolean>();
  let playerCell = "";
  let goalCell = "";

  for (let i = 0; i < numberOfRows; i++) {
    for (let j = 0; j < numberOfColumns; j++) {
      walls.set(cellId(i, j), true);
    }
  }

  // Maze Generation with DFS algorithm
  let currentRow = getRandomInt(1, numberOfRows - 2);
  if (currentRow % 2 == 0) currentRow += 1;
  let currentColumn = getRandomInt(1, numberOfColumns - 2);
  if (currentColumn % 2 == 0) currentColumn += 1;
  const queue = [`${currentRow}@${currentColumn}`];
  while (!!queue.length) {
    const toVisit = queue.pop()!;
    const [row, column] = toVisit.split("@");
    walls.set(toVisit, false);
    let finalColumn = 0;
    let finalRow = 0;

    const actions = Object.values(DFSActions).sort(() => 0.5 - Math.random());
    actions.forEach((action) => {
      switch (action) {
        case DFSActions.UP:
          finalColumn = +column - 2;
          if (!!walls.get(cellId(+row, finalColumn)) && finalColumn >= 0) {
            walls.set(cellId(+row, finalColumn), false);
            walls.set(cellId(+row, finalColumn + 1), false);
            queue.push(cellId(+row, finalColumn));
          }
          break;
        case DFSActions.RIGHT:
          finalRow = +row + 2;
          if (
            !!walls.get(cellId(finalRow, +column)) &&
            finalRow < numberOfRows
          ) {
            walls.set(cellId(finalRow, +column), false);
            walls.set(cellId(finalRow - 1, +column), false);
            queue.push(cellId(finalRow, +column));
          }
          break;
        case DFSActions.BOTTOM:
          finalColumn = +column + 2;
          if (
            !!walls.get(cellId(+row, finalColumn)) &&
            finalColumn < numberOfColumns
          ) {
            walls.set(cellId(+row, finalColumn), false);
            walls.set(cellId(+row, finalColumn - 1), false);
            queue.push(cellId(+row, finalColumn));
          }
          break;
        case DFSActions.LEFT:
          finalRow = +row - 2;
          if (!!walls.get(cellId(finalRow, +column)) && finalRow >= 0) {
            walls.set(cellId(finalRow, +column), false);
            walls.set(cellId(finalRow + 1, +column), false);
            queue.push(cellId(finalRow, +column));
          }
          break;
      }
    });
  }

  while (playerCell == "") {
    const randomKey = getRandomKey(walls);
    if (randomKey && !walls.get(randomKey)) {
      playerCell = randomKey;
    }
  }

  while (goalCell == "") {
    const randomKey = getRandomKey(walls);
    if (randomKey && !walls.get(randomKey) && randomKey != playerCell) {
      goalCell = randomKey;
    }
  }
  return [walls, playerCell, goalCell];
};
