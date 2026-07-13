import { apiRoutes } from "@/routes";
import { useNotifications } from "@/shared/hooks";
import { apiService, HandleApiError } from "@/shared/services";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { createLoginValidationSchema } from "../validation/loginValidation"; // Import your validation schema

const useLoginForm = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess, SnackbarComponent } = useNotifications();
  const [showPassword, setShowPassword] = useState(false);

  const userNameRef = useRef(null);

  // Create validation schema with translation function
  const validationSchema = createLoginValidationSchema(t);

  // Initialize form with react-hook-form and Yup validation
  const {
    handleSubmit,
    control,
    reset,
    register,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
    resolver: yupResolver(validationSchema), // Use Yup resolver
    mode: "onChange", // Validate on change for better UX
  });

  // Focus username field on component mount
  useEffect(() => {
    if (userNameRef.current) {
      userNameRef.current.focus();
    }
  }, []);

  const handleAuthSuccess = (data: any) => {
    if (!data || !data.token) return false;

    // Save auth data to session/local storage
    sessionStorage.setItem("token", data.token);
    sessionStorage.setItem("refreshToken", data.refreshToken);

    // Store user info in local storage
    localStorage.setItem("userName", data.userName || data.email);
    localStorage.setItem("firstName", data.firstName || "");
    localStorage.setItem("lastName", data.lastName || "");

    // Show success message
    showSuccess(t("messages.loginSuccessful"), t("messages.success"));

    // Reset form and navigate to home
    reset();
    navigate("/", { replace: true });
    return true;
  };

  const onSubmit = async (credentials: any) => {
    if (loading) return;

    setLoading(true);
    try {
      const data = await apiService.post(apiRoutes.auth.login, credentials);
      const success = handleAuthSuccess(data);

      if (!success) {
        showError(t("googleAuth.invalidCredentials"), t("messages.error"));
      }
    } catch (error) {
      HandleApiError(error, (updatedState: any) => {
        showError(updatedState.messages, (error as any).title || t("messages.error"));
      });
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleAuth = async (credentialResponse: any) => {
    setLoading(true);
    try {
      // Get the appropriate token property (Google OAuth uses different structures)
      const token =
        credentialResponse?.access_token ||
        credentialResponse?.token ||
        credentialResponse?.credential;

      if (!token) {
        throw new Error("Invalid credential response");
      }

      // Send the token to your backend
      const data = await apiService.post(apiRoutes.google.auth, {
        credential: token,
      });

      const success = handleAuthSuccess(data);
      if (!success) {
        showError(t("googleAuth.googleLoginFailed"), t("messages.error"));
      }
    } catch (error) {
      HandleApiError(error, (updatedState: any) => {
        showError(
          updatedState.messages || t("googleAuth.googleLoginFailed"),
          (error as any).title || "login.error"
        );
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: any, credentialResponse: any = null) => {
    if (loading) return;

    if (provider == "google") {
      if (credentialResponse) {
        await handleGoogleAuth(credentialResponse);
      } else {
        showError(t("googleAuth.missingCredentials"), t("messages.error"));
      }
    }
  };

  return {
    t,
    loading,
    showPassword,
    setShowPassword,
    userNameRef,
    handleSubmit,
    onSubmit,
    control,
    reset,
    register,
    errors,
    handleSocialLogin,
    SnackbarComponent,
    setValue,
    socialProviders: "google", // Only Google is supported
    validationSchema, // Export schema if needed elsewhere
  };
};

export default useLoginForm;
