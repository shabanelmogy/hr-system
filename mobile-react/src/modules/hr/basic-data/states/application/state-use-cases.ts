import type {
  BulkArchiveStatesResponse,
  BulkCreateStatesResponse,
  StateDetail,
  StateLookup,
  StatePage,
  StatePageQuery,
  StateRequest,
  StateWithDistricts,
} from '../domain/models/state';
import { normalizeStateRequest, normalizeStateRequests } from '../domain/policies/state-request-policy';
import type { StateRepository } from '../domain/repositories/state-repository';

export interface SaveStateInput {
  id: number | null;
  request: StateRequest;
}

export interface StateUseCases {
  getPage(query: StatePageQuery): Promise<StatePage>;
  getLookup(countryId?: number): Promise<StateLookup[]>;
  getByCountry(countryId: number): Promise<StateLookup[]>;
  getById(id: number): Promise<StateDetail>;
  getWithDistricts(id: number): Promise<StateWithDistricts>;
  create(request: StateRequest): Promise<StateDetail>;
  update(id: number, request: StateRequest): Promise<StateDetail>;
  save(input: SaveStateInput): Promise<StateDetail>;
  archive(id: number): Promise<void>;
  restore(id: number): Promise<void>;
  bulkArchive(ids: readonly number[]): Promise<BulkArchiveStatesResponse>;
  bulkCreate(requests: readonly StateRequest[]): Promise<BulkCreateStatesResponse>;
}

export function createStateUseCases(repository: StateRepository): StateUseCases {
  const create = (request: StateRequest) => repository.create(normalizeStateRequest(request));
  const update = (id: number, request: StateRequest) => repository.update(id, normalizeStateRequest(request));

  return {
    getPage: (query) => repository.getPage(query),
    getLookup: (countryId) => repository.getLookup(countryId),
    getByCountry: (countryId) => repository.getByCountry(countryId),
    getById: (id) => repository.getById(id),
    getWithDistricts: (id) => repository.getWithDistricts(id),
    create,
    update,
    save: ({ id, request }) => id === null ? create(request) : update(id, request),
    archive: (id) => repository.archive(id),
    restore: (id) => repository.restore(id),
    bulkArchive: (ids) => repository.bulkArchive(ids),
    bulkCreate: (requests) => repository.bulkCreate(normalizeStateRequests(requests)),
  };
}
