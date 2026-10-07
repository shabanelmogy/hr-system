"use client";

import { createContext, useContext, type ReactNode } from "react";

/** Position of a navigation entry among its visible siblings, used to vary icon colors. */
const NavigationIconSequenceContext = createContext<number | null>(null);

export function NavigationIconSequence({ index, children }: { index: number; children: ReactNode }) {
  return (
    <NavigationIconSequenceContext.Provider value={index}>
      {children}
    </NavigationIconSequenceContext.Provider>
  );
}

export const useNavigationIconSequence = () => useContext(NavigationIconSequenceContext);
