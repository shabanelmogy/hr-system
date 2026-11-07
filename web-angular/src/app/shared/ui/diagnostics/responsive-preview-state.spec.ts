import { TestBed } from '@angular/core/testing';
import { UnsavedChanges } from '../../data/navigation.public-api';
import { ResponsivePreviewState } from './responsive-preview-state';

describe('Development responsive preview isolation', () => {
  const originalUrl = window.location.href;
  let frame: HTMLIFrameElement;
  let child: Window;
  let state: ResponsivePreviewState;
  beforeEach(() => {
    window.history.replaceState(null, '', '?erp-responsive-host=phone');
    vi.spyOn(window, 'open').mockReturnValue(null);
    vi.spyOn(window, 'close').mockImplementation(() => undefined);
    state = TestBed.inject(ResponsivePreviewState);
    frame = document.createElement('iframe');
    document.body.append(frame);
    const content = frame.contentWindow;
    if (!content) throw new Error('Expected a child browsing context');
    child = content;
  });
  afterEach(() => {
    frame.remove();
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
    window.history.replaceState(null, '', originalUrl);
  });
  const message = (
    source: Window,
    type: string,
    extra: object = {},
    origin = window.location.origin,
  ) => {
    window.dispatchEvent(new MessageEvent('message', { source, origin, data: { type, ...extra } }));
  };
  it('accepts only configured sizes and creates a same-origin preview URL', () => {
    state.select('https://untrusted.invalid');
    expect(state.active()?.id).toBe('phone');
    state.select('phone');
    const target = state.target();
    if (!target) throw new Error('Expected a preview URL');
    expect(new URL(target).origin).toBe(window.location.origin);
    expect(new URL(target).searchParams.get('erp-viewport-preview')).toBe('1');
    expect(state.active()?.width).toBe(390);
  });
  it('resizes without changing the iframe URL or creating another preview', () => {
    state.select('phone');
    const target = state.target();
    state.select('boundary');
    expect(state.active()?.width).toBe(900);
    expect(state.target()).toBe(target);
  });
  it('ignores foreign origins, other windows and unknown preset IDs', () => {
    state.select('phone');
    state.attach(frame);
    message(child, 'erp.viewport.resize', { id: 'desktop' }, 'https://untrusted.invalid');
    message(window, 'erp.viewport.resize', { id: 'desktop' });
    message(child, 'erp.viewport.resize', { id: 'arbitrary-dimensions' });
    expect(state.active()?.id).toBe('phone');
    message(child, 'erp.viewport.resize', { id: 'desktop' });
    expect(state.active()?.id).toBe('desktop');
  });
  it('retains a loaded preview until the child approves closing its drafts', () => {
    state.select('phone');
    state.attach(frame);
    message(child, 'erp.viewport.ready');
    state.requestClose();
    expect(state.closing()).toBe(true);
    expect(state.active()).not.toBeNull();
    message(child, 'erp.viewport.close-result', { accepted: false });
    expect(state.closing()).toBe(false);
    state.requestClose();
    message(child, 'erp.viewport.close-result', { accepted: true });
    expect(window.close).toHaveBeenCalledOnce();
  });
  it('opens a separate tab without discarding the original draft or replacing its page', () => {
    TestBed.resetTestingModule();
    window.history.replaceState(null, '', '/');
    state = TestBed.inject(ResponsivePreviewState);
    const drafts = TestBed.inject(UnsavedChanges);
    drafts.register({
      read: () => ({ identity: 'draft', revision: 1, active: true, unsaved: true, pending: false }),
      invalidate: vi.fn(),
    });
    state.select('phone');
    expect(drafts.prompt()).toBeNull();
    expect(drafts.dirty()).toBe(true);
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('erp-responsive-host=phone'),
      '_blank',
      'noopener,noreferrer',
    );
    expect(state.active()).toBeNull();
  });
});
