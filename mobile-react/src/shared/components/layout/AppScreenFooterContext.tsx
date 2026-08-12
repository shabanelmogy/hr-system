import { createContext, type ReactNode } from 'react';

export interface AppScreenFooterHost {
  registerFooter: (owner: symbol, content: ReactNode) => void;
  unregisterFooter: (owner: symbol) => void;
}

export const AppScreenFooterContext = createContext<AppScreenFooterHost | null>(null);
