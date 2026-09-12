import { DefaultEnvelopeAmendmentRepository } from './default-envelope-amendment-repository';
import { DefaultPositionEnvelopeRepository } from './default-position-envelope-repository';
import { DefaultStaffingRequestRepository } from './default-staffing-request-repository';
import { DefaultWorkforceBudgetRepository } from './default-workforce-budget-repository';
import { DefaultWorkforcePlanRepository } from './default-workforce-plan-repository';
import { DefaultWorkforceTraceRepository } from './default-workforce-trace-repository';
import type { staffingRemoteDataSource } from '../remote/staffing-remote-data-source';
import type { workforceBudgetRemoteDataSource } from '../remote/workforce-budget-remote-data-source';
import type { workforcePlanRemoteDataSource } from '../remote/workforce-plan-remote-data-source';
import type { workforceTraceRemoteDataSource } from '../remote/workforce-trace-remote-data-source';

describe('workforce planning repository boundaries', () => {
  it('keeps workforce plan writes on the remote source', async () => {
    const create = jest.fn().mockResolvedValue({ id: 7 });
    const remote = { create } as unknown as typeof workforcePlanRemoteDataSource;
    const repository = new DefaultWorkforcePlanRepository(remote);
    const request = { planCode: 'WP-2027', fiscalYearId: 1, titleEn: 'Plan', titleAr: 'خطة', lines: [] };
    await repository.create(request);
    expect(create).toHaveBeenCalledWith(request);
  });

  it('binds workforce-plan replay reads and writes to the captured request context', async () => {
    const getById = jest.fn().mockResolvedValue({ id: 7 });
    const update = jest.fn().mockResolvedValue({ id: 7 });
    const remote = { getById, update } as unknown as typeof workforcePlanRemoteDataSource;
    const requestContextSignal = new AbortController().signal;
    const repository = new DefaultWorkforcePlanRepository(remote, requestContextSignal);
    const request = { titleEn: 'Plan', titleAr: 'خطة', lines: [], rowVersion: 'AQ==' };

    await repository.getById(7);
    await repository.update(7, request);

    expect(getById).toHaveBeenCalledWith(7, requestContextSignal);
    expect(update).toHaveBeenCalledWith(7, request, requestContextSignal);
  });

  it('keeps budget and position-envelope responsibilities on separate repositories', async () => {
    const create = jest.fn().mockResolvedValue({ id: 3 });
    const getEnvelopeById = jest.fn().mockResolvedValue({ id: 9 });
    const remote = { create, getEnvelopeById } as unknown as typeof workforceBudgetRemoteDataSource;
    const budgetRepository = new DefaultWorkforceBudgetRepository(remote);
    const envelopeRepository = new DefaultPositionEnvelopeRepository(remote);
    const request = { budgetCode: 'WB-2027', workforcePlanId: 1, currencyCode: 'EGP', lines: [] };
    await budgetRepository.create(request);
    await envelopeRepository.getById(9);
    expect(create).toHaveBeenCalledWith(request);
    expect(getEnvelopeById).toHaveBeenCalledWith(9);
  });

  it('keeps staffing-request and envelope-amendment writes on distinct ports', async () => {
    const createRequest = jest.fn().mockResolvedValue({ id: 4 });
    const createAmendment = jest.fn().mockResolvedValue({ id: 5 });
    const remote = { createRequest, createAmendment } as unknown as typeof staffingRemoteDataSource;
    const requestRepository = new DefaultStaffingRequestRepository(remote);
    const amendmentRepository = new DefaultEnvelopeAmendmentRepository(remote);
    const request = { envelopeId: 1, requestedHeadcount: 2, estimatedAnnualSalaryPerSlot: 10, targetStartDate: '2026-10-01', requestType: 1 as const, priority: 1 as const, justification: 'Need capacity' };
    const amendment = { envelopeId: 1, additionalHeadcount: 1, additionalSalaryCost: 10, justification: 'Expansion' };
    await requestRepository.create(request);
    await amendmentRepository.create(amendment);
    expect(createRequest).toHaveBeenCalledWith(request);
    expect(createAmendment).toHaveBeenCalledWith(amendment);
  });

  it('keeps trace as a read-only repository boundary', async () => {
    const byEmployee = jest.fn().mockResolvedValue({ nodes: [], edges: [] });
    const remote = { byEmployee } as unknown as typeof workforceTraceRemoteDataSource;
    const repository = new DefaultWorkforceTraceRepository(remote);
    await repository.byEmployee(12);
    expect(byEmployee).toHaveBeenCalledWith(12);
  });
});
