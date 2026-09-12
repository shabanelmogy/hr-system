import type { WorkforcePlanRepository } from '../domain/repositories/workforce-plan-repository';
import type { StaffingRequestRepository } from '../domain/repositories/staffing-request-repository';
import { createStaffingRequestUseCases } from './staffing-request-use-cases';
import { createWorkforcePlanUseCases } from './workforce-plan-use-cases';

describe('workforce planning application use cases', () => {
  it('delegates workforce plan lifecycle actions through the domain port', async () => {
    const repository = { submit: jest.fn().mockResolvedValue({ id: 7 }) } as unknown as WorkforcePlanRepository;
    const useCases = createWorkforcePlanUseCases(repository);
    const action = { id: 7, rowVersion: 'AQ==' };
    await useCases.submit(action);
    expect(repository.submit).toHaveBeenCalledWith(action);
  });

  it('delegates staffing close actions through the staffing port', async () => {
    const repository = { close: jest.fn().mockResolvedValue({ id: 8 }) } as unknown as StaffingRequestRepository;
    const useCases = createStaffingRequestUseCases(repository);
    const action = { id: 8, rowVersion: 'AQ==', closeReason: 1 as const };
    await useCases.close(action);
    expect(repository.close).toHaveBeenCalledWith(action);
  });
});
