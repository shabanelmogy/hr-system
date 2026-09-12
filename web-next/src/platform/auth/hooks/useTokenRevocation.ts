import { useEffect } from "react";
import { useSession } from "@/lib/auth/SessionContext";
import signalRService from "@/lib/signalr/signalRService";

const useTokenRevocation = () => {
  const { logout } = useSession();

  useEffect(() => {
    const handleTokenRevoked = (...args: unknown[]) => {
      const message = typeof args[0] === "string" ? args[0] : "";
      // Dispatch a notification event that the app's notification system can display
      window.dispatchEvent(new CustomEvent("app:notify", {
        detail: { message, severity: "warning" }
      }));
      void logout();
    };

    signalRService.on("ReceiveTokenRevoked", handleTokenRevoked);
    return () => signalRService.off("ReceiveTokenRevoked", handleTokenRevoked);
  }, [logout]);
};

export default useTokenRevocation;
