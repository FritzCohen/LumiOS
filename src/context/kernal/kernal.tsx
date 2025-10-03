import React, { createContext, useReducer, ReactNode } from "react";
import type { Executable } from "../../types/globals"; // assuming your interface is here

// App instance state type
export interface OpenedApp {
  id: string;
  executable: Executable;
  minimized: boolean;
  maximized: boolean;
  disableClose: boolean;
  disableMinimize: boolean;
  zIndex: number; // for window stacking order
  x: number;
  y: number;
  width: number;
  height: number;
  freezeBackground?: boolean
}

type KernelState = {
  openedApps: { [id: string]: OpenedApp };
  zIndexCounter: number;
  order: string[]; // ordered list of app ids by their zIndex, last is topmost
  currentId: number;
};

type KernelAction =
  | { type: "OPEN_APP"; executable: Executable; id?: string }
  | { type: "CLOSE_APP"; id: string }
  | { type: "MINIMIZE_APP"; id: string }
  | { type: "RESTORE_APP"; id: string }
  | { type: "BRING_TO_FRONT"; id: string }
  | { type: "MODIFY_APP_PROP"; id: string; prop: keyof OpenedApp; value: any };

const initialState: KernelState = {
  openedApps: {},
  zIndexCounter: 10,
  order: [],
  currentId: 0,
};

function kernelReducer(state: KernelState, action: KernelAction): KernelState {
  switch (action.type) {
    case "OPEN_APP": {
      const id = action.id || state.currentId.toString();
      
      if (state.openedApps[id]) return state; // already opened, ignore or bring to front?

      const newZIndex = state.zIndexCounter + 1;
      const newApp: OpenedApp = {
        id,
        executable: action.executable,
        minimized: false,
        maximized: false,
        disableClose: false,
        disableMinimize: false,
        x: window.innerWidth / 2 - 400/2,
        y: window.innerHeight / 2 - 300/2,
        width: 500,
        height: 400,
        zIndex: newZIndex,
      };

      return {
        openedApps: { ...state.openedApps, [id]: newApp },
        zIndexCounter: newZIndex,
        order: [...state.order, id],
        currentId: state.currentId+1,
      };
    }

    case "CLOSE_APP": {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [action.id]: _unused, ...rest } = state.openedApps;
      return {
        ...state,
        openedApps: rest,
        order: state.order.filter((appId) => appId !== action.id),
      };
    }

    case "MINIMIZE_APP": {
      const app = state.openedApps[action.id];
      if (!app || app.minimized) return state;

      return {
        ...state,
        openedApps: {
          ...state.openedApps,
          [action.id]: { ...app, minimized: true },
        },
      };
    }

    case "RESTORE_APP": {
      const app = state.openedApps[action.id];
      if (!app || !app.minimized) return state;

      const newZIndex = state.zIndexCounter + 1;
      return {
        openedApps: {
          ...state.openedApps,
          [action.id]: { ...app, minimized: false, zIndex: newZIndex },
        },
        zIndexCounter: newZIndex,
        order: [...state.order.filter((id) => id !== action.id), action.id],
        currentId: state.currentId,
      };
    }

    case "BRING_TO_FRONT": {
      const app = state.openedApps[action.id];
      if (!app) return state;

      if (app.zIndex === state.zIndexCounter) return state; // already front

      const newZIndex = state.zIndexCounter + 1;
      return {
        openedApps: {
          ...state.openedApps,
          [action.id]: { ...app, zIndex: newZIndex },
        },
        zIndexCounter: newZIndex,
        order: [...state.order.filter((id) => id !== action.id), action.id],
        currentId: state.currentId,
      };
    }

    case "MODIFY_APP_PROP": {
      const app = state.openedApps[action.id];
      if (!app) return state;

      return {
        ...state,
        openedApps: {
          ...state.openedApps,
          [action.id]: { ...app, [action.prop]: action.value },
        },
      };
    }

    default:
      return state;
  }
}

interface KernelContextValue {
  state: KernelState;
  openedApps: readonly OpenedApp[];
  openApp: (executable: Executable, id?: string) => any;
  closeApp: (id: string) => void;
  minimizeApp: (id: string) => void;
  restoreApp: (id: string) => void;
  bringToFront: (id: string) => void;
  modifyProp: <T extends keyof OpenedApp>(
    id: string,
    prop: T,
    value: OpenedApp[T]
  ) => void;
}

export const KernelContext = createContext<KernelContextValue | undefined>(
  undefined
);

export const KernelProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(kernelReducer, initialState);

  const openApp = (executable: Executable, id?: string): Promise<any> => {
    return new Promise((resolve) => {
      // Wrap or clone executable.config to inject a handler that resolves the promise
      const wrappedExecutable = {
        ...executable,
        config: {
          ...executable.config,
          onCompleteHandler: (result: any) => {
            // Call existing handler if any
            executable.config.onCompleteHandler?.(result);
            resolve(result); // resolve promise when app completes
          },
        },
      };

      // Now open the app normally, but with wrappedExecutable instead
      dispatch({
        type: "OPEN_APP",
        executable: wrappedExecutable,
        id,
      });
    });
  };
  const closeApp = (id: string) => dispatch({ type: "CLOSE_APP", id });
  const minimizeApp = (id: string) => dispatch({ type: "MINIMIZE_APP", id });
  const restoreApp = (id: string) => dispatch({ type: "RESTORE_APP", id });
  const bringToFront = (id: string) => dispatch({ type: "BRING_TO_FRONT", id });
  const modifyProp = <T extends keyof OpenedApp>(
    id: string,
    prop: T,
    value: OpenedApp[T]
  ) => {
    dispatch({ type: "MODIFY_APP_PROP", id, prop, value });
  };

  return (
    <KernelContext.Provider
      value={{
        state,
        openedApps: Object.values(state.openedApps),
        openApp,
        closeApp,
        minimizeApp,
        restoreApp,
        bringToFront,
        modifyProp,
      }}
    >
      {children}
    </KernelContext.Provider>
  );
};
