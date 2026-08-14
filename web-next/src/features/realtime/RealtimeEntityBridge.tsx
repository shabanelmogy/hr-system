"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRoleStore, useUserStore } from "@/features/auth";
import { useSignalRConnection } from "@/lib/signalr/SignalRProvider";
import signalRService from "@/lib/signalr/signalRService";
import { parseRealtimeEntityChanged } from "./realtimeEvent";
import {
  getRealtimeQueryKeys,
  isKnownRealtimeResource,
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

    const refreshRolesIfLoaded = () => {
      const roleStore = useRoleStore.getState();
      if (!roleStore.hasLoaded) return;

      void roleStore.fetchRoles().catch((error: unknown) => {
        console.warn("[Realtime] Role refresh delayed", error);
      });
    };

    const refreshCompanyOptionsIfLoaded = () => {
      const userStore = useUserStore.getState();
      if (!userStore.hasLoaded) return;

      void userStore.fetchCompanyOptions().catch((error: unknown) => {
        console.warn("[Realtime] Company-option refresh delayed", error);
      });
    };

    const flush = () => {
      flushTimer = null;

      for (const resource of pendingResources) {
        for (const queryKey of getRealtimeQueryKeys(resource)) {
          void queryClient.invalidateQueries({ queryKey, refetchType: "active" });
        }

        if (resource === realtimeResources.users) refreshUsersIfLoaded();
        if (
          resource === realtimeResources.roles ||
          resource === realtimeResources.roleClaims
        ) {
          refreshRolesIfLoaded();
        }
        if (resource === realtimeResources.companies) {
          refreshCompanyOptionsIfLoaded();
        }

        if (!isKnownRealtimeResource(resource)) {
          void queryClient.invalidateQueries({ refetchType: "active" });
        }
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
      void queryClient.invalidateQueries({ refetchType: "active" });

      const userStore = useUserStore.getState();
      if (userStore.hasLoaded) {
        void Promise.all([userStore.fetchUsers(), userStore.fetchCompanyOptions()]).catch(
          (error: unknown) => {
            console.warn("[Realtime] User reconnect refresh delayed", error);
          },
        );
      }

      const roleStore = useRoleStore.getState();
      if (roleStore.hasLoaded) {
        void roleStore.fetchRoles().catch((error: unknown) => {
          console.warn("[Realtime] Role reconnect refresh delayed", error);
        });
      }
    }

    wasConnected.current = isConnected;
  }, [isConnected, queryClient]);

  return null;
}
