"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "@/features/auth";
import { useSignalRConnection } from "@/lib/signalr/SignalRProvider";
import signalRService from "@/lib/signalr/signalRService";
import { parseRealtimeEntityChanged } from "./realtimeEvent";
import {
  getAllRealtimeQueryKeys,
  getRealtimeQueryKeys,
  realtimeResources,
} from "./realtimeQueryRegistry";

const INVALIDATION_DELAY_MS = 100;
const MAX_RECENT_EVENTS = 500;

export function RealtimeEntityBridge() {
  const queryClient = useQueryClient();
  const { isConnected } = useSignalRConnection();
  const wasConnected = useRef(false);
  const recentEventIds = useRef(new Set<string>());

  useEffect(() => {
    const pendingResources = new Set<string>();
    let flushTimer: ReturnType<typeof setTimeout> | null = null;

    const refreshUsersIfLoaded = () => {
      const userStore = useUserStore.getState();
      if (!userStore.hasLoaded) return;

      void userStore.fetchUsers().catch((error: unknown) => {
        console.warn("[Realtime] User refresh delayed", error);
      });
    };

    const flush = () => {
      flushTimer = null;

      for (const resource of pendingResources) {
        for (const queryKey of getRealtimeQueryKeys(resource)) {
          void queryClient.invalidateQueries({ queryKey, refetchType: "active" });
        }

        if (resource === realtimeResources.users) refreshUsersIfLoaded();
      }

      pendingResources.clear();
    };

    const receiveEntityChanged = (...args: unknown[]) => {
      const change = parseRealtimeEntityChanged(args[0]);
      if (!change) {
        console.warn("[Realtime] Ignored an invalid entity-change payload");
        return;
      }

      if (recentEventIds.current.has(change.eventId)) return;
      recentEventIds.current.add(change.eventId);
      if (recentEventIds.current.size > MAX_RECENT_EVENTS) {
        const oldestEventId = recentEventIds.current.values().next().value;
        if (oldestEventId) recentEventIds.current.delete(oldestEventId);
      }

      pendingResources.add(change.resource);
      if (!flushTimer) flushTimer = setTimeout(flush, INVALIDATION_DELAY_MS);
    };

    signalRService.on("ReceiveEntityChanged", receiveEntityChanged);
    return () => {
      signalRService.off("ReceiveEntityChanged", receiveEntityChanged);
      if (flushTimer) clearTimeout(flushTimer);
    };
  }, [queryClient]);

  useEffect(() => {
    if (isConnected && !wasConnected.current) {
      for (const queryKey of getAllRealtimeQueryKeys()) {
        void queryClient.invalidateQueries({ queryKey, refetchType: "active" });
      }

      const userStore = useUserStore.getState();
      if (userStore.hasLoaded) {
        void userStore.fetchUsers().catch((error: unknown) => {
          console.warn("[Realtime] User reconnect refresh delayed", error);
        });
      }
    }

    wasConnected.current = isConnected;
  }, [isConnected, queryClient]);

  return null;
}
