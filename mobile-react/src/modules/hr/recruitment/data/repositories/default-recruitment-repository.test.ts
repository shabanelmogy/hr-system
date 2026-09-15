import type { RecruitmentRemoteDataSource } from '../remote/recruitment-remote-data-source';
import { DefaultRecruitmentRepository } from './default-recruitment-repository';

describe('DefaultRecruitmentRepository', () => {
  it('delegates interview page filters without confusing application and interview identifiers', async () => {
    const page = { items: [{ id: 81, employmentApplicationId: 3 }], metaData: { pageNumber: 1 } };
    const remote = {
      getInterviews: jest.fn().mockResolvedValue(page),
    } as unknown as jest.Mocked<RecruitmentRemoteDataSource>;
    const repository = new DefaultRecruitmentRepository(remote);
    const query = { pageNumber: 1, pageSize: 10, applicationId: 3 };

    await expect(repository.getInterviews(query)).resolves.toBe(page);

    expect(remote.getInterviews).toHaveBeenCalledWith(query);
  });

  it('delegates writes directly to the remote authority with no local/outbox layer', async () => {
    const hiredApplication = { id: 11 };
    const remote = {
      approveOffer: jest.fn().mockResolvedValue({ id: 11 }),
      hireCandidate: jest.fn().mockResolvedValue(hiredApplication),
    } as unknown as jest.Mocked<RecruitmentRemoteDataSource>;
    const repository = new DefaultRecruitmentRepository(remote);
    const hire = { employeeNumber: 'EMP-11', hireDate: '2026-09-10', idempotencyKey: 'hire-11-once' };

    await repository.approveOffer(11);
    await expect(repository.hireCandidate(11, hire)).resolves.toBe(hiredApplication);

    expect(remote.approveOffer).toHaveBeenCalledWith(11);
    expect(remote.hireCandidate).toHaveBeenCalledWith(11, hire);
  });
});
