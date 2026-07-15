import { useEffect } from "react";
import { useSession } from "@/lib/auth/SessionContext";
import signalRService from "@/lib/signalr/signalRService";

const useTokenRevocation = () => {
  const { logout } = useSession();

  useEffect(() => {
    const handleTokenRevoked = (_message: string) => {
      // Dispatch a notification event that the app's notification system can display
      window.dispatchEvent(new CustomEvent("app:notify", {
        detail: { message: _message, severity: "warning" }
      }));
      void logout();
    };

    signalRService.on("ReceiveTokenRevoked", handleTokenRevoked);
    return () => signalRService.off("ReceiveTokenRevoked", handleTokenRevoked);
  }, [logout]);
};

export default useTokenRevocation;
