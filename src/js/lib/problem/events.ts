export enum Events {
  GRID_CHANGED = "GRID@CHANGED",
  MAZE_GENERATED = "GRID@MAZE_GENERATED",
  SEARCH_STARTED = "SEARCH@STARTED",
  SEARCH_FINISHED = "SEARCH@FINISHED",
  SEARCH_NEW_STEP = "SEARCH@NEW_STEP",
  SEARCH_DRAW_FINISHED = "SEARCH@DRAW_FINISHED",
}

export const dispatch = (ev: Events) => {
  document.dispatchEvent(new Event(ev));
};
