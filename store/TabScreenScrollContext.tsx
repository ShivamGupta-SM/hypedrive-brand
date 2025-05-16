import { createContext, useContext } from 'react';

export type ScrollContextType = {
  scrollDirection: 'up' | 'down' | 'top';
  scrollPosition: number;
  setSetscrollDirection: (direction: 'up' | 'down' | 'top') => void;
  setScrollPosition: (position: number) => void;
};

export const ScrollContext = createContext<ScrollContextType>({
  scrollDirection: 'top',
  scrollPosition: 0,
  setSetscrollDirection: () => {},
  setScrollPosition: () => {},
});

export const useScrollContext = () => useContext(ScrollContext);
