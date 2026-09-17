"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUnsavedChanges } from "@/shared/contexts/UnsavedChangesContext";
import {
  canPullToRefresh,
  hasOpenModalSurface,
  isEditableElement,
  isPullToRefreshBlockedTarget,
} from "./pullToRefreshPolicy";

export function MainClientBootstrap() {
  const queryClient = useQueryClient();
  const unsavedChanges = useUnsavedChanges();
  const gestureTargetRef = useRef<EventTarget | null>(null);

  useEffect(() => {
    const supportsTouch =
      navigator.maxTouchPoints > 0 || window.matchMedia("(pointer: coarse)").matches;
    if (!supportsTouch) return;

    let disposed = false;
    let destroyPullToRefresh: (() => void) | undefined;

    const captureGestureTarget = (event: Event) => {
      gestureTargetRef.current = event.target;
    };
    window.addEventListener("touchstart", captureGestureTarget, { capture: true, passive: true });
    window.addEventListener("pointerdown", captureGestureTarget, { capture: true, passive: true });

    const shouldPullToRefresh = () => canPullToRefresh({
      scrollY: window.scrollY,
      hasUnsavedChanges: unsavedChanges.hasUnsavedChanges(),
      isBusy: unsavedChanges.isBusy(),
      hasPendingMutations: queryClient.isMutating() > 0,
      hasOpenModal: hasOpenModalSurface(),
      gestureStartedInBlockedSurface: isPullToRefreshBlockedTarget(gestureTargetRef.current),
      hasFocusedEditableElement: isEditableElement(document.activeElement),
    });

    const loadPullToRefresh = () => {
      void import("pulltorefreshjs").then(({ default: PullToRefresh }) => {
        if (disposed) return;
        const pullToRefresh = PullToRefresh.init({
          mainElement: "body",
          shouldPullToRefresh,
          async onRefresh() {
            // Re-check after the library's release delay. A mutation or dialog
            // may have started since the gesture began.
            if (!shouldPullToRefresh()) return;
            // Refresh only mounted read queries. Mutations are never replayed,
            // and inactive feature caches stay untouched until their screen mounts.
            await queryClient.refetchQueries({ type: "active" });
          },
        });

        destroyPullToRefresh = () => {
          PullToRefresh.destroyAll();
          pullToRefresh?.destroy?.();
        };
      });
    };

    let cancelIdleLoad: (() => void) | undefined;
    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    if (typeof idleWindow.requestIdleCallback === "function") {
      const requestId = idleWindow.requestIdleCallback(loadPullToRefresh, { timeout: 1_500 });
      cancelIdleLoad = () => idleWindow.cancelIdleCallback?.(requestId);
    } else {
      const timeoutId = window.setTimeout(loadPullToRefresh, 250);
      cancelIdleLoad = () => window.clearTimeout(timeoutId);
    }

    return () => {
      disposed = true;
      cancelIdleLoad?.();
      destroyPullToRefresh?.();
      window.removeEventListener("touchstart", captureGestureTarget, true);
      window.removeEventListener("pointerdown", captureGestureTarget, true);
    };
  }, [queryClient, unsavedChanges]);

  return null;
}
