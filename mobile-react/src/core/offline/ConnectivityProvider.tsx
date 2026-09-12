import { onlineManager } from '@tanstack/react-query';
import { createContext, type PropsWithChildren, useContext, useEffect, useState } from 'react';

import {
  connectivityService,
  type ConnectivitySnapshot,
} from './connectivity-service';

const ConnectivityContext = createContext<ConnectivitySnapshot>(connectivityService.getSnapshot());

export function ConnectivityProvider({ children }: PropsWithChildren) {
  const [snapshot, setSnapshot] = useState(connectivityService.getSnapshot);

  useEffect(() => connectivityService.subscribe(setSnapshot), []);
  useEffect(() => {
    onlineManager.setOnline(snapshot.isOnline);
  }, [snapshot.isOnline]);

  return (
    <ConnectivityContext.Provider value={snapshot}>
      {children}
    </ConnectivityContext.Provider>
  );
}

export function useConnectivity(): ConnectivitySnapshot {
  return useContext(ConnectivityContext);
}

