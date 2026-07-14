"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useSession } from "@/lib/auth/SessionContext";
import { useSignalRConnection } from "@/lib/signalr/SignalRProvider";
import { showToast } from "@/shared/components/feedback";
import signalRService from "@/shared/services/signalRService";
import { notificationKeys } from "./notificationQueries";
import {
  normalizeSeverity,
  translateNotification,
} from "./notificationPresentation";
import type { AppNotification } from "./types";

const notificationSchema = z.object({
  id: z.number().int().positive(),
  category: z.string(),
  eventType: z.string(),
  severity: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal("Info"),
    z.literal("Success"),
    z.literal("Warning"),
    z.literal("Critical"),
  ]),
  titleKey: z.string(),
  messageKey: z.string(),
  parameters: z.record(z.string(), z.string()),
  entityType: z.string().nullable(),
  entityId: z.string().nullable(),
  actionUrl: z.string().nullable(),
  correlationId: z.string(),
  createdOn: z.string(),
  actorUserId: z.string().nullable().optional(),
});

export function NotificationRealtimeBridge() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { user } = useSession();
  const { isConnected } = useSignalRConnection();
  const wasConnected = useRef(false);
  const receivedIds = useRef(new Set<number>());

  useEffect(() => {
    const receiveNotification = (...args: unknown[]) => {
      const result = notificationSchema.safeParse(args[0]);
      if (!result.success) {
        console.warn("[Notifications] Ignored an invalid realtime payload");
        return;
      }

      const notification = result.data as AppNotification;
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

      // The actor also receives the persisted notification, but should not see
      // a second toast for the action they just performed.
      if (notification.actorUserId && notification.actorUserId === user?.userId) {
        return;
      }

      const { title, message } = translateNotification(notification, t);
      const toastMessage = `${title}: ${message}`;
      const severity = normalizeSeverity(notification.severity);
      if (severity === "success") showToast.success(toastMessage);
      else if (severity === "warning" || severity === "critical") {
        showToast.warning(toastMessage);
      } else showToast.info(toastMessage);
    };

    signalRService.on("ReceiveNotification", receiveNotification);
    return () => signalRService.off("ReceiveNotification", receiveNotification);
  }, [queryClient, t, user?.userId]);

  useEffect(() => {
    if (isConnected && !wasConnected.current) {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    }
    wasConnected.current = isConnected;
  }, [isConnected, queryClient]);

  return null;
}
