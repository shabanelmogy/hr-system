import { useEffect, useCallback } from "react";
import signalRService from "./signalRService";

const useSignalR = (eventName: string, onUpdateCallback: (data: any) => void) => {
  // Memoize the event handler
  const handleUpdate = useCallback(
    (data: any) => {
      onUpdateCallback(data);
    },
    [onUpdateCallback]
  );

  // Setup SignalR for real-time updates
  useEffect(() => {
    // Don't start/stop SignalR here - it's handled by SignalRProvider
    // Just register the event handler
    signalRService.on(eventName, handleUpdate);

    return () => {
      signalRService.off(eventName, handleUpdate);
    };
  }, [eventName, handleUpdate]);
};

export default useSignalR;

