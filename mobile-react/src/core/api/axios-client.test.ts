import {
  beginAxiosAuthenticationTransition,
  getAxiosRequestContextSignal,
  hasNewerStoredAccessToken,
  isAxiosAuthenticationTransitionActive,
  resolveAxiosRequestContextSignal,
  rotateAxiosRequestContext,
} from './axios-client';

describe('Axios authentication transitions', () => {
  it('keeps a nested transition active until every caller completes', () => {
    const endFirst = beginAxiosAuthenticationTransition();
    const endSecond = beginAxiosAuthenticationTransition();

    expect(isAxiosAuthenticationTransitionActive()).toBe(true);
    endFirst();
    expect(isAxiosAuthenticationTransitionActive()).toBe(true);
    endSecond();
    expect(isAxiosAuthenticationTransitionActive()).toBe(false);
  });

  it('recognizes a failed request that used an older access token', () => {
    expect(hasNewerStoredAccessToken('old-token', 'new-token')).toBe(true);
    expect(hasNewerStoredAccessToken('new-token', 'new-token')).toBe(false);
    expect(hasNewerStoredAccessToken(null, 'new-token')).toBe(false);
  });

  it('aborts the previous request context when authentication context rotates', () => {
    const previous = getAxiosRequestContextSignal();

    rotateAxiosRequestContext();

    expect(previous.aborted).toBe(true);
    expect(getAxiosRequestContextSignal()).not.toBe(previous);
    expect(getAxiosRequestContextSignal().aborted).toBe(false);
  });

  it('refuses to attach an operation captured by an older authentication context', () => {
    const captured = getAxiosRequestContextSignal();

    expect(resolveAxiosRequestContextSignal(captured)).toBe(captured);
    rotateAxiosRequestContext();

    expect(() => resolveAxiosRequestContextSignal(captured))
      .toThrow('authenticated request context changed');
    expect(resolveAxiosRequestContextSignal()).toBe(getAxiosRequestContextSignal());
  });
});
