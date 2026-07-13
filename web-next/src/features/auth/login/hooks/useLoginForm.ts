import { apiRoutes } from "@/config";
import { useNotifications } from "@/shared/hooks";
import { apiService, HandleApiError } from "@/shared/services";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { useSession } from "@/lib/auth/SessionContext";
import { createLoginValidationSchema } from "../validation/loginValidation";

// Dev-only quick-login credentials — remove before production
const DEV_CREDENTIALS = {
  user:  { username: "user",  password: "P@ssword123" },
  admin: { username: "admin", password: "P@ssword123" },
} as const;

const useLoginForm = () => {
  const router = useRouter();
  const { refresh } = useSession();
  const { t } = useTranslation();
  const { showError, showSuccess, SnackbarComponent } = useNotifications();

  // Ref-based guard prevents double-submit race condition (useState is async)
  const isSubmitting = useRef(false);

  const userNameRef = useRef<HTMLInputElement>(null);

  const validationSchema = createLoginValidationSchema(t);

  const {
    handleSubmit,
    control,
    reset,
    register,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: { username: "", password: "" },
    resolver: yupResolver(validationSchema),
    mode: "onChange",
  });

  useEffect(() => {
    userNameRef.current?.focus();
  }, []);

  const handleAuthSuccess = (data: any): boolean => {
    if (!data?.isAuthenticated) return false;

    showSuccess(t("messages.loginSuccessful"), t("messages.success"));
    reset();
    router.replace(getSafeReturnTo() as Route);
    // Fire-and-forget — session refresh is best-effort after redirect
    refresh().catch(() => {});
    return true;
  };

  const submitCredentials = async (username: string, password: string) => {
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    try {
      const data = await apiService.post(apiRoutes.auth.login, { username, password });
      const success = handleAuthSuccess(data);
      if (!success) {
        showError(t("googleAuth.invalidCredentials"), t("messages.error"));
      }
    } catch (error) {
      HandleApiError(error, (updatedState: any) => {
        showError(updatedState.messages, (error as any).title || t("messages.error"));
      });
    } finally {
      isSubmitting.current = false;
    }
  };

  const onSubmit = async (credentials: { username: string; password: string }) => {
    await submitCredentials(credentials.username, credentials.password);
  };

  // Quick-login: sets values with validation then submits
  const loginAs = async (role: keyof typeof DEV_CREDENTIALS) => {
    const { username, password } = DEV_CREDENTIALS[role];
    // shouldValidate:true triggers Yup validation so the form is valid before submit
    setValue("username", username, { shouldValidate: true, shouldDirty: true });
    setValue("password", password, { shouldValidate: true, shouldDirty: true });
    await submitCredentials(username, password);
  };

  const handleGoogleAuth = async (credentialResponse: any) => {
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    try {
      const token =
        credentialResponse?.access_token ||
        credentialResponse?.token ||
        credentialResponse?.credential;

      if (!token) throw new Error("Invalid credential response");

      const data = await apiService.post(apiRoutes.google.auth, { credential: token });
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
      isSubmitting.current = false;
    }
  };

  const handleSocialLogin = async (provider: any, credentialResponse: any = null) => {
    if (isSubmitting.current) return;
    if (provider === "google") {
      if (credentialResponse) {
        await handleGoogleAuth(credentialResponse);
      } else {
        showError(t("googleAuth.missingCredentials"), t("messages.error"));
      }
    }
  };

  return {
    t,
    // Expose ref so LoginForm can read isSubmitting synchronously for button states
    isSubmitting,
    showPassword: false,
    setShowPassword: (_: boolean) => {},
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
    setValue,
    socialProviders: "google",
    validationSchema,
  };
};

export default useLoginForm;

function getSafeReturnTo(): string {
  if (typeof window === "undefined") return "/";
  const returnTo = new URLSearchParams(window.location.search).get("returnTo");
  if (!returnTo) return "/";
  try {
    // Resolve against current origin — rejects off-origin and protocol-relative URLs
    const url = new URL(returnTo, window.location.origin);
    return url.origin === window.location.origin
      ? url.pathname + url.search
      : "/";
  } catch {
    return "/";
  }
}
