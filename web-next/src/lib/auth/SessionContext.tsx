"use client";

import type { Route } from "next";
import { Suspense, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { parseSessionClaimsEnvelope, type SessionClaims } from "./session";
import type { PermissionString } from "./permissions";
import { isAuthorized } from "./authorization";
import apiClient from "@/lib/api/client";
import { isPublicRoute, SESSION_CHANGED_EVENT } from "./constants";
import { UNAVAILABLE_ROUTE } from "./route-access";
import { SessionRequestState } from "./session-request-state";
import { auth as authRoutes } from "@/config/api/auth";
import { verifyTargetCompany } from "./company-switch-verification";
import { appRoutes } from "@/config/routes";
import { reportSessionRevalidationFailure } from "@/lib/observability/clientTelemetry";

const sessionRevalidationIntervalMs = 5 * 60_000;
const sessionExpiryBufferMs = 30_000;
const focusRevalidationThrottleMs = 60_000;
const maxTimerDelayMs = 2_147_000_000;
const logoutTransitionDurationMs = 360;
const logoutRequestTimeoutMs = 5_000;
const sessionRequestTimeoutMs = 15_000;
const companySwitchRequestTimeoutMs = 15_000;

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

type RevalidationResult = "pending" | "ok" | "unauthenticated" | "invalid" | "error" | "skipped";

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<SessionClaims | null>(null);
  // SessionProvider is mounted only around protected route scopes. Default to
  // loading so protected consumers do not briefly observe an unauthenticated
  // settled state before the route observer hydrates.
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSwitchingCompany, setIsSwitchingCompany] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refreshStateRef = useRef<SessionRequestState | null>(null);
  const companySwitchTransitionRef = useRef(false);
  const loggingOutRef = useRef(false);
  const refreshControllerRef = useRef<AbortController | null>(null);
  const switchRequestRef = useRef<Promise<Response> | null>(null);
  const logoutPromiseRef = useRef<Promise<void> | null>(null);
  const logoutEpochRef = useRef(0);
  const lastRefreshAtRef = useRef(0);
  const userRef = useRef<SessionClaims | null>(null);
  const bootstrappedRef = useRef(false);
  const pathnameRef = useRef<string>(appRoutes.shell.home);
  const revalidationResultRef = useRef<RevalidationResult>("skipped");
  if (refreshStateRef.current == null) {
    refreshStateRef.current = new SessionRequestState();
  }

  const revalidate = useCallback(async (duringSwitch = false, suppressFailureRedirect = false) => {
    if (loggingOutRef.current || (companySwitchTransitionRef.current && !duringSwitch)) {
      return;
    }
    revalidationResultRef.current = "pending";
    return refreshStateRef.current!.run(async (requestGeneration) => {
      const controller = new AbortController();
      refreshControllerRef.current = controller;
      setIsLoading(true);
      lastRefreshAtRef.current = Date.now();
      setError(null);
      try {
        const response = await fetch("/api/auth/session", {
          credentials: "same-origin",
          cache: "no-store",
          signal: AbortSignal.any([
            controller.signal,
            AbortSignal.timeout(sessionRequestTimeoutMs),
          ]),
        });
        
        // 401 = not authenticated (expected, not an error)
        if (response.status === 401) {
          if (refreshStateRef.current!.isCurrent(requestGeneration)) {
            revalidationResultRef.current = "unauthenticated";
            const currentPathname = pathnameRef.current;
            userRef.current = null;
            setUser(null);
            setError(null);
            if (!suppressFailureRedirect && !isPublicRoute(currentPathname)) {
              window.dispatchEvent(new CustomEvent("auth:logout"));
            }
          }
          return;
        }
        
        // Server errors - don't clear user, they might still be authenticated
        if (!response.ok) {
          if (refreshStateRef.current!.isCurrent(requestGeneration)) {
            revalidationResultRef.current = "error";
            reportSessionRevalidationFailure("unavailable");
            const currentPathname = pathnameRef.current;
            setError(`Server error: ${response.status}`);
            if (!suppressFailureRedirect && !userRef.current && currentPathname !== UNAVAILABLE_ROUTE) {
              router.replace(unavailableUrlWithReturnTo() as Route);
            }
          }
          return;
        }
        
        const payload: unknown = await response.json();
        const sessionUser = parseSessionClaimsEnvelope(payload);
        if (!refreshStateRef.current!.isCurrent(requestGeneration)) return;
        if (sessionUser) {
          revalidationResultRef.current = "ok";
          const previous = userRef.current;
          if (previous && (previous.userId !== sessionUser.userId || previous.tenantId !== sessionUser.tenantId || previous.companyId !== sessionUser.companyId)) {
            apiClient.rotateRequestContext();
          }
          userRef.current = sessionUser;
          setUser(sessionUser);
          setIsLoggingOut(false);
          setError(null);
        } else {
          revalidationResultRef.current = "invalid";
          reportSessionRevalidationFailure("invalid");
          const currentPathname = pathnameRef.current;
          setError("Invalid session data");
          userRef.current = null;
          setUser(null);
          if (!suppressFailureRedirect && currentPathname !== UNAVAILABLE_ROUTE) {
            router.replace(unavailableUrlWithReturnTo() as Route);
          }
        }
      } catch (err) {
        // Network errors - don't clear user
        if (refreshStateRef.current!.isCurrent(requestGeneration)) {
          revalidationResultRef.current = "error";
          reportSessionRevalidationFailure(classifySessionTransportFailure(err));
          const currentPathname = pathnameRef.current;
          setError(err instanceof Error ? err.message : "Network error");
          if (!suppressFailureRedirect && !userRef.current && currentPathname !== UNAVAILABLE_ROUTE) {
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

  const refresh = useCallback(() => revalidate(), [revalidate]);

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
      logoutEpochRef.current += 1;
      loggingOutRef.current = true;
      refreshStateRef.current!.invalidate();
      refreshControllerRef.current?.abort();
      apiClient.beginContextTransition();
      apiClient.rotateRequestContext();
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
        // Complete a pending cookie change before deleting the session.
        await switchRequestRef.current?.catch(() => undefined);
        await Promise.all([
          fetch("/api/auth/logout", {
            method: "POST",
            credentials: "same-origin",
            signal: AbortSignal.timeout(logoutRequestTimeoutMs),
          }).catch(() => undefined),
          transitionDelay,
        ]);

        // Keep the history stack clean so Back cannot reopen a protected page.
        router.replace(appRoutes.auth.login);
        userRef.current = null;
        setUser(null);
        setError(null);
        apiClient.resetLogoutGuard();
      } finally {
        logoutPromiseRef.current = null;
        loggingOutRef.current = false;
        apiClient.endContextTransition();
      }
    };

    const logoutPromise = performLogout();
    logoutPromiseRef.current = logoutPromise;
    return logoutPromise;
  }, [router]);

  const switchCompany = useCallback(async (companyId: number) => {
    if (companySwitchTransitionRef.current || loggingOutRef.current) throw new Error("Session transition already in progress");
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
    refreshControllerRef.current?.abort();
    apiClient.beginContextTransition();
    apiClient.rotateRequestContext();
    setIsSwitchingCompany(true);
    setError(null);
    let logoutTriggered = false;
    let sessionVerificationComplete = false;
    const switchLogoutEpoch = logoutEpochRef.current;
    try {
      switchRequestRef.current = fetch(authRoutes.switchCompany, {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ companyId }),
        signal: AbortSignal.timeout(companySwitchRequestTimeoutMs),
      });
      const response = await switchRequestRef.current;
      if (loggingOutRef.current) throw new Error("Session is logging out");

      if (response.status === 401) {
        logoutTriggered = true;
        await logout();
        throw new Error("Authentication session expired");
      }
      if (!response.ok) {
        throw new Error(await readProblemMessage(response));
      }

      // The switch endpoint changes the cookie, while the session endpoint is
      // the source of truth for the company that is actually active.  A
      // transient response (for example, an eventually-consistent auth
      // store) must not expose the previous company, so retry the verification
      // once before failing the transition.
      const verifiedCompany = await verifyTargetCompany({
        companyId,
        revalidate: async () => {
          await revalidate(true, true);
          if (loggingOutRef.current || logoutEpochRef.current !== switchLogoutEpoch) {
            logoutTriggered = true;
            throw new Error("Session is logging out");
          }
          if (revalidationResultRef.current === "unauthenticated") {
            logoutTriggered = true;
            await logout();
            throw new Error("Authentication session expired");
          }
        },
        readCompanyId: () => userRef.current?.companyId,
        clearStaleSession: () => {
          userRef.current = null;
          setUser(null);
        },
      });
      sessionVerificationComplete = true;
      if (!verifiedCompany) {
        userRef.current = null;
        setUser(null);
        setError("Unable to verify the switched company session");
        router.replace(unavailableUrlWithReturnTo() as Route);
        throw new Error("Unable to verify the switched company session");
      }
    } catch (error) {
      // A failed transport may have applied Set-Cookie; require a fresh session
      // before presenting data again instead of assuming the old company.
      if (!loggingOutRef.current && !logoutTriggered && !sessionVerificationComplete) {
        userRef.current = null;
        setUser(null);
        await revalidate(true);
      }
      throw error;
    } finally {
      switchRequestRef.current = null;
      companySwitchTransitionRef.current = false;
      apiClient.endContextTransition();
      setIsSwitchingCompany(false);
    }
  }, [logout, revalidate, router]);

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

  return (
    <SessionContext.Provider value={value}>
      <Suspense fallback={null}>
        <SessionRouteObserver
          bootstrappedRef={bootstrappedRef}
          pathnameRef={pathnameRef}
          refresh={refresh}
          setIsLoading={setIsLoading}
        />
      </Suspense>
      {children}
    </SessionContext.Provider>
  );
}

