export type NotificationSeverity =
  | 1
  | 2
  | 3
  | 4
  | "Info"
  | "Success"
  | "Warning"
  | "Critical";

export type NotificationReadStatus = 0 | 1 | 2;

export type AppNotification = {
  id: number;
  category: string;
  eventType: string;
  severity: NotificationSeverity;
  titleKey: string;
  messageKey: string;
  parameters: Record<string, string>;
  entityType: string | null;
  entityId: string | null;
  actionUrl: string | null;
  actorUserId?: string | null;
  correlationId: string;
  createdOn: string;
  readOn?: string | null;
  expiresOn?: string | null;
};

export type NotificationPageMetadata = {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  pageNumber: number;
  totalCount: number;
  hasPrev: boolean;
  hasNext: boolean;
};

export type NotificationPageResponse = {
  items: AppNotification[];
  metaData: NotificationPageMetadata;
};

export type NotificationFilter = "all" | "unread";
