import type { StaffingRequestRepository } from '../domain/repositories/staffing-request-repository';
export type StaffingRequestUseCases = StaffingRequestRepository;
export const createStaffingRequestUseCases = (repository: StaffingRequestRepository): StaffingRequestUseCases => ({
  getPage: (query) => repository.getPage(query), getById: (id) => repository.getById(id), create: (request) => repository.create(request),
  submit: (action) => repository.submit(action), approve: (action) => repository.approve(action), reject: (action) => repository.reject(action), close: (action) => repository.close(action),
});
