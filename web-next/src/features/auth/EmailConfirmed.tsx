"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiService } from "@/shared/services";
import { apiRoutes } from "@/config";

const EmailConfirmed = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

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
          router.replace("/login");
        }, 1000); // Adjust delay if necessary
      } catch (error) {
        console.error("Error confirming email:", error);
      }
    };

    confirmEmail();
  }, [router, searchParams]);

  return (
    <div>
      <p>Confirming your email...</p>
    </div>
  );
};

export default EmailConfirmed;
