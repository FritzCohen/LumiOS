// Only file to use dispatch. Not sure if its a great solution.

import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import React, { createContext, useContext, ReactNode, useCallback, useReducer } from 'react';

// Define the TopbarItem interface
interface TopbarItem {
  name: string;
  icon?: IconDefinition;
  id?: string | number;
  action?: (() => Promise<void>) | (() => void);
  dropdownItems?: Omit<TopbarItem[], 'id'>;
}

// Define the context value type
interface TopbarContextType {
  array: TopbarItem[];
  addToTopbar: (item: Omit<TopbarItem, 'id'>) => void;
  modifyTopbarProp: (id: string | number, prop: Partial<TopbarItem>) => void;
  addPropToTopbar: (id: string | number, key: keyof TopbarItem, value: any) => void;
  removeFromTopbar: (id: string | number) => void;
}

// Action Types for Reducer
type TopbarAction =
  | { type: 'ADD'; item: Omit<TopbarItem, 'id'> }
  | { type: 'MODIFY'; id: string | number; prop: Partial<TopbarItem> }
  | { type: 'ADD_PROP'; id: string | number; key: keyof TopbarItem; value: any }
  | { type: 'REMOVE'; id: string | number };

// Reducer function for state management
const topbarReducer = (state: TopbarItem[], action: TopbarAction): TopbarItem[] => {
  switch (action.type) {
    case 'ADD':
      return [...state, { ...action.item, id: state.length + 1 }];
    case 'MODIFY':
      return state.map(item =>
        (typeof action.id === 'number' ? item.id === action.id : item.name === action.id)
          ? { ...item, ...action.prop }
          : item
      );
    case 'ADD_PROP':
      return state.map(item =>
        (typeof action.id === 'number' ? item.id === action.id : item.name === action.id)
          ? { ...item, [action.key]: action.value }
          : item
      );
    case 'REMOVE':
      return state.filter(item => (typeof action.id === 'number' ? item.id !== action.id : item.name !== action.id));
    default:
      return state;
  }
};

// Create the context with default values
const TopbarContext = createContext<TopbarContextType | undefined>(undefined);

interface TopbarProviderProps {
  children: ReactNode;
}

const TopbarProvider: React.FC<TopbarProviderProps> = ({ children }) => {
  const [array, dispatch] = useReducer(topbarReducer, []); // Use useReducer for better state management

  const addToTopbar = useCallback((item: Omit<TopbarItem, 'id'>) => {
    dispatch({ type: 'ADD', item });
  }, []);

  const modifyTopbarProp = useCallback((id: string | number, prop: Partial<TopbarItem>) => {
    dispatch({ type: 'MODIFY', id, prop });
  }, []);

  const addPropToTopbar = useCallback((id: string | number, key: keyof TopbarItem, value: any) => {
    dispatch({ type: 'ADD_PROP', id, key, value });
  }, []);

  const removeFromTopbar = useCallback((id: string | number) => {
    dispatch({ type: 'REMOVE', id });
  }, []);

  return (
    <TopbarContext.Provider value={{ array, addToTopbar, modifyTopbarProp, addPropToTopbar, removeFromTopbar }}>
      {children}
    </TopbarContext.Provider>
  );
};

// Custom hook to use the TopbarContext
const useTopbarContext = () => {
  const context = useContext(TopbarContext);
  if (!context) {
    throw new Error('useTopbarContext must be used within a TopbarProvider');
  }
  return context;
};

export { TopbarContext, TopbarProvider, useTopbarContext };