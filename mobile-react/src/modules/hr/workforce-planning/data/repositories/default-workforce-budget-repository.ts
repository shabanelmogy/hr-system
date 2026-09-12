import type { WorkforceBudgetRepository } from '../../domain/repositories/workforce-budget-repository';
import { workforceBudgetRemoteDataSource } from '../remote/workforce-budget-remote-data-source';
export class DefaultWorkforceBudgetRepository implements WorkforceBudgetRepository {
  constructor(private readonly remote = workforceBudgetRemoteDataSource) {}
  getPage: WorkforceBudgetRepository['getPage'] = (query) => this.remote.getPage(query);
  getById: WorkforceBudgetRepository['getById'] = (id) => this.remote.getById(id);
  getSourcePlans: WorkforceBudgetRepository['getSourcePlans'] = (query) => this.remote.getSourcePlans(query);
  getSourcePlanById: WorkforceBudgetRepository['getSourcePlanById'] = (id) => this.remote.getSourcePlanById(id);
  create: WorkforceBudgetRepository['create'] = (request) => this.remote.create(request);
  update: WorkforceBudgetRepository['update'] = (id, request) => this.remote.update(id, request);
  submit: WorkforceBudgetRepository['submit'] = (action) => this.remote.submit(action);
  approve: WorkforceBudgetRepository['approve'] = (action) => this.remote.approve(action);
  reject: WorkforceBudgetRepository['reject'] = (action) => this.remote.reject(action);
}
