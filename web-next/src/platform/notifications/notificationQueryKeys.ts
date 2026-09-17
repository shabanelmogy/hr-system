import type { NotificationFilter } from "./types";

export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (filter: NotificationFilter) =>
    [...notificationKeys.lists(), filter] as const,
  unreadCount: () => [...notificationKeys.all, "unread-count"] as const,
};
