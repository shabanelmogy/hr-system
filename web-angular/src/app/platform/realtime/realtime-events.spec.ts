import { TestBed } from '@angular/core/testing';
import { ERP_API_ORIGIN } from '../../config/api-origin';
import { AuthSession } from '../auth/session.public-api';
import { BrowserAuthService } from '../auth/services/browser-auth-service';
import {
  REALTIME_CONNECTOR,
  RealtimeEvents,
  type RealtimeConnection,
  type RealtimeEvent,
} from './realtime-events';

const change = {
  eventId: '00000000-0000-4000-8000-000000000001',
  occurredAtUtc: '2026-10-31T12:00:00.0000000Z',
  resource: 'countries',
  action: 'updated',
  entityId: '1',
};
const settle = async () => {
  for (let i = 0; i < 12; i++) await Promise.resolve();
};
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

describe('Actor-owned lazy realtime lease', () => {
  function setup() {
    vi.useFakeTimers();
    let current = true;
    const handlers = new Map<string, (payload: unknown) => void>();
    let closed = () => {};
    const connection: RealtimeConnection = {
      start: vi.fn(async () => {}),
      stop: vi.fn(async () => {}),
      on: (name, handler) => {
        handlers.set(name, handler);
      },
      onclose: (handler) => {
        closed = handler;
      },
    };
    let tokenFactory!: () => Promise<string>;
    const connector = vi.fn(async (_origin: string, token: () => Promise<string>) => {
      tokenFactory = token;
      return connection;
    });
    const transport = { realtimeToken: vi.fn(async () => 'ephemeral-fixture') };
    const auth = { synchronizeContext: vi.fn(async () => true) };
    TestBed.configureTestingModule({
      providers: [
        { provide: ERP_API_ORIGIN, useValue: 'https://api.example.test' },
        { provide: REALTIME_CONNECTOR, useValue: connector },
        { provide: BrowserAuthService, useValue: transport },
        { provide: AuthSession, useValue: auth },
      ],
    });
    const events: RealtimeEvent[] = [];
    const stream = TestBed.inject(RealtimeEvents).watch(() => current);
    const subscribe = () => stream.subscribe((event) => events.push(event));
    return {
      connection,
      connector,
      transport,
      auth,
      events,
      subscribe,
      emit: (name: string, value: unknown) => handlers.get(name)?.(value),
      close: () => closed(),
      expire: () => {
        current = false;
      },
      token: () => tokenFactory(),
    };
  }
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
  });

  it('loads only on subscription, reconciles the first connection and obtains fresh non-persisted tokens', async () => {
    const s = setup();
    expect(s.connector).not.toHaveBeenCalled();
    const lease = s.subscribe();
    await settle();
    expect(s.connector).toHaveBeenCalledWith(
      'https://api.example.test',
      expect.any(Function),
      expect.any(Function),
    );
    expect(s.events).toEqual([
      { kind: 'status', status: 'connecting' },
      { kind: 'status', status: 'connected' },
      { kind: 'reconcile' },
    ]);
    expect(await s.token()).toBe('ephemeral-fixture');
    expect(await s.token()).toBe('ephemeral-fixture');
    expect(s.transport.realtimeToken).toHaveBeenCalledTimes(2);
    lease.unsubscribe();
    expect(s.connection.stop).toHaveBeenCalled();
  });
  it('validates envelopes, normalizes GUID dedup and permits unknown actions without trusting their contents', async () => {
    const s = setup(),
      lease = s.subscribe();
    await settle();
    for (const invalid of [
      null,
      {},
      { ...change, eventId: 'bad' },
      { ...change, occurredAtUtc: 'yesterday' },
      { ...change, resource: '../countries' },
      { ...change, entityId: {} },
      { ...change, action: '' },
      { ...change, record: { name: 'untrusted' } },
    ])
      s.emit('ReceiveEntityChanged', invalid);
    s.emit('ReceiveEntityChanged', {
      ...change,
      action: 'future-action',
      eventId: 'ABCDEF00-0000-4000-8000-000000000001',
    });
    s.emit('ReceiveEntityChanged', { ...change, eventId: 'abcdef00-0000-4000-8000-000000000001' });
    const hints = s.events.filter((x) => x.kind === 'change');
    expect(hints).toHaveLength(1);
    expect(hints[0]).toMatchObject({ change: { action: 'future-action' } });
    lease.unsubscribe();
  });
  it('bounds dedup to512 IDs, without timestamp ordering assumptions', async () => {
    const s = setup(),
      lease = s.subscribe();
    await settle();
    for (let i = 0; i < 513; i++)
      s.emit('ReceiveEntityChanged', {
        ...change,
        eventId: '00000000-0000-4000-8000-' + i.toString(16).padStart(12, '0'),
      });
    s.emit('ReceiveEntityChanged', {
      ...change,
      eventId: '00000000-0000-4000-8000-000000000000',
      occurredAtUtc: '2020-01-01T00:00:00Z',
    });
    expect(s.events.filter((x) => x.kind === 'change')).toHaveLength(514);
    lease.unsubscribe();
  });
  it('retries failed initial starts with one capped timer, then reconciles a successful restart', async () => {
    const s = setup();
    vi.mocked(s.connection.start).mockRejectedValue(new Error('offline'));
    const lease = s.subscribe();
    await settle();
    for (const delay of [1000, 2000, 4000, 8000, 16000, 30000, 30000]) {
      expect(vi.getTimerCount()).toBe(1);
      await vi.advanceTimersByTimeAsync(delay);
      await settle();
    }
    expect(s.connection.start).toHaveBeenCalledTimes(8);
    vi.mocked(s.connection.start).mockResolvedValue(undefined);
    await vi.advanceTimersByTimeAsync(30000);
    await settle();
    expect(s.events.at(-1)).toEqual({ kind: 'reconcile' });
    expect(vi.getTimerCount()).toBe(0);
    lease.unsubscribe();
  });
  it('coalesces close callbacks and cancels the timer on unsubscribe', async () => {
    const s = setup(),
      lease = s.subscribe();
    await settle();
    s.close();
    s.close();
    s.close();
    expect(vi.getTimerCount()).toBe(1);
    lease.unsubscribe();
    await vi.advanceTimersByTimeAsync(60000);
    expect(s.connection.start).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });
  it('reconciles reconnects and resets retry delay after success', async () => {
    const s = setup(),
      lease = s.subscribe();
    await settle();
    s.close();
    await vi.advanceTimersByTimeAsync(1000);
    await settle();
    expect(s.events.filter((x) => x.kind === 'reconcile')).toHaveLength(2);
    s.close();
    await vi.advanceTimersByTimeAsync(1000);
    await settle();
    expect(s.connection.start).toHaveBeenCalledTimes(3);
    lease.unsubscribe();
  });
  it.each([401, 403])(
    'terminates hub start denial%s without repeatedly replacing a valid Cookie session',
    async (status) => {
      const s = setup();
      vi.mocked(s.connection.start).mockRejectedValue({ statusCode: status });
      const lease = s.subscribe();
      await settle();
      expect(lease.closed).toBe(true);
      expect(s.events.at(-1)).toEqual({ kind: 'status', status: 'denied' });
      expect(s.auth.synchronizeContext).not.toHaveBeenCalled();
      expect(vi.getTimerCount()).toBe(0);
    },
  );
  it.each([401, 403])(
    'terminates dedicated-token denial%s without passing a token to the hub',
    async (status) => {
      const s = setup(),
        lease = s.subscribe();
      await settle();
      s.transport.realtimeToken.mockRejectedValue({ status });
      await expect(s.token()).rejects.toEqual({ status });
      expect(lease.closed).toBe(true);
      expect(s.auth.synchronizeContext).toHaveBeenCalledTimes(status === 401 ? 1 : 0);
      s.close();
      expect(vi.getTimerCount()).toBe(0);
    },
  );
  it('stops and synchronizes once on explicit token revocation, ignoring later callbacks', async () => {
    const s = setup(),
      lease = s.subscribe();
    await settle();
    s.emit('ReceiveTokenRevoked', 'untrusted text');
    s.emit('ReceiveTokenRevoked', 'again');
    s.emit('ReceiveEntityChanged', change);
    expect(lease.closed).toBe(true);
    expect(s.auth.synchronizeContext).toHaveBeenCalledTimes(1);
    expect(s.events.filter((x) => x.kind === 'change')).toHaveLength(0);
  });
  it('does not start a lazy connection whose lease ended during import', async () => {
    const s = setup(),
      pending = deferred<RealtimeConnection>();
    s.connector.mockReturnValue(pending.promise);
    const lease = s.subscribe();
    lease.unsubscribe();
    pending.resolve(s.connection);
    await settle();
    expect(s.connection.start).not.toHaveBeenCalled();
    expect(s.connection.stop).toHaveBeenCalled();
  });
  it('rejects a late dedicated token and suppresses late start/events after actor replacement', async () => {
    const s = setup(),
      pending = deferred<string>(),
      start = deferred<void>();
    s.transport.realtimeToken.mockReturnValue(pending.promise);
    vi.mocked(s.connection.start).mockReturnValue(start.promise);
    const lease = s.subscribe();
    await settle();
    const token = s.token(),
      assertion = expect(token).rejects.toThrow('lease ended');
    s.expire();
    pending.resolve('old-token');
    await assertion;
    start.resolve();
    await settle();
    s.emit('ReceiveEntityChanged', change);
    expect(s.events).toEqual([{ kind: 'status', status: 'connecting' }]);
    expect(s.connection.stop).toHaveBeenCalled();
    lease.unsubscribe();
  });
  it('never loads or starts for an already stale actor', async () => {
    const s = setup();
    s.expire();
    const lease = s.subscribe();
    await settle();
    expect(s.connector).not.toHaveBeenCalled();
    lease.unsubscribe();
  });
});
