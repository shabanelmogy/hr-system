"use client";

import type { Route } from "next";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isSessionClaims, type SessionClaims } from "./session";
import type { PermissionString } from "./permissions";
import { isAuthorized } from "./authorization";
import apiClient from "@/lib/api/client";
import { isPublicRoute, SESSION_CHANGED_EVENT } from "./constants";
import { UNAVAILABLE_ROUTE } from "./route-access";
import { SessionRequestState } from "./session-request-state";
import { auth as authRoutes } from "@/config/api/auth";

const sessionRevalidationIntervalMs = 5 * 60_000;
const sessionExpiryBufferMs = 30_000;
const focusRevalidationThrottleMs = 60_000;
const maxTimerDelayMs = 2_147_000_000;
const logoutTransitionDurationMs = 360;
const logoutRequestTimeoutMs = 5_000;

type SessionContextValue = {
  user: SessionClaims | null;
  isLoading: boolean;
  isLoggingOut: boolean;
  isSwitchingCompany: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  switchCompany: (companyId: number) => Promise<void>;
  /** Returns true if `roles` is empty (no restriction) or the user has at least one of the given roles (OR semantics). */
  hasRole: (roles: readonly string[]) => boolean;
  /** Returns true if `permissions` is empty (no restriction) or the user has at least one of the given permissions (OR semantics). */
  hasPermission: (permissions: readonly PermissionString[]) => boolean;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const requiresSession = !isPublicRoute(pathname) && pathname !== UNAVAILABLE_ROUTE;
  const [user, setUser] = useState<SessionClaims | null>(null);
  const [isLoading, setIsLoading] = useState(requiresSession);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSwitchingCompany, setIsSwitchingCompany] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refreshStateRef = useRef<SessionRequestState | null>(null);
  const companySwitchTransitionRef = useRef(false);
  const logoutPromiseRef = useRef<Promise<void> | null>(null);
  const lastRefreshAtRef = useRef(0);
  const userRef = useRef<SessionClaims | null>(null);
  const bootstrappedRef = useRef(false);
  const pathnameRef = useRef(pathname);
  if (refreshStateRef.current == null) {
    refreshStateRef.current = new SessionRequestState();
  }

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  const refresh = useCallback(async () => {
    return refreshStateRef.current!.run(async (requestGeneration) => {
      setIsLoading(true);
      lastRefreshAtRef.current = Date.now();
      setError(null);
      try {
        const response = await fetch("/api/auth/session", {
          credentials: "same-origin",
          cache: "no-store"
        });
        
        // 401 = not authenticated (expected, not an error)
        if (response.status === 401) {
          if (refreshStateRef.current!.isCurrent(requestGeneration)) {
            const currentPathname = pathnameRef.current;
            userRef.current = null;
            setUser(null);
            setError(null);
            if (!isPublicRoute(currentPathname)) {
              window.dispatchEvent(new CustomEvent("auth:logout"));
            }
          }
          return;
        }
        
        // Server errors - don't clear user, they might still be authenticated
        if (!response.ok) {
          if (refreshStateRef.current!.isCurrent(requestGeneration)) {
            const currentPathname = pathnameRef.current;
            setError(`Server error: ${response.status}`);
            if (!userRef.current && currentPathname !== UNAVAILABLE_ROUTE) {
              router.replace(unavailableUrlWithReturnTo() as Route);
            }
          }
          return;
        }
        
        const payload = (await response.json()) as { user?: unknown };
        if (!refreshStateRef.current!.isCurrent(requestGeneration)) return;
        if (isSessionClaims(payload.user)) {
          userRef.current = payload.user;
          setUser(payload.user);
          setIsLoggingOut(false);
          setError(null);
        } else {
          const currentPathname = pathnameRef.current;
          setError("Invalid session data");
          userRef.current = null;
          setUser(null);
          if (currentPathname !== UNAVAILABLE_ROUTE) {
            router.replace(unavailableUrlWithReturnTo() as Route);
          }
        }
      } catch (err) {
        // Network errors - don't clear user
        if (refreshStateRef.current!.isCurrent(requestGeneration)) {
          const currentPathname = pathnameRef.current;
          setError(err instanceof Error ? err.message : "Network error");
          if (!userRef.current && currentPathname !== UNAVAILABLE_ROUTE) {
            router.replace(unavailableUrlWithReturnTo() as Route);
          }
        }
      } finally {
        if (refreshStateRef.current!.isCurrent(requestGeneration)) {
          setIsLoading(false);
        }
      }
    });
  }, [router]);

  useEffect(() => {
    if (!requiresSession) {
      bootstrappedRef.current = false;
      return;
    }
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;
    setIsLoading(true);
    void refresh();
  }, [refresh, requiresSession]);

  useEffect(() => {
    const handleSessionChanged = () => {
      if (!companySwitchTransitionRef.current) void refresh();
    };

    window.addEventListener(SESSION_CHANGED_EVENT, handleSessionChanged);
    return () => {
      window.removeEventListener(SESSION_CHANGED_EVENT, handleSessionChanged);
    };
  }, [refresh]);

  const userId = user?.userId;
  const expiresAt = user?.expiresAt;

  useEffect(() => {
    if (!userId || !expiresAt) return;

    const refreshIfStale = () => {
      if (Date.now() - lastRefreshAtRef.current >= focusRevalidationThrottleMs) {
        void refresh();
      }
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") refreshIfStale();
    };
    const expiryDelay = Math.min(
      Math.max(0, expiresAt - Date.now() - sessionExpiryBufferMs),
      maxTimerDelayMs,
    );
    const expiryTimer = window.setTimeout(() => {
      void refresh();
    }, expiryDelay);
    const intervalTimer = window.setInterval(() => {
      void refresh();
    }, sessionRevalidationIntervalMs);

    window.addEventListener("focus", refreshIfStale);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearTimeout(expiryTimer);
      window.clearInterval(intervalTimer);
      window.removeEventListener("focus", refreshIfStale);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [expiresAt, refresh, userId]);

  const logout = useCallback(() => {
    if (logoutPromiseRef.current) return logoutPromiseRef.current;

    const performLogout = async () => {
      refreshStateRef.current!.invalidate();
      setIsLoading(false);
      setIsLoggingOut(true);

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const transitionDelay = new Promise<void>((resolve) => {
        window.setTimeout(
          resolve,
          prefersReducedMotion ? 0 : logoutTransitionDurationMs,
        );
      });

      try {
        await Promise.all([
          fetch("/api/auth/logout", {
            method: "POST",
            credentials: "same-origin",
            signal: AbortSignal.timeout(logoutRequestTimeoutMs),
          }).catch(() => undefined),
          transitionDelay,
        ]);

        // Keep the history stack clean so Back cannot reopen a protected page.
        router.replace("/login");
        userRef.current = null;
        setUser(null);
        setError(null);
        apiClient.resetLogoutGuard();
      } finally {
        logoutPromiseRef.current = null;
      }
    };

    const logoutPromise = performLogout();
    logoutPromiseRef.current = logoutPromise;
    return logoutPromise;
  }, [router]);

  const switchCompany = useCallback(async (companyId: number) => {
    const currentUser = userRef.current;
    if (
      !Number.isInteger(companyId) ||
      companyId <= 0 ||
      !currentUser?.companies.some((company) => company.id === companyId)
    ) {
      throw new Error("Invalid company selection");
    }
    if (companyId === currentUser.companyId) return;

    companySwitchTransitionRef.current = true;
    refreshStateRef.current!.invalidate();
    setIsSwitchingCompany(true);
    setError(null);
    try {
      const response = await fetch(authRoutes.switchCompany, {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ companyId }),
      });

      if (response.status === 401) {
        await logout();
        throw new Error("Authentication session expired");
      }
      if (!response.ok) {
        throw new Error(await readProblemMessage(response));
      }

      await refresh();
      if (userRef.current?.companyId !== companyId) {
        userRef.current = null;
        setUser(null);
        setError("Unable to verify the switched company session");
        router.replace(unavailableUrlWithReturnTo() as Route);
        throw new Error("Unable to verify the switched company session");
      }
    } finally {
      companySwitchTransitionRef.current = false;
      setIsSwitchingCompany(false);
    }
  }, [logout, refresh, router]);

  // Handle logout events dispatched by apiClient (e.g. on 401 interceptor)
  useEffect(() => {
    const handler = () => { void logout(); };
    window.addEventListener("auth:logout", handler);
    return () => window.removeEventListener("auth:logout", handler);
  }, [logout]);

  const value = useMemo<SessionContextValue>(() => ({
    user,
    isLoading,
    isLoggingOut,
    isSwitchingCompany,
    error,
    refresh,
    logout,
    switchCompany,
    hasRole: (roles) => {
      if (roles.length === 0) return true;
      return isAuthorized(user, { roles });
    },
    hasPermission: (permissions) => {
      if (permissions.length === 0) return true;
      return isAuthorized(user, { permissions });
    }
  }), [isLoading, isLoggingOut, isSwitchingCompany, error, refresh, logout, switchCompany, user]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

async function readProblemMessage(response: Response) {
  try {
    const problem = await response.json() as { detail?: unknown; title?: unknown };
    if (typeof problem.detail === "string" && problem.detail.trim()) return problem.detail;
    if (typeof problem.title === "string" && problem.title.trim()) return problem.title;
  } catch {
    // The status text below remains a useful fallback for non-JSON proxy errors.
  }
  return response.statusText || `Request failed with status ${response.status}`;
}

function unavailableUrlWithReturnTo() {
  if (typeof window === "undefined") return UNAVAILABLE_ROUTE;
  const returnTo = `${window.location.pathname}${window.location.search}`;
  return `${UNAVAILABLE_ROUTE}?reason=service&returnTo=${encodeURIComponent(returnTo)}`;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession must be used within SessionProvider");
  return value;
}
