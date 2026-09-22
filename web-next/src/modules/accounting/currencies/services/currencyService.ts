import { apiRoutes } from "@/config";
import apiService from "@/shared/services/apiService";
import type {
  Currency,
  CurrencyLookup,
  CurrencyMutationRequest,
  CurrencyPageQuery,
  CurrencyPageResponse,
} from "../types/Currency";

const normalize = (request: CurrencyMutationRequest): CurrencyMutationRequest => ({
  currencyCode: request.currencyCode.trim().toUpperCase(),
  nameEn: request.nameEn.trim(),
  nameAr: request.nameAr.trim(),
  symbol: request.symbol.trim(),
});

export const currencyService = {
  getPage(query: CurrencyPageQuery): Promise<CurrencyPageResponse> {
    return apiService.get(apiRoutes.currencies.page, { ...query });
  },
  getLookup(): Promise<CurrencyLookup[]> {
    return apiService.get(apiRoutes.currencies.lookup);
  },
  getById(id: number): Promise<Currency> {
    return apiService.get(apiRoutes.currencies.getById(id));
  },
  create(request: CurrencyMutationRequest): Promise<Currency> {
    return apiService.post(apiRoutes.currencies.create, normalize(request));
  },
  update({ id, request, rowVersion }: { id: number; request: CurrencyMutationRequest; rowVersion: string }): Promise<Currency> {
    return apiService.put(apiRoutes.currencies.update(id), { ...normalize(request), rowVersion });
  },
  async archive({ id, rowVersion }: { id: number; rowVersion: string }): Promise<number> {
    await apiService.delete(apiRoutes.currencies.archive(id), { rowVersion });
    return id;
  },
  restore({ id, rowVersion }: { id: number; rowVersion: string }): Promise<Currency> {
    return apiService.post(apiRoutes.currencies.restore(id), { rowVersion });
  },
};
