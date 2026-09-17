"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useSession } from "@/lib/auth/SessionContext";
import { useSignalRConnection } from "@/lib/signalr/SignalRProvider";
import signalRService from "@/lib/signalr/signalRService";
import { showToast } from "@/shared/components/feedback/transient";
import { notificationKeys } from "./notificationQueryKeys";
import {
  normalizeSeverity,
  translateNotification,
} from "./notificationPresentation";

type NotificationParserModule = typeof import("./notificationRealtimeParser");
let notificationParserPromise: Promise<NotificationParserModule> | null = null;

function loadNotificationParser() {
  notificationParserPromise ??= import("./notificationRealtimeParser").catch((error: unknown) => {
    notificationParserPromise = null;
    throw error;
  });
  return notificationParserPromise;
}

export function NotificationRealtimeBridge() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { user } = useSession();
  const { isConnected } = useSignalRConnection();
  const wasConnected = useRef(false);
  const hasConnectedOnce = useRef(false);
  const receivedIds = useRef(new Set<number>());

  useEffect(() => {
    let disposed = false;

    const receiveNotification = (...args: unknown[]) => {
      void loadNotificationParser()
        .then(({ parseRealtimeNotification }) => {
          if (disposed) return;
          const notification = parseRealtimeNotification(args[0]);
          if (!notification) {
            console.warn("[Notifications] Ignored an invalid realtime payload");
            return;
          }

          if (receivedIds.current.has(notification.id)) return;
          receivedIds.current.add(notification.id);
          if (receivedIds.current.size > 200) {
            const oldestId = receivedIds.current.values().next().value;
            if (oldestId !== undefined) receivedIds.current.delete(oldestId);
          }
          queryClient.setQueryData<number>(notificationKeys.unreadCount(), (count) =>
            (count ?? 0) + 1,
          );
          void queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
          void queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });

          if (notification.actorUserId && notification.actorUserId === user?.userId) return;

          const { title, message } = translateNotification(notification, t);
          const toastMessage = `${title}: ${message}`;
          const severity = normalizeSeverity(notification.severity);
          if (severity === "success") showToast.success(toastMessage);
          else if (severity === "warning" || severity === "critical") {
            showToast.warning(toastMessage);
          } else showToast.info(toastMessage);
        })
        .catch((error: unknown) => {
          if (!disposed) console.warn("[Notifications] Realtime validator failed to load", error);
        });
    };

    signalRService.on("ReceiveNotification", receiveNotification);
    return () => {
      disposed = true;
      signalRService.off("ReceiveNotification", receiveNotification);
    };
  }, [queryClient, t, user?.userId]);

  useEffect(() => {
    if (isConnected && !wasConnected.current) {
      if (hasConnectedOnce.current) {
        void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      }
      hasConnectedOnce.current = true;
    }
    wasConnected.current = isConnected;
  }, [isConnected, queryClient]);

  return null;
}
