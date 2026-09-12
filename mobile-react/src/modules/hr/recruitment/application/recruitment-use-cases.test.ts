import type { RecruitmentRepository } from '../domain/repositories/recruitment-repository';
import { createRecruitmentUseCases } from './recruitment-use-cases';

describe('recruitment application use cases', () => {
  it('preserves the caller-provided hire idempotency key without generating replay semantics', async () => {
    const repository = { hireCandidate: jest.fn().mockResolvedValue(undefined) } as unknown as jest.Mocked<RecruitmentRepository>;
    const useCases = createRecruitmentUseCases(repository);
    const request = { employeeNumber: 'EMP-7', hireDate: '2026-09-10', idempotencyKey: 'hire-7-attempt-1' };

    await useCases.hireCandidate(7, request);

    expect(repository.hireCandidate).toHaveBeenCalledWith(7, request);
  });

  it('delegates settings reads and writes through the repository boundary', async () => {
    const settings = { stages: [], rejectionReasons: [], sources: [], evaluationCriteria: [], general: { defaultCurrency: 'EGP', offerExpiryDays: 7, autoPublishOpening: true, enforceHeadcountCapacity: true, defaultProbationMonths: 3, enablePublicPortal: true } };
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
