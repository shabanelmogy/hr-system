import type { OperationsRepository } from '../../domain/repositories/operations-repository';
import { operationsRemoteDataSource } from '../remote/operations-remote-data-source';

export class DefaultOperationsRepository implements OperationsRepository {
  constructor(private readonly remote: OperationsRepository = operationsRemoteDataSource) {}

  getHealthCheck = () => this.remote.getHealthCheck();
  getBackgroundJobs = () => this.remote.getBackgroundJobs();
  getSwaggerUrl = () => this.remote.getSwaggerUrl();
  getHangfireUrl = () => this.remote.getHangfireUrl();
}
