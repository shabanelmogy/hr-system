import {
  beginAxiosAuthenticationTransition,
  hasNewerStoredAccessToken,
  isAxiosAuthenticationTransitionActive,
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
});
