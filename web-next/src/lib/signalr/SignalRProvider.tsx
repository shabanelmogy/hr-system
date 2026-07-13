"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import signalRService from "@/shared/services/signalRService";

type SignalRContextValue = {
  isConnected: boolean;
  isConnecting: boolean;
};

const SignalRContext = createContext<SignalRContextValue>({
  isConnected: false,
  isConnecting: false,
});

let startPromise: Promise<void> | null = null;
let isStarted = false;

export function SignalRProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Only start once globally
    if (isStarted || startPromise) {
      console.log("[SignalR Provider] Already started or starting, skipping");
      return;
    }

    console.log("[SignalR Provider] Starting SignalR connection...");
    setIsConnecting(true);

    startPromise = signalRService
      .start()
      .then(() => {
        console.log("[SignalR Provider] Connected successfully");
        isStarted = true;
        setIsConnected(true);
        setIsConnecting(false);
      })
      .catch((error) => {
        console.error("[SignalR Provider] Connection failed:", error);
        startPromise = null; // Allow retry
        setIsConnecting(false);
      });

    return () => {
      console.log("[SignalR Provider] Stopping SignalR connection...");
      signalRService.stop();
      isStarted = false;
      startPromise = null;
      setIsConnected(false);
    };
  }, []);

  return (
    <SignalRContext.Provider value={{ isConnected, isConnecting }}>
      {children}
    </SignalRContext.Provider>
  );
}

export function useSignalRConnection() {
  const context = useContext(SignalRContext);
  if (!context) {
    throw new Error("useSignalRConnection must be used within SignalRProvider");
  }
  return context;
}
