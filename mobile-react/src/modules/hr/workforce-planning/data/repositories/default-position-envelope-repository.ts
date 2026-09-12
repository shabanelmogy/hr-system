import type { PositionEnvelopeRepository } from '../../domain/repositories/position-envelope-repository';
import { workforceBudgetRemoteDataSource } from '../remote/workforce-budget-remote-data-source';
export class DefaultPositionEnvelopeRepository implements PositionEnvelopeRepository {
  constructor(private readonly remote = workforceBudgetRemoteDataSource) {}
  getPage: PositionEnvelopeRepository['getPage'] = (query) => this.remote.getEnvelopePage(query);
  getById: PositionEnvelopeRepository['getById'] = (id) => this.remote.getEnvelopeById(id);
}
