import { DragType, DragTypeMap } from "./dragTypes";

export type DragItem<T extends DragType = DragType> = {
  type: T;
  payload: DragTypeMap[T];
  meta?: {
    path?: string;
    [key: string]: any;
  };
};

let currentDrag: DragItem | null = null;
const listeners = new Set<() => void>();

export const dragManager = {
  setDrag<T extends DragType>(data: DragItem<T>) {
    currentDrag = data;
    listeners.forEach((cb) => cb());
  },
  getDrag: () => currentDrag,
  clearDrag() {
    currentDrag = null;
    listeners.forEach((cb) => cb());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
