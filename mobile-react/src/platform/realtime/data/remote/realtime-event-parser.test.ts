import {
  parseRealtimeEntityChanged,
  parseRealtimeNotification,
} from './realtime-event-parser';

describe('realtime event parser', () => {
  it('accepts valid entity-change payloads and rejects malformed payloads', () => {
    const event = {
      eventId: '123e4567-e89b-12d3-a456-426614174000',
      occurredAtUtc: '2026-09-10T10:00:00.000Z',
      resource: 'countries',
      action: 'updated',
      entityId: '1',
    };

    expect(parseRealtimeEntityChanged(event)).toEqual(event);
    expect(parseRealtimeEntityChanged({ ...event, eventId: 'invalid' })).toBeNull();
  });

  it('validates notification payloads independently from the React provider', () => {
    expect(parseRealtimeNotification({ id: 42, actorUserId: null })).toEqual({
      id: 42,
      actorUserId: null,
    });
    expect(parseRealtimeNotification({ id: 0 })).toBeNull();
  });
});
