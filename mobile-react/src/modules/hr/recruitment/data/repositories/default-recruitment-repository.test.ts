import type { RecruitmentRemoteDataSource } from '../remote/recruitment-remote-data-source';
import { DefaultRecruitmentRepository } from './default-recruitment-repository';

describe('DefaultRecruitmentRepository', () => {
  it('delegates writes directly to the remote authority with no local/outbox layer', async () => {
    const remote = {
      approveOffer: jest.fn().mockResolvedValue({ id: 11 }),
      hireCandidate: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<RecruitmentRemoteDataSource>;
    const repository = new DefaultRecruitmentRepository(remote);
    const hire = { idempotencyKey: 'hire-11-once' };

    await repository.approveOffer(11);
    await repository.hireCandidate(11, hire);

    expect(remote.approveOffer).toHaveBeenCalledWith(11);
    expect(remote.hireCandidate).toHaveBeenCalledWith(11, hire);
  });
});
