import { apiService } from '@/src/core/api';
import { sendClientErrorLog } from './client-error-log-remote';

jest.mock('@/src/core/api', () => ({ apiService: { post: jest.fn() } }));

it('sends authenticated metadata with recursion-safe refresh and read-only settings', async () => {
  const report = { source: 'mobile', kind: 'boundary', errorType: 'TypeError', eventId: 'bc634880-a80c-4897-8d97-e652408947e6' } as const;
  jest.mocked(apiService.post).mockResolvedValue(undefined);
  await sendClientErrorLog(report);
  expect(apiService.post).toHaveBeenCalledWith('/api/v1/error-logs/client', report, {
    allowWhenReadOnly: true, skipAuthRefresh: true,
  });
});
