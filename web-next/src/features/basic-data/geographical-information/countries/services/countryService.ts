import { apiRoutes } from "@/config";
import apiService from "@/shared/services/apiService";
import type {
  CountryDetail,
  CountryLookup,
  CountryPageQuery,
  CountryPageResponse,
  BulkArchiveCountriesRequest,
  BulkArchiveCountriesResponse,
  CreateCountryRequest,
  UpdateCountryMutation,
} from "../types/Country";

const normalizeOptionalCode = (value: string | null | undefined): string | null => {
  const normalized = value?.trim().toUpperCase();
  return normalized || null;
};

const normalizeOptionalValue = (value: string | null | undefined): string | null =>
  value?.trim() || null;

export const toCountryRequest = (country: CreateCountryRequest): CreateCountryRequest => ({
  nameAr: country.nameAr.trim(),
  nameEn: country.nameEn.trim(),
  alpha2Code: normalizeOptionalCode(country.alpha2Code),
  alpha3Code: normalizeOptionalCode(country.alpha3Code),
  phoneCode: normalizeOptionalValue(country.phoneCode),
  currencyCode: normalizeOptionalCode(country.currencyCode),
});

export class CountryService {
  static getPage(query: CountryPageQuery): Promise<CountryPageResponse> {
    return apiService.get<CountryPageResponse>(apiRoutes.countries.page, { ...query });
  }

  static getLookup(): Promise<CountryLookup[]> {
    return apiService.get<CountryLookup[]>(apiRoutes.countries.lookup);
  }

  static getById(id: number): Promise<CountryDetail> {
    return apiService.get<CountryDetail>(apiRoutes.countries.getById(id));
  }

  static create(country: CreateCountryRequest): Promise<CountryDetail> {
    return apiService.post<CountryDetail>(apiRoutes.countries.create, toCountryRequest(country));
  }

  static update({ id, request }: UpdateCountryMutation): Promise<CountryDetail> {
    return apiService.put<CountryDetail>(apiRoutes.countries.update(id), toCountryRequest(request));
  }

  static async archive(id: number): Promise<number> {
    await apiService.delete(apiRoutes.countries.archive(id));
    return id;
  }

  static async restore(id: number): Promise<number> {
    await apiService.post(apiRoutes.countries.restore(id));
    return id;
  }

  static createBulk(countries: CreateCountryRequest[]): Promise<{ createdCount: number }> {
    return apiService.post(apiRoutes.countries.bulkCreate, {
      countries: countries.map(toCountryRequest),
    });
  }

  static archiveBulk(ids: number[]): Promise<BulkArchiveCountriesResponse> {
    const request: BulkArchiveCountriesRequest = { ids };
    return apiService.post(apiRoutes.countries.bulkArchive, request);
  }
}

export default CountryService;
