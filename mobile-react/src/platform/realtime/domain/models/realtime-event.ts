export interface RealtimeEntityChanged {
  eventId: string;
  occurredAtUtc: string;
  resource: string;
  action: string;
  entityId: string | null;
}

export interface RealtimeNotification {
  id: number;
  actorUserId?: string | null;
}
