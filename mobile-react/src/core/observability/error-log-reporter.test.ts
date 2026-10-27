import { configureErrorLogReporter, installErrorLogRuntimeHooks, reportErrorLog } from './error-log-reporter';

jest.mock('expo-crypto', () => ({ randomUUID: () => 'bc634880-a80c-4897-8d97-e652408947e6' }));

describe('metadata-only mobile error capture', () => {
  let dispose: () => void;
  const send = jest.fn<Promise<unknown>, [unknown]>();
  beforeEach(() => { send.mockReset().mockResolvedValue(undefined); dispose = configureErrorLogReporter(send); });
  afterEach(() => { dispose(); jest.restoreAllMocks(); });

  it('sends only the allowlisted classification and id, once per error object', () => {
    const failure = new TypeError('password=secret; /private/path');
    reportErrorLog('boundary', failure);
    reportErrorLog('runtime', failure);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith({ source: 'mobile', kind: 'boundary', errorType: 'TypeError', eventId: 'bc634880-a80c-4897-8d97-e652408947e6' });
    expect(JSON.stringify(send.mock.calls)).not.toMatch(/secret|private|stack|message/);
  });

  it('avoids duplicating server HTTP errors and the already captured network wrapper', () => {
    reportErrorLog('boundary', { status: 400 });
    reportErrorLog('boundary', { name: 'ApiError', status: 0 });
    reportErrorLog('network', new Error('private URL'));
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0]).toEqual(expect.objectContaining({ errorType: 'NetworkError' }));
  });

  it('limits a burst and deduplicates non-Error rejections without retaining their values', () => {
    for (let index = 0; index < 30; index++) reportErrorLog('runtime', new Error(`sensitive-${index}`));
    expect(send).toHaveBeenCalledTimes(20);
    dispose(); dispose = configureErrorLogReporter(send); send.mockClear();
    reportErrorLog('rejection', 'sensitive-a'); reportErrorLog('rejection', 'sensitive-b');
    expect(send).toHaveBeenCalledTimes(1);
  });

  it('keeps a newer authenticated registration when an older scope disposes', () => {
    const newer = jest.fn().mockResolvedValue(undefined);
    const disposeNewer = configureErrorLogReporter(newer);
    dispose(); reportErrorLog('runtime', new Error());
    expect(newer).toHaveBeenCalledTimes(1);
    expect(send).not.toHaveBeenCalled();
    disposeNewer(); reportErrorLog('runtime', new Error());
    expect(newer).toHaveBeenCalledTimes(1);
  });

  it('never throws when transport rejects or throws synchronously', async () => {
    send.mockRejectedValue(new Error('unavailable'));
    expect(() => reportErrorLog('runtime', new Error())).not.toThrow();
    await Promise.resolve();
    dispose(); dispose = configureErrorLogReporter(() => { throw new Error('unavailable'); });
    expect(() => reportErrorLog('runtime', new Error())).not.toThrow();
  });

  it('chains and restores the runtime handler while preserving a subsequently installed handler', () => {
    const previous = jest.fn();
    let current = previous;
    const tools = { getGlobalHandler: () => current, setGlobalHandler: (handler: typeof previous) => { current = handler; } };
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'ErrorUtils');
    Object.defineProperty(globalThis, 'ErrorUtils', { configurable: true, value: tools });
    try {
      const cleanup = installErrorLogRuntimeHooks();
      const failure = new Error('private');
      current(failure, true);
      expect(previous).toHaveBeenCalledWith(failure, true);
      expect(send).toHaveBeenCalledTimes(1);
      cleanup(); expect(current).toBe(previous);
      const cleanupSecond = installErrorLogRuntimeHooks();
      const later = jest.fn(); tools.setGlobalHandler(later);
      cleanupSecond(); expect(current).toBe(later);
    } finally {
      if (descriptor) Object.defineProperty(globalThis, 'ErrorUtils', descriptor);
      else Reflect.deleteProperty(globalThis, 'ErrorUtils');
    }
  });
});
