"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useSession } from "@/lib/auth/SessionContext";
import signalRService from "@/shared/services/signalRService";

type SignalRContextValue = {
  isConnected: boolean;
  isConnecting: boolean;
};

const SignalRContext = createContext<SignalRContextValue>({
  isConnected: false,
  isConnecting: false,
});

export function SignalRProvider({ children }: { children: ReactNode }) {
  const { user, isLoading } = useSession();
  const [connectionState, setConnectionState] = useState<SignalRContextValue>({
    isConnected: false,
    isConnecting: false,
  });

  useEffect(() => {
    const unsubscribe = signalRService.subscribe((isConnected, isConnecting) => {
      setConnectionState({ isConnected, isConnecting });
    });

    return () => {
      unsubscribe();
      void signalRService.setEnabled(false);
    };
  }, []);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      void signalRService.setEnabled(false);
      return;
    }

    const startWhenIdle = () => void signalRService.setEnabled(true);
    if ("requestIdleCallback" in window) {
      const requestId = window.requestIdleCallback(startWhenIdle, {
        timeout: 2_000,
      });
      return () => window.cancelIdleCallback(requestId);
    }

    const timeoutId = setTimeout(startWhenIdle, 500);
    return () => clearTimeout(timeoutId);
  }, [isLoading, user]);

  return (
    <SignalRContext.Provider value={connectionState}>
      {children}
    </SignalRContext.Provider>
  );
}

export function useSignalRConnection() {
  return useContext(SignalRContext);
}
