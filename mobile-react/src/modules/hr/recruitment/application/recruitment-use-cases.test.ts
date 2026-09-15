import type { RecruitmentRepository } from '../domain/repositories/recruitment-repository';
import { createRecruitmentUseCases } from './recruitment-use-cases';

describe('recruitment application use cases', () => {
  it('routes the application ID through the interview page query contract', async () => {
    const page = { items: [{ id: 81, employmentApplicationId: 3 }], metaData: { pageNumber: 1 } };
    const repository = { getInterviews: jest.fn().mockResolvedValue(page) } as unknown as jest.Mocked<RecruitmentRepository>;
    const useCases = createRecruitmentUseCases(repository);
    const query = { pageNumber: 1, pageSize: 10, applicationId: 3 };

    await expect(useCases.getInterviews(query)).resolves.toBe(page);

    expect(repository.getInterviews).toHaveBeenCalledWith(query);
  });

  it('preserves the caller-provided hire idempotency key without generating replay semantics', async () => {
    const hiredApplication = { id: 7 };
    const repository = { hireCandidate: jest.fn().mockResolvedValue(hiredApplication) } as unknown as jest.Mocked<RecruitmentRepository>;
    const useCases = createRecruitmentUseCases(repository);
    const request = { employeeNumber: 'EMP-7', hireDate: '2026-09-10', idempotencyKey: 'hire-7-attempt-1' };

    await expect(useCases.hireCandidate(7, request)).resolves.toBe(hiredApplication);

    expect(repository.hireCandidate).toHaveBeenCalledWith(7, request);
  });

  it('delegates settings reads and writes through the repository boundary', async () => {
    const settings = { stages: [], rejectionReasons: [], sources: [], evaluationCriteria: [], general: { defaultCurrency: 'EGP', offerExpiryDays: 7, autoPublishOpening: true, enforceHeadcountCapacity: true, defaultProbationMonths: 3, enablePublicPortal: true, inboundEmailAlias: 'careers@company.com' } };
    const repository = {
      getSettings: jest.fn().mockResolvedValue(settings),
      updateSettings: jest.fn().mockResolvedValue(settings),
    } as unknown as jest.Mocked<RecruitmentRepository>;
    const useCases = createRecruitmentUseCases(repository);

    await expect(useCases.getSettings()).resolves.toBe(settings);
    await expect(useCases.updateSettings(settings)).resolves.toBe(settings);
    expect(repository.updateSettings).toHaveBeenCalledWith(settings);
  });
});
