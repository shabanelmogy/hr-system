import type { WorkforceTraceRepository } from '../../domain/repositories/workforce-trace-repository';
import { workforceTraceRemoteDataSource } from '../remote/workforce-trace-remote-data-source';
export class DefaultWorkforceTraceRepository implements WorkforceTraceRepository {
  constructor(private readonly remote = workforceTraceRemoteDataSource) {}
  byApplication: WorkforceTraceRepository['byApplication'] = (id) => this.remote.byApplication(id);
  byOffer: WorkforceTraceRepository['byOffer'] = (id) => this.remote.byOffer(id);
  byEmployee: WorkforceTraceRepository['byEmployee'] = (id) => this.remote.byEmployee(id);
  commitment: WorkforceTraceRepository['commitment'] = (query) => this.remote.commitment(query);
}
