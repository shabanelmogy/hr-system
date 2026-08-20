import { notificationPageSchema, unreadNotificationCountSchema } from '../notification-schemas';

const page = {
  items: [{
    id: 1,
    category: 'users',
    eventType: 'updated',
    severity: 'Info',
    titleKey: 'Notifications.UserChangedTitle',
    messageKey: 'Notifications.UserChangedMessage',
    parameters: { userName: 'Ada' },
    entityType: null,
    entityId: null,
    actionUrl: null,
    actorUserId: null,
    correlationId: '123e4567-e89b-12d3-a456-426614174000',
    createdOn: '2026-08-20T10:00:00Z',
    readOn: null,
    expiresOn: null,
  }],
  metaData: {
    currentPage: 1,
    pageNumber: 1,
    pageSize: 20,
    totalCount: 1,
    totalPages: 1,
    hasPrev: false,
    hasNext: false,
  },
};

describe('notification response schemas', () => {
  it('accepts the canonical paged API response', () => {
    expect(notificationPageSchema.parse(page)).toEqual(page);
    expect(unreadNotificationCountSchema.parse(4)).toBe(4);
  });

  it('rejects a page missing a required notification field', () => {
    const invalid = structuredClone(page);
    delete (invalid.items[0] as Partial<typeof page.items[number]>).messageKey;

    expect(notificationPageSchema.safeParse(invalid).success).toBe(false);
  });

  it('rejects an invalid unread count', () => {
    expect(unreadNotificationCountSchema.safeParse(-1).success).toBe(false);
  });
});
