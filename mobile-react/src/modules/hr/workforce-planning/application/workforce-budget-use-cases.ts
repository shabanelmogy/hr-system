import type { WorkforceBudgetRepository } from '../domain/repositories/workforce-budget-repository';
export type WorkforceBudgetUseCases = WorkforceBudgetRepository;
export const createWorkforceBudgetUseCases = (repository: WorkforceBudgetRepository): WorkforceBudgetUseCases => ({
  getPage: (query) => repository.getPage(query), getById: (id) => repository.getById(id), getSourcePlans: (query) => repository.getSourcePlans(query),
  getSourcePlanById: (id) => repository.getSourcePlanById(id), create: (request) => repository.create(request), update: (id, request) => repository.update(id, request),
  submit: (action) => repository.submit(action), approve: (action) => repository.approve(action), reject: (action) => repository.reject(action),
});
