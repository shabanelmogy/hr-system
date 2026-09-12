import { apiService } from '@/src/core/api';
import { ApplicationStage, ApplicationStatus } from '../../domain/models/recruitment';
import { recruitmentEndpoints } from './recruitment-endpoints';
import { recruitmentRemoteDataSource } from './recruitment-remote-data-source';

jest.mock('@/src/core/api', () => ({
  apiService: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}));

describe('recruitment remote data source', () => {
  beforeEach(() => jest.clearAllMocks());

  it('forwards hire idempotency data unchanged to the authoritative server endpoint', async () => {
    const post = apiService.post as jest.Mock;
    post.mockResolvedValue(undefined);
    const request = { employeeNumber: 'EMP-42', hireDate: '2026-09-10', idempotencyKey: 'hire-42-stable-key' };

    await recruitmentRemoteDataSource.hireCandidate(42, request);

    expect(post).toHaveBeenCalledWith(recruitmentEndpoints.applications.hire(42), request);
  });

  it('preserves the existing move-stage wire mapping', async () => {
    const post = apiService.post as jest.Mock;
    post.mockResolvedValue({ id: 3 });

    await recruitmentRemoteDataSource.changeStage(3, { stage: ApplicationStage.Interview, notes: 'ready' });

    expect(post).toHaveBeenCalledWith(recruitmentEndpoints.applications.moveStage(3), {
      targetStatus: ApplicationStage.Interview,
      reason: 'ready',
    });
    await recruitmentRemoteDataSource.changeStage(3, { targetStatus: ApplicationStatus.Rejected, reason: 'not fit' });
    expect(post).toHaveBeenLastCalledWith(recruitmentEndpoints.applications.moveStage(3), {
      targetStatus: ApplicationStatus.Rejected,
      reason: 'not fit',
    });
  });
});
