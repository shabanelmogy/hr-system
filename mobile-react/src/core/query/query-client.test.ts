import { queryClient } from './query-client';

describe('query client mutation policy', () => {
  it('never pauses ordinary writes for implicit replay after reconnect', () => {
    expect(queryClient.getDefaultOptions().mutations).toMatchObject({
      retry: false,
      networkMode: 'always',
    });
  });
});
