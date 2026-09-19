import type {
  BulkArchiveStatesResponse,
  BulkCreateStatesResponse,
  StateDetail,
  StateLookup,
  StatePage,
  StatePageQuery,
  StateRequest,
  StateWithDistricts,
} from '../models/state';

export interface StateRepository {
  getPage(query: StatePageQuery): Promise<StatePage>;
  getLookup(countryId?: number): Promise<StateLookup[]>;
  getByCountry(countryId: number): Promise<StateLookup[]>;
  getById(id: number): Promise<StateDetail>;
  getWithDistricts(id: number): Promise<StateWithDistricts>;
  create(request: StateRequest): Promise<StateDetail>;
  update(id: number, request: StateRequest): Promise<StateDetail>;
  archive(id: number): Promise<void>;
  restore(id: number): Promise<void>;
  bulkArchive(ids: readonly number[]): Promise<BulkArchiveStatesResponse>;
  bulkCreate(requests: readonly StateRequest[]): Promise<BulkCreateStatesResponse>;
}
