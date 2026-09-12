import type { TFunction } from "i18next";
import type { AppNotification, NotificationSeverity } from "./types";

export type NormalizedNotificationSeverity =
  | "info"
  | "success"
  | "warning"
  | "critical";

export function normalizeSeverity(
  severity: NotificationSeverity,
): NormalizedNotificationSeverity {
  if (severity === 2 || severity === "Success") return "success";
  if (severity === 3 || severity === "Warning") return "warning";
  if (severity === 4 || severity === "Critical") return "critical";
  return "info";
}

export function translateNotification(
  notification: Pick<
    AppNotification,
    "titleKey" | "messageKey" | "parameters" | "eventType"
  >,
  t: TFunction,
) {
  return {
    title: t(notification.titleKey, {
      ...notification.parameters,
      defaultValue: humanizeKey(notification.titleKey || notification.eventType),
    }),
    message: t(notification.messageKey, {
      ...notification.parameters,
      defaultValue: humanizeKey(notification.messageKey || notification.eventType),
    }),
  };
}

export function formatRelativeTime(value: string, locale: string): string {
  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) return "";

  const elapsedSeconds = Math.round((time - Date.now()) / 1_000);
  const intervals: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["week", 604_800],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ];
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  for (const [unit, seconds] of intervals) {
    if (Math.abs(elapsedSeconds) >= seconds) {
      return formatter.format(Math.round(elapsedSeconds / seconds), unit);
    }
  }

  return formatter.format(elapsedSeconds, "second");
}

export function isSafeAppUrl(value: string | null): value is string {
  return Boolean(value && value.startsWith("/") && !value.startsWith("//"));
}

function humanizeKey(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[._-]+/g, " ")
    .trim();
}
