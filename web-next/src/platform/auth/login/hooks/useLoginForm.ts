import { auth as authRoutes } from "@/config/api/auth";
import { google as googleRoutes } from "@/config/api/advanced";
import useNotifications from "@/shared/hooks/useNotifications";
import apiService from "@/shared/services/apiService";
import HandleApiError from "@/shared/services/apiError";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type {
  CompanySelectionResponse,
  TenantSelectionResponse,
  SocialLoginHandler,
} from "../types";
import {
  createLoginResolver,
  type LoginFormData,
} from "../validation/loginValidation";

type LoginResultModule = typeof import("../loginResult");

let loginResultModulePromise: Promise<LoginResultModule> | null = null;

const loadLoginResultModule = () => {
  loginResultModulePromise ??= import("../loginResult").catch((error: unknown) => {
    loginResultModulePromise = null;
    throw error;
  });
  return loginResultModulePromise;
};

const DEV_CREDENTIALS = {
  user: { username: "user", password: "P@ssword123" },
  admin: { username: "admin", password: "P@ssword123" },
  superAdmin: { username: "superadmin", password: "P@ssword123" },
} as const;

const useLoginForm = () => {
  const { t } = useTranslation();
  const { showError, showSuccess, SnackbarComponent } = useNotifications();
  const submittingRef = useRef(false);
  const [isSubmittingState, setIsSubmittingState] = useState(false);
  const [companySelection, setCompanySelection] = useState<CompanySelectionResponse | null>(null);
  const [tenantSelection, setTenantSelection] = useState<TenantSelectionResponse | null>(null);
  const [isSelectingTenant, setIsSelectingTenant] = useState(false);
  const [isSelectingCompany, setIsSelectingCompany] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const userNameRef = useRef<HTMLInputElement>(null);

  const {
    handleSubmit,
    control,
    reset,
    register,
    formState: { errors, isSubmitting: isFormSubmitting },
    setValue,
  } = useForm<LoginFormData>({
    defaultValues: { username: "", password: "" },
    resolver: createLoginResolver(t),
    mode: "onChange",
  });

  useEffect(() => {
    userNameRef.current?.focus();

    const warmLoginRuntime = () => {
      // Keep the first paint light, but move the response validator off the
      // user's eventual click path. Do not prefetch protected routes before
      // authentication: their RSC payload can be resolved with anonymous
      // request state and then reused after the auth cookie changes.
      void loadLoginResultModule().catch(() => undefined);
    };

    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    if (typeof idleWindow.requestIdleCallback === "function") {
      const idleId = idleWindow.requestIdleCallback(warmLoginRuntime, { timeout: 1_000 });
      return () => idleWindow.cancelIdleCallback?.(idleId);
    }

    const timerId = window.setTimeout(warmLoginRuntime, 400);
    return () => window.clearTimeout(timerId);
  }, []);

  const completeAuthentication = () => {
    const returnTo = getSafeReturnTo();
    setCompanySelection(null);
    showSuccess(t("messages.loginSuccessful"), t("messages.success"));
    setTenantSelection(null);
    // Authentication changes the server-visible cookie state. Force a fresh
    // document request so Proxy, the protected App Router tree and the session
    // bootstrap all observe the newly committed credentials consistently.
    window.location.replace(returnTo);
  };

  const handleLoginResult = async (
    data: unknown,
    parserModule = loadLoginResultModule(),
  ): Promise<boolean> => {
    const { parseLoginResult } = await parserModule;
    const result = parseLoginResult(data);
    if (result?.kind === "authenticated") {
      completeAuthentication();
      return true;
    }
    if (result?.kind === "tenant-selection") {
      setTenantSelection(result.response);
      return true;
    }
    if (result?.kind === "company-selection") {
      setCompanySelection(result.response);
      return true;
    }
    return false;
  };

  const submitCredentials = async (username: string, password: string) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmittingState(true);
    try {
      // Start downloading the response validator while the login request is in flight.
      const parserModule = loadLoginResultModule();
      const data = await apiService.post<unknown>(authRoutes.login, {
        username,
        password,
      });
      if (!await handleLoginResult(data, parserModule)) {
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

      const parserModule = loadLoginResultModule();
      const data = await apiService.post<unknown>(googleRoutes.auth, {
        credential: token,
      });
      if (!await handleLoginResult(data, parserModule)) {
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

  const selectTenant = async (tenantId: string) => {
    if (!tenantSelection || isSelectingTenant) return;
    setIsSelectingTenant(true);
    try {
      const parserModule = loadLoginResultModule();
      const data = await apiService.post<unknown>(authRoutes.selectTenant, {
        tenantSelectionToken: tenantSelection.tenantSelectionToken,
        tenantId,
      });
      const { parseLoginResult } = await parserModule;
      const result = parseLoginResult(data);
      if (result?.kind === "authenticated") {
        completeAuthentication();
      } else if (result?.kind === "company-selection") {
        setTenantSelection(null);
        setCompanySelection(result.response);
      } else {
        showError(t("auth.invalidTenantSelection"), t("messages.error"));
      }
    } catch (error) {
      showHandledError(error, showError, t("messages.error"));
    } finally {
      setIsSelectingTenant(false);
    }
  };

  const cancelTenantSelection = () => {
    if (!isSelectingTenant) setTenantSelection(null);
  };
  const selectCompany = async (companyId: number) => {
    if (!companySelection || isSelectingCompany) return;

    setIsSelectingCompany(true);
    try {
      const parserModule = loadLoginResultModule();
      const data = await apiService.post<unknown>(authRoutes.selectCompany, {
        companySelectionToken: companySelection.companySelectionToken,
        companyId,
      });
      const { parseLoginResult } = await parserModule;
      const result = parseLoginResult(data);
      if (result?.kind !== "authenticated") {
        showError(t("auth.invalidCompanySelection"), t("messages.error"));
      } else {
        completeAuthentication();
      }
    } catch (error) {
      showHandledError(error, showError, t("messages.error"));
    } finally {
      setIsSelectingCompany(false);
    }
  };

  const cancelCompanySelection = () => {
    if (!isSelectingCompany) setCompanySelection(null);
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
    companySelection,
    isSelectingCompany,
    selectCompany,
    tenantSelection,
    isSelectingTenant,
    selectTenant,
    cancelTenantSelection,
    cancelCompanySelection,
  };
};

export default useLoginForm;

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
