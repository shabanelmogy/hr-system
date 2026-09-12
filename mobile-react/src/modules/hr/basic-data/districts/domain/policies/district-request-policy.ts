import type { DistrictRequest } from '../models/district';

export function normalizeDistrictRequest(request: DistrictRequest): DistrictRequest {
  return {
    nameAr: request.nameAr.trim(),
    nameEn: request.nameEn.trim(),
    code: request.code.trim().toUpperCase(),
    stateId: Number(request.stateId),
  };
}

export function normalizeDistrictRequests(requests: readonly DistrictRequest[]): DistrictRequest[] {
  return requests.map(normalizeDistrictRequest);
}
