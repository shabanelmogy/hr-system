import type { AccountHierarchyLevelRequest, AccountRequest } from '../models/coa-hierarchy';

export function normalizeAccountRequest(request: AccountRequest): AccountRequest {
  return {
    ...request,
    code: request.code.trim().toUpperCase(),
    nameAr: request.nameAr.trim(),
    nameEn: request.nameEn.trim(),
    parentAccountId: request.parentAccountId && request.parentAccountId > 0 ? request.parentAccountId : null,
    specificCurrencyId: request.currencyPolicy === 3 ? request.specificCurrencyId : null,
  };
}

export function normalizeHierarchyLevelRequest(request: AccountHierarchyLevelRequest): AccountHierarchyLevelRequest {
  return {
    ...request,
    nameAr: request.nameAr.trim(),
    nameEn: request.nameEn.trim(),
  };
}
