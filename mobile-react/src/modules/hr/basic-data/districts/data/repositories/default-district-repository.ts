import type { DistrictRepository } from '../../domain/repositories/district-repository';
import type { DistrictRemoteDataSource } from '../remote/district-remote-data-source';

export class DefaultDistrictRepository implements DistrictRepository {
  constructor(
    private readonly remote: DistrictRemoteDataSource,
    private readonly isOnline: () => boolean = () => true,
  ) {}

  private requireOnline(): void {
    if (!this.isOnline()) throw new Error('Districts requires an internet connection.');
  }

  getPage(query: Parameters<DistrictRepository['getPage']>[0]) {
    this.requireOnline();
    return this.remote.getPage(query);
  }

  getLookup(stateId?: number) {
    this.requireOnline();
    return this.remote.getLookup(stateId);
  }

  getByState(stateId: number) {
    this.requireOnline();
    return this.remote.getByState(stateId);
  }

  getById(id: number) {
    this.requireOnline();
    return this.remote.getById(id);
  }

  getWithAddresses(id: number) {
    this.requireOnline();
    return this.remote.getWithAddresses(id);
  }

  create(request: Parameters<DistrictRepository['create']>[0]) {
    this.requireOnline();
    return this.remote.create(request);
  }

  update(id: number, request: Parameters<DistrictRepository['update']>[1]) {
    this.requireOnline();
    return this.remote.update(id, request);
  }

  async archive(id: number) {
    this.requireOnline();
    await this.remote.archive(id);
  }

  async restore(id: number) {
    this.requireOnline();
    await this.remote.restore(id);
  }

  bulkArchive(ids: readonly number[]) {
    this.requireOnline();
    return this.remote.bulkArchive(ids);
  }

  bulkCreate(requests: Parameters<DistrictRepository['bulkCreate']>[0]) {
    this.requireOnline();
    return this.remote.bulkCreate(requests);
  }
}
