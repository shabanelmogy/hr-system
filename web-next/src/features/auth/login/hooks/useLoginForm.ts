import { apiRoutes } from "@/config";
import { useSession } from "@/lib/auth/SessionContext";
import useNotifications from "@/shared/hooks/useNotifications";
import { apiService, HandleApiError } from "@/shared/services";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { LoginResponse, SocialLoginHandler } from "../types";
import {
  createLoginValidationSchema,
  type LoginFormData,
} from "../validation/loginValidation";

const DEV_CREDENTIALS = {
  user: { username: "user", password: "P@ssword123" },
  admin: { username: "admin", password: "P@ssword123" },
} as const;

const useLoginForm = () => {
  const router = useRouter();
  const { refresh } = useSession();
  const { t } = useTranslation();
  const { showError, showSuccess, SnackbarComponent } = useNotifications();
  const submittingRef = useRef(false);
  const [isSubmittingState, setIsSubmittingState] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const userNameRef = useRef<HTMLInputElement>(null);
  const validationSchema = createLoginValidationSchema(t);

  const {
    handleSubmit,
    control,
    reset,
    register,
    formState: { errors, isSubmitting: isFormSubmitting },
    setValue,
  } = useForm<LoginFormData>({
    defaultValues: { username: "", password: "" },
    resolver: zodResolver(validationSchema),
    mode: "onChange",
  });

  useEffect(() => {
    userNameRef.current?.focus();
  }, []);

  const handleAuthSuccess = (data: unknown): boolean => {
    if (!isLoginResponse(data) || !data.isAuthenticated) return false;

    showSuccess(t("messages.loginSuccessful"), t("messages.success"));
    reset();
    router.replace(getSafeReturnTo() as Route);
    void refresh().catch(() => undefined);
    return true;
  };

  const submitCredentials = async (username: string, password: string) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmittingState(true);
    try {
      const data = await apiService.post<unknown>(apiRoutes.auth.login, {
        username,
        password,
      });
      if (!handleAuthSuccess(data)) {
        showError(t("googleAuth.invalidCredentials"), t("messages.error"));
      }
    } catch (error) {
      showHandledError(error, showError, t("messages.error"));
    } finally {
      submittingRef.current = false;
      setIsSubmittingState(false);
    }
  };

  const onSubmit = async (credentials: LoginFormData) => {
    await submitCredentials(credentials.username, credentials.password);
  };

  const loginAs = async (role: keyof typeof DEV_CREDENTIALS) => {
    const { username, password } = DEV_CREDENTIALS[role];
    setValue("username", username, { shouldValidate: true, shouldDirty: true });
    setValue("password", password, { shouldValidate: true, shouldDirty: true });
    await submitCredentials(username, password);
  };

  const handleGoogleAuth = async (credentialResponse: unknown) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmittingState(true);
    try {
      const token = getGoogleToken(credentialResponse);
      if (!token) throw new Error("Invalid credential response");

      const data = await apiService.post<unknown>(apiRoutes.google.auth, {
        credential: token,
      });
      if (!handleAuthSuccess(data)) {
        showError(t("googleAuth.googleLoginFailed"), t("messages.error"));
      }
    } catch (error) {
      showHandledError(error, showError, t("googleAuth.googleLoginFailed"));
    } finally {
      submittingRef.current = false;
      setIsSubmittingState(false);
    }
  };

  const handleSocialLogin: SocialLoginHandler = async (
    provider,
    credentialResponse,
  ) => {
    if (submittingRef.current) return;
    if (provider === "google" && credentialResponse) {
      await handleGoogleAuth(credentialResponse);
      return;
    }
    showError(t("googleAuth.missingCredentials"), t("messages.error"));
  };

  return {
    t,
    isFormSubmitting,
    isSubmittingState,
    showPassword,
    setShowPassword,
    userNameRef,
    handleSubmit,
    onSubmit,
    loginAs,
    control,
    reset,
    register,
    errors,
    handleSocialLogin,
    SnackbarComponent,
  };
};

export default useLoginForm;

function isLoginResponse(value: unknown): value is LoginResponse {
  return value !== null
    && typeof value === "object"
    && typeof (value as Record<string, unknown>).isAuthenticated === "boolean";
}

function getGoogleToken(value: unknown): string | null {
  if (value === null || typeof value !== "object") return null;
  const response = value as Record<string, unknown>;
  for (const key of ["access_token", "token", "credential"] as const) {
    const token = response[key];
    if (typeof token === "string" && token.trim()) return token;
  }
  return null;
}

function showHandledError(
  error: unknown,
  showError: (message: unknown, title?: string) => void,
  fallbackTitle: string,
) {
  HandleApiError(error, (notification) => {
    showError(notification.messages, notification.title || fallbackTitle);
  });
}

function getSafeReturnTo(): string {
  if (typeof window === "undefined") return "/";
  const returnTo = new URLSearchParams(window.location.search).get("returnTo");
  if (!returnTo) return "/";
  try {
    const url = new URL(returnTo, window.location.origin);
    return url.origin === window.location.origin
      ? url.pathname + url.search
      : "/";
  } catch {
    return "/";
  }
}
