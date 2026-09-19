import type {
  BulkArchiveDistrictsResponse,
  BulkCreateDistrictsResponse,
  DistrictDetail,
  DistrictLookup,
  DistrictPage,
  DistrictPageQuery,
  DistrictRequest,
  DistrictWithAddresses,
} from '../models/district';

export interface DistrictRepository {
  getPage(query: DistrictPageQuery): Promise<DistrictPage>;
  getLookup(stateId?: number): Promise<DistrictLookup[]>;
  getByState(stateId: number): Promise<DistrictLookup[]>;
  getById(id: number): Promise<DistrictDetail>;
  getWithAddresses(id: number): Promise<DistrictWithAddresses>;
  create(request: DistrictRequest): Promise<DistrictDetail>;
  update(id: number, request: DistrictRequest): Promise<DistrictDetail>;
  archive(id: number): Promise<void>;
  restore(id: number): Promise<void>;
  bulkArchive(ids: readonly number[]): Promise<BulkArchiveDistrictsResponse>;
  bulkCreate(requests: readonly DistrictRequest[]): Promise<BulkCreateDistrictsResponse>;
}
