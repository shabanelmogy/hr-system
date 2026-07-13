import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { apiService } from "@/shared/services";
import { apiRoutes } from "@/routes";

const EmailConfirmed = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const confirmEmail = async () => {
      const userId = searchParams.get("userId");
      const code = searchParams.get("code");

      if (!userId || !code) {
        return;
      }

      const request = {
        userId: userId,
        code: code,
      };

      try {
        await apiService.post(apiRoutes.auth.confirmEmail, request); // Replace with your API endpoint(request);
        setTimeout(() => {
          window.location.href = "login"; // Full page reload
        }, 1000); // Adjust delay if necessary
      } catch (error) {
        console.error("Error confirming email:", error);
      }
    };

    confirmEmail();
  }, [searchParams, navigate]);

  return (
    <div>
      <p>Confirming your email...</p>
    </div>
  );
};

export default EmailConfirmed;
