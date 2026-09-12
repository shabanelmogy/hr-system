import type { WorkforcePlanRepository } from '../../domain/repositories/workforce-plan-repository';
import { workforcePlanRemoteDataSource } from '../remote/workforce-plan-remote-data-source';
export class DefaultWorkforcePlanRepository implements WorkforcePlanRepository {
  constructor(
    private readonly remote = workforcePlanRemoteDataSource,
    private readonly requestContextSignal?: AbortSignal,
  ) {}
  getPage: WorkforcePlanRepository['getPage'] = (query) => this.remote.getPage(query);
  getById: WorkforcePlanRepository['getById'] = (id) => this.remote.getById(id, this.requestContextSignal);
  getRevisions: WorkforcePlanRepository['getRevisions'] = (id) => this.remote.getRevisions(id);
  create: WorkforcePlanRepository['create'] = (request) => this.remote.create(request);
  update: WorkforcePlanRepository['update'] = (id, request) => this.remote.update(id, request, this.requestContextSignal);
  archive: WorkforcePlanRepository['archive'] = (action) => this.remote.archive(action);
  restore: WorkforcePlanRepository['restore'] = (action) => this.remote.restore(action);
  submit: WorkforcePlanRepository['submit'] = (action) => this.remote.submit(action);
  beginReview: WorkforcePlanRepository['beginReview'] = (action) => this.remote.beginReview(action);
  approve: WorkforcePlanRepository['approve'] = (action) => this.remote.approve(action);
  reject: WorkforcePlanRepository['reject'] = (action) => this.remote.reject(action);
  createRevision: WorkforcePlanRepository['createRevision'] = (action) => this.remote.createRevision(action);
}
