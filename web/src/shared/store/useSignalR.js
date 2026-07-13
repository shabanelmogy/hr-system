// src/hooks/useSignalR.js
import { useEffect, useCallback } from "react";
import signalRService from "../services/signalRService"; // Adjust the path to your SignalR service

const useSignalR = (eventName, onUpdateCallback) => {
  // Memoize the SignalR service instance
  const signalRInstance = signalRService;

  // Memoize the event handler
  const handleUpdate = useCallback(
    (data) => {
      onUpdateCallback(data);
    },
    [onUpdateCallback]
  );

  // Setup SignalR for real-time updates
  useEffect(() => {
    signalRInstance.start(); // Start SignalR connection
    signalRInstance.on(eventName, handleUpdate);

    return () => {
      signalRInstance.off(eventName, handleUpdate);
      signalRInstance.stop(); // Stop SignalR connection on unmount
    };
  }, [eventName, handleUpdate, signalRInstance]);
};

export default useSignalR;
