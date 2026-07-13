import { version } from "./constants";

const base = `${version}/notifications`;

export const notifications = {
  list: `${base}/getAll`,
  unreadCount: `${base}/getUnreadCount`,
  markRead: (id: number) => `${base}/markRead/${id}`,
  markUnread: (id: number) => `${base}/markUnread/${id}`,
  markAllRead: `${base}/markAllRead`,
  markAllUnread: `${base}/markAllUnread`,
  dismiss: (id: number) => `${base}/dismiss/${id}`,
  dismissAll: `${base}/dismissAll`,
};
