import React, { createContext, useReducer, useContext, ReactNode, useCallback } from "react";

// --- Types ---
export interface TopbarItem {
  id: string;
  title: string;
  icon?: React.ReactNode;
  fromApp?: boolean;
  items?: {
    label: string;
    icon?: React.ReactNode;
    gap?: boolean;
    onClick?: () => void;
  }[];
}

type TopbarState = {
  menus: TopbarItem[];
};

type TopbarAction =
  | { type: "ADD_MENU"; payload: TopbarItem }          // add or replace by id
  | { type: "REMOVE_MENU"; payload: { id: string } }  // remove by id
  | { type: "CLEAR" }
  | { type: "UPDATE_MENU"; payload: { id: string; updater: (menu: TopbarItem) => TopbarItem } } // update by id
  | { type: "SET_MENU"; payload: TopbarItem[] };

// --- Reducer ---
const topbarReducer = (state: TopbarState, action: TopbarAction): TopbarState => {
  switch (action.type) {
    case "ADD_MENU": {
      const idx = state.menus.findIndex(m => m.id === action.payload.id);
      if (idx === -1) return { ...state, menus: [...state.menus, action.payload] };
      const newMenus = [...state.menus];
      newMenus[idx] = action.payload; // replace completely
      return { ...state, menus: newMenus };
    }

    case "REMOVE_MENU":
      return { ...state, menus: state.menus.filter(m => m.id !== action.payload.id) };

    case "CLEAR":
      return { ...state, menus: [] };

    case "UPDATE_MENU": {
      const idx = state.menus.findIndex(m => m.id === action.payload.id);
      if (idx === -1) return state; // nothing to update
      const newMenus = [...state.menus];
      newMenus[idx] = action.payload.updater(newMenus[idx]);
      return { ...state, menus: newMenus };
    }

    case "SET_MENU":
      return { ...state, menus: action.payload };

    default:
      return state;
  }
};

// --- Context ---
interface TopbarContextValue {
  menus: TopbarItem[];
  addMenu: (menu: TopbarItem) => void;
  removeMenu: (id: string) => void;
  clearMenus: () => void;
  updateMenu: (id: string, updater: (menu: TopbarItem) => TopbarItem) => void;
  setMenus: (menus: TopbarItem[]) => void;
}

const TopbarContext = createContext<TopbarContextValue | undefined>(undefined);

// --- Provider ---
export const TopbarProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(topbarReducer, { menus: [] });

  const addMenu = useCallback((menu: TopbarItem) => dispatch({ type: "ADD_MENU", payload: menu }), []);
  const removeMenu = useCallback((id: string) => dispatch({ type: "REMOVE_MENU", payload: { id } }), []);
  const clearMenus = useCallback(() => dispatch({ type: "CLEAR" }), []);
  const updateMenu = useCallback(
    (id: string, updater: (menu: TopbarItem) => TopbarItem) =>
      dispatch({ type: "UPDATE_MENU", payload: { id, updater } }),
    []
  );
  const setMenus = useCallback((menus: TopbarItem[]) => dispatch({ type: "SET_MENU", payload: menus }), []);

  return (
    <TopbarContext.Provider value={{ menus: state.menus, addMenu, removeMenu, clearMenus, updateMenu, setMenus }}>
      {children}
    </TopbarContext.Provider>
  );
};

// --- Hook ---
export const useTopbar = () => {
  const ctx = useContext(TopbarContext);
  if (!ctx) throw new Error("useTopbar must be used within a TopbarProvider");
  return ctx;
};
