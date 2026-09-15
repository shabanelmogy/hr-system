import { createOfflinePolicyRequestGuard } from './offline-policy-request-guard';

describe('offline policy request scope guard', () => {
  it('rejects an old-scope completion after the active scope changes', () => {
    const guard = createOfflinePolicyRequestGuard();
    const generationA = guard.selectScope('user:tenant-a:1');

    expect(guard.isCurrent('user:tenant-a:1', generationA)).toBe(true);

    const generationB = guard.selectScope('user:tenant-b:2');

    expect(guard.isCurrent('user:tenant-a:1', generationA)).toBe(false);
    expect(guard.capture('user:tenant-a:1')).toBeNull();
    expect(guard.capture('user:tenant-b:2')).toBe(generationB);
    expect(guard.isCurrent('user:tenant-b:2', generationB)).toBe(true);
  });
});
