import type {
  AddressTypeDetail,
  AddressTypePage,
  AddressTypePageQuery,
} from '../../domain/models/address-type';
import type { AddressTypeRepository } from '../../domain/repositories/address-type-repository';
import type { AddressTypeRemoteDataSource } from '../remote/address-type-remote-data-source';

export class DefaultAddressTypeRepository implements AddressTypeRepository {
  constructor(
    private readonly remote: AddressTypeRemoteDataSource,
    private readonly isOnline: () => boolean = () => true,
  ) {}

  private requireOnline(): void {
    if (!this.isOnline()) {
      throw new Error('This Address Types action requires an internet connection.');
    }
  }

  getPage(query: AddressTypePageQuery): Promise<AddressTypePage> {
    return this.remote.getPage(query);
  }

  getById(id: number): Promise<AddressTypeDetail> {
    return this.remote.getById(id);
  }

  async create(request: Parameters<AddressTypeRepository['create']>[0]) {
    this.requireOnline();
    return this.remote.create(request);
  }

  async update(id: number, request: Parameters<AddressTypeRepository['update']>[1]) {
    this.requireOnline();
    return this.remote.update(id, request);
  }

  async archive(id: number) {
    this.requireOnline();
    return this.remote.archive(id);
  }

  async restore(id: number) {
    this.requireOnline();
    return this.remote.restore(id);
  }

  async bulkArchive(ids: readonly number[]) {
    this.requireOnline();
    return this.remote.bulkArchive(ids);
  }

  async bulkCreate(requests: Parameters<AddressTypeRepository['bulkCreate']>[0]) {
    this.requireOnline();
    return this.remote.bulkCreate(requests);
  }
}
