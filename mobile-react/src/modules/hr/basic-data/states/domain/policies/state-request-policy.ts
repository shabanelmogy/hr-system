import type { StateRequest } from '../models/state';

export function normalizeStateRequest(request: StateRequest): StateRequest {
  return {
    nameAr: request.nameAr.trim(),
    nameEn: request.nameEn.trim(),
    code: request.code.trim().toUpperCase(),
    countryId: Number(request.countryId),
  };
}

export function normalizeStateRequests(requests: readonly StateRequest[]): StateRequest[] {
  return requests.map(normalizeStateRequest);
}
