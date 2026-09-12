import type { WorkforcePlanRepository } from '../domain/repositories/workforce-plan-repository';

export type WorkforcePlanUseCases = WorkforcePlanRepository;

export function createWorkforcePlanUseCases(repository: WorkforcePlanRepository): WorkforcePlanUseCases {
  return {
    getPage: (query) => repository.getPage(query),
    getById: (id) => repository.getById(id),
    getRevisions: (id) => repository.getRevisions(id),
    create: (request) => repository.create(request),
    update: (id, request) => repository.update(id, request),
    archive: (action) => repository.archive(action),
    restore: (action) => repository.restore(action),
    submit: (action) => repository.submit(action),
    beginReview: (action) => repository.beginReview(action),
    approve: (action) => repository.approve(action),
    reject: (action) => repository.reject(action),
    createRevision: (action) => repository.createRevision(action),
  };
}
