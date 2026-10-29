import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { SessionContextEvents } from './session-context-events';

describe('Session context invalidation hints', () => {
  class Channel extends EventTarget {
    static instance: Channel;
    readonly postMessage = vi.fn();
    readonly close = vi.fn();
    constructor(readonly name: string) { super(); Channel.instance = this; }
  }
  function setup(supported = true) {
    const view = Object.assign(new EventTarget(), { BroadcastChannel: supported ? Channel : undefined });
    const document = Object.assign(new EventTarget(), { defaultView: view, visibilityState: 'visible' });
    TestBed.configureTestingModule({ providers: [{ provide: DOCUMENT, useValue: document }] });
    return { service: TestBed.inject(SessionContextEvents), document, view };
  }

  it('broadcasts only an invalidation and refuses identity-bearing or malformed messages', () => {
    const { service } = setup(); const listener = vi.fn(); service.subscribe(listener); service.publish();
    expect(Channel.instance.name).toBe('erp-browser-session-context');
    expect(Channel.instance.postMessage).toHaveBeenCalledExactlyOnceWith({ kind: 'session-changed' });
    for (const data of [null, 'session-changed', {}, { kind: 'other' }, { kind: 'session-changed', companyId: 9 }]) {
      Channel.instance.dispatchEvent(new MessageEvent('message', { data }));
    }
    expect(listener).not.toHaveBeenCalled();
    Channel.instance.dispatchEvent(new MessageEvent('message', { data: { kind: 'session-changed' } }));
    expect(listener).toHaveBeenCalledExactlyOnceWith('external');
  });

  it('supports visible/focus fallback and removes listeners and channel on destruction', () => {
    const { service, document, view } = setup(); const listener = vi.fn(); const unsubscribe = service.subscribe(listener);
    document.visibilityState = 'hidden'; view.dispatchEvent(new Event('focus')); expect(listener).not.toHaveBeenCalled();
    document.visibilityState = 'visible'; document.dispatchEvent(new Event('visibilitychange')); expect(listener).toHaveBeenCalledWith('visible');
    unsubscribe(); listener.mockClear(); view.dispatchEvent(new Event('focus')); expect(listener).not.toHaveBeenCalled();
    service.subscribe(listener); TestBed.resetTestingModule();
    view.dispatchEvent(new Event('focus')); document.dispatchEvent(new Event('visibilitychange'));
    Channel.instance.dispatchEvent(new MessageEvent('message', { data: { kind: 'session-changed' } }));
    expect(listener).not.toHaveBeenCalled(); expect(Channel.instance.close).toHaveBeenCalledOnce();
    service.publish(); expect(Channel.instance.postMessage).not.toHaveBeenCalled();
  });

  it('continues with focus revalidation if BroadcastChannel is unavailable', () => {
    const { service, view } = setup(false); const listener = vi.fn(); service.subscribe(listener);
    service.publish(); view.dispatchEvent(new Event('focus')); expect(listener).toHaveBeenCalledWith('visible');
  });
});
