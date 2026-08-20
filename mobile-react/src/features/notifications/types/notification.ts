import type { PageMetadata } from '@/src/core/api';

export type NotificationSeverity = 1 | 2 | 3 | 4 | 'Info' | 'Success' | 'Warning' | 'Critical';
export type NotificationReadStatus = 0 | 1 | 2;
export type NotificationFilter = 'all' | 'unread' | 'read';

export interface AppNotification {
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
  actorUserId: string | null;
  correlationId: string;
  createdOn: string;
  readOn: string | null;
  expiresOn: string | null;
}

export interface NotificationQuery {
  pageNumber?: number;
  pageSize?: number;
  status?: NotificationReadStatus;
  category?: string;
  severity?: Exclude<NotificationSeverity, string>;
  columnName?: 'CreatedOn' | 'ReadOn' | 'Severity' | 'Category';
  sortDirection?: 'ASC' | 'DESC';
}

export interface NotificationPageResponse {
  items: AppNotification[];
  metaData: PageMetadata;
}
