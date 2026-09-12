export const notificationEndpoints = {
  list: 'notifications/getAll',
  unreadCount: 'notifications/getUnreadCount',
  markRead: (id: number) => `notifications/markRead/${id}`,
  markUnread: (id: number) => `notifications/markUnread/${id}`,
  markAllRead: 'notifications/markAllRead',
  markAllUnread: 'notifications/markAllUnread',
  dismiss: (id: number) => `notifications/dismiss/${id}`,
  dismissAll: 'notifications/dismissAll',
} as const;