function SessionRouteObserver({
  bootstrappedRef,
  pathnameRef,
  refresh,
  setIsLoading,
}: {
  bootstrappedRef: { current: boolean };
  pathnameRef: { current: string };
  refresh: () => Promise<void>;
  setIsLoading: (value: boolean) => void;
}) {
  const pathname = usePathname();
  const requiresSession = !isPublicRoute(pathname) && pathname !== UNAVAILABLE_ROUTE;

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname, pathnameRef]);

  useEffect(() => {
    if (!requiresSession) {
      bootstrappedRef.current = false;
      setIsLoading(false);
      return;
    }
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;
    setIsLoading(true);
    void refresh();
  }, [bootstrappedRef, refresh, requiresSession, setIsLoading]);

  return null;
}

async function readProblemMessage(response: Response) {
  try {
    const problem: unknown = await response.json();
    if (problem && typeof problem === "object") {
      const record = problem as Record<string, unknown>;
      if (typeof record.detail === "string" && record.detail.trim()) return record.detail;
      if (typeof record.title === "string" && record.title.trim()) return record.title;
    }
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

function classifySessionTransportFailure(error: unknown): "timeout" | "network" {
  if (
    typeof DOMException !== "undefined" &&
    error instanceof DOMException &&
    error.name === "TimeoutError"
  ) {
    return "timeout";
  }
  return "network";
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession must be used within SessionProvider");
  return value;
}
