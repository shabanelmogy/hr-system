import { apiService } from '@/src/core/api';
import type {
  AppNotification,
  NotificationPageResponse,
  NotificationQuery,
} from '@/src/features/notifications/types/notification';

const endpoints = {
  list: 'notifications/getAll',
  unreadCount: 'notifications/getUnreadCount',
  markRead: (id: number) => `notifications/markRead/${id}`,
  markUnread: (id: number) => `notifications/markUnread/${id}`,
  markAllRead: 'notifications/markAllRead',
  markAllUnread: 'notifications/markAllUnread',
  dismiss: (id: number) => `notifications/dismiss/${id}`,
  dismissAll: 'notifications/dismissAll',
} as const;

const DEFAULT_PAGE_SIZE = 20;

export const notificationApi = {
  async getPage(query: NotificationQuery = {}): Promise<NotificationPageResponse> {
    const response = await apiService.get<unknown>(endpoints.list, {
      params: {
        pageNumber: query.pageNumber ?? 1,
        pageSize: query.pageSize ?? DEFAULT_PAGE_SIZE,
        status: query.status ?? 0,
        category: query.category,
        severity: query.severity,
        columnName: query.columnName ?? 'CreatedOn',
        sortDirection: query.sortDirection ?? 'DESC',
      },
    });
    return parsePage(response);
  },

  async getUnreadCount(): Promise<number> {
    const response = await apiService.get<unknown>(endpoints.unreadCount);
    const value = unwrapValue(response);
    return asNonNegativeInteger(value);
  },

  async markRead(id: number): Promise<void> { await apiService.patch<unknown, undefined>(endpoints.markRead(id), undefined); },
  async markUnread(id: number): Promise<void> { await apiService.patch<unknown, undefined>(endpoints.markUnread(id), undefined); },
  async markAllRead(): Promise<void> { await apiService.patch<unknown, undefined>(endpoints.markAllRead, undefined); },
  async markAllUnread(): Promise<void> { await apiService.patch<unknown, undefined>(endpoints.markAllUnread, undefined); },
  async dismiss(id: number): Promise<void> { await apiService.delete<unknown>(endpoints.dismiss(id)); },
  async dismissAll(): Promise<void> { await apiService.delete<unknown>(endpoints.dismissAll); },
};

function parsePage(value: unknown): NotificationPageResponse {
  const page = asRecord(unwrapValue(value)) ?? {};
  const itemsValue = page.items ?? page.Items;
  const metadataValue = page.metaData ?? page.MetaData;
  const items = Array.isArray(itemsValue) ? itemsValue.map(parseNotification) : [];
  const metadata = asRecord(metadataValue) ?? {};
  const currentPage = asPositiveInteger(metadata.currentPage ?? metadata.CurrentPage, 1);
  const pageSize = asPositiveInteger(metadata.pageSize ?? metadata.PageSize, DEFAULT_PAGE_SIZE);
  const totalCount = asNonNegativeInteger(metadata.totalCount ?? metadata.TotalCount);
  const totalPages = asNonNegativeInteger(metadata.totalPages ?? metadata.TotalPages);

  return {
    items,
    metaData: {
      currentPage,
      pageNumber: asPositiveInteger(metadata.pageNumber ?? metadata.PageNumber, currentPage),
      pageSize,
      totalCount,
      totalPages,
      hasPrev: Boolean(metadata.hasPrev ?? metadata.HasPrev),
      hasNext: Boolean(metadata.hasNext ?? metadata.HasNext),
    },
  };
}

function parseNotification(value: unknown): AppNotification {
  const item = asRecord(unwrapValue(value)) ?? {};
  const severity = item.severity ?? item.Severity;
  return {
    id: asPositiveInteger(item.id ?? item.Id, 0),
    category: asString(item.category ?? item.Category),
    eventType: asString(item.eventType ?? item.EventType),
    severity: isSeverity(severity) ? severity : 'Info',
    titleKey: asString(item.titleKey ?? item.TitleKey),
    messageKey: asString(item.messageKey ?? item.MessageKey),
    parameters: parseParameters(item.parameters ?? item.Parameters),
    entityType: asOptionalString(item.entityType ?? item.EntityType),
    entityId: asOptionalString(item.entityId ?? item.EntityId),
    actionUrl: asOptionalString(item.actionUrl ?? item.ActionUrl),
    actorUserId: asOptionalString(item.actorUserId ?? item.ActorUserId),
    correlationId: asString(item.correlationId ?? item.CorrelationId),
    createdOn: asString(item.createdOn ?? item.CreatedOn),
    readOn: asOptionalString(item.readOn ?? item.ReadOn),
    expiresOn: asOptionalString(item.expiresOn ?? item.ExpiresOn),
  };
}

function unwrapValue(value: unknown): unknown {
  const record = asRecord(value);
  return record?.isSuccess === true && 'value' in record ? record.value : record?.value ?? record?.data ?? value;
}

function parseParameters(value: unknown): Record<string, string> {
  const source = asRecord(value);
  if (!source) return {};
  return Object.fromEntries(Object.entries(source).map(([key, item]) => [key, String(item ?? '')]));
}

function isSeverity(value: unknown): value is AppNotification['severity'] {
  return value === 1 || value === 2 || value === 3 || value === 4 ||
    value === 'Info' || value === 'Success' || value === 'Warning' || value === 'Critical';
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function asString(value: unknown): string { return typeof value === 'string' ? value : ''; }
function asOptionalString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}
function asNonNegativeInteger(value: unknown): number {
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isInteger(number) && number >= 0 ? number : 0;
}
function asPositiveInteger(value: unknown, fallback: number): number {
  const number = asNonNegativeInteger(value);
  return number > 0 ? number : fallback;
}
