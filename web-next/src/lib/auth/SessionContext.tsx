"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { isSessionClaims, type SessionClaims } from "./session";
import { hasPermission as checkPermission } from "./permissions";
import type { PermissionString } from "./permissions";
import apiClient from "@/lib/api/client";
import { SESSION_CHANGED_EVENT } from "./constants";
import { SessionRequestState } from "./session-request-state";

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
  error: string | null;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  /** Returns true if `roles` is empty (no restriction) or the user has at least one of the given roles (OR semantics). */
  hasRole: (roles: readonly string[]) => boolean;
  /** Returns true if `permissions` is empty (no restriction) or the user has at least one of the given permissions (OR semantics). */
  hasPermission: (permissions: readonly PermissionString[]) => boolean;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children, initialUser }: { children: ReactNode; initialUser: SessionClaims | null }) {
  const router = useRouter();
  const [user, setUser] = useState<SessionClaims | null>(initialUser);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refreshStateRef = useRef<SessionRequestState | null>(null);
  const logoutPromiseRef = useRef<Promise<void> | null>(null);
  const lastRefreshAtRef = useRef(0);
  if (refreshStateRef.current == null) {
    refreshStateRef.current = new SessionRequestState();
  }

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
            setUser(null);
            setError(null);
          }
          return;
        }
        
        // Server errors - don't clear user, they might still be authenticated
        if (!response.ok) {
          if (refreshStateRef.current!.isCurrent(requestGeneration)) {
            setError(`Server error: ${response.status}`);
          }
          return;
        }
        
        const payload = (await response.json()) as { user?: unknown };
        if (!refreshStateRef.current!.isCurrent(requestGeneration)) return;
        if (isSessionClaims(payload.user)) {
          setUser(payload.user);
          setIsLoggingOut(false);
          setError(null);
        } else {
          setError("Invalid session data");
          setUser(null);
        }
      } catch (err) {
        // Network errors - don't clear user
        if (refreshStateRef.current!.isCurrent(requestGeneration)) {
          setError(err instanceof Error ? err.message : "Network error");
        }
      } finally {
        if (refreshStateRef.current!.isCurrent(requestGeneration)) {
          setIsLoading(false);
        }
      }
    });
  }, []);

  useEffect(() => {
    const handleSessionChanged = () => {
      void refresh();
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
    error,
    refresh,
    logout,
    hasRole: (roles) => {
      if (roles.length === 0) return true;
      if (!user) return false;
      return roles.some((role) =>
        user.roles.some((userRole) => userRole.toLowerCase() === role.toLowerCase())
      );
    },
    hasPermission: (permissions) => {
      if (permissions.length === 0) return true;
      if (!user) return false;
      return permissions.some((permission) => checkPermission(user.permissions, permission));
    }
  }), [isLoading, isLoggingOut, error, refresh, logout, user]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession must be used within SessionProvider");
  return value;
}
