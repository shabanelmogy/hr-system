import type { AddressTypeRequest } from '../models/address-type';

export function normalizeAddressTypeRequest(request: AddressTypeRequest): AddressTypeRequest {
  return {
    nameAr: request.nameAr.trim(),
    nameEn: request.nameEn.trim(),
  };
}

export function normalizeAddressTypeRequests(requests: readonly AddressTypeRequest[]): AddressTypeRequest[] {
  return requests.map(normalizeAddressTypeRequest);
}
