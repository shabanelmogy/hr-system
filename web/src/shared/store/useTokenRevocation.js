// src/hooks/useTokenRevocation.js
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import signalRService from "../services/signalRService"; // Adjust the path to your SignalR service

const useTokenRevocation = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // When you connect with JWT token, SignalR knows who you are
    signalRService.start();

    // This will ONLY trigger for the specific user whose token was revoked
    signalRService.on("ReceiveTokenRevoked", (message) => {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      alert(message);
      navigate("/login");
    });

    return () => {
      signalRService.off("ReceiveTokenRevoked");
    };
  }, [navigate]);
};
export default useTokenRevocation;
