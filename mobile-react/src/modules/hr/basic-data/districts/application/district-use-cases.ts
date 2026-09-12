import type {
  BulkArchiveDistrictsResponse,
  BulkCreateDistrictsResponse,
  DistrictDetail,
  DistrictLookup,
  DistrictPage,
  DistrictPageQuery,
  DistrictRequest,
  DistrictWithAddresses,
} from '../domain/models/district';
import {
  normalizeDistrictRequest,
  normalizeDistrictRequests,
} from '../domain/policies/district-request-policy';
import type { DistrictRepository } from '../domain/repositories/district-repository';

export interface SaveDistrictInput {
  id: number | null;
  request: DistrictRequest;
}

export interface DistrictUseCases {
  getPage(query: DistrictPageQuery): Promise<DistrictPage>;
  getLookup(stateId?: number): Promise<DistrictLookup[]>;
  getByState(stateId: number): Promise<DistrictLookup[]>;
  getById(id: number): Promise<DistrictDetail>;
  getWithAddresses(id: number): Promise<DistrictWithAddresses>;
  save(input: SaveDistrictInput): Promise<DistrictDetail>;
  archive(id: number): Promise<void>;
  restore(id: number): Promise<void>;
  bulkArchive(ids: readonly number[]): Promise<BulkArchiveDistrictsResponse>;
  bulkCreate(requests: readonly DistrictRequest[]): Promise<BulkCreateDistrictsResponse>;
}

export function createDistrictUseCases(repository: DistrictRepository): DistrictUseCases {
  return {
    getPage: (query) => repository.getPage(query),
    getLookup: (stateId) => repository.getLookup(stateId),
    getByState: (stateId) => repository.getByState(stateId),
    getById: (id) => repository.getById(id),
    getWithAddresses: (id) => repository.getWithAddresses(id),
    save: ({ id, request }) => id === null
      ? repository.create(normalizeDistrictRequest(request))
      : repository.update(id, normalizeDistrictRequest(request)),
    archive: (id) => repository.archive(id),
    restore: (id) => repository.restore(id),
    bulkArchive: (ids) => repository.bulkArchive(ids),
    bulkCreate: (requests) => repository.bulkCreate(normalizeDistrictRequests(requests)),
  };
}
