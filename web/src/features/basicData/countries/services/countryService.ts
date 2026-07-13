import { apiRoutes } from "@/routes";
import { apiService } from "@/shared/services";
import { extractValue, extractValues } from "@/shared/utils/ApiHelper";
import { Country, CreateCountryRequest, UpdateCountryRequest } from "../types/Country";

// Country Service
export class CountryService {
  static async getAll(): Promise<Country[]> {
    const response = await apiService.get(apiRoutes.countries.getAll);
    const countries = extractValues<Country>(response);
    return countries.filter((country) => !country.isDeleted);
  }

  static async getById(id: string | number): Promise<Country> {
    const response = await apiService.get(apiRoutes.countries.getById(id));
    return extractValue<Country>(response);
  }

  static async create(countryData: CreateCountryRequest): Promise<Country> {
    const response = await apiService.post(
      apiRoutes.countries.add,
      countryData
    );
    return extractValue<Country>(response);
  }

  static async update(countryData: UpdateCountryRequest): Promise<Country> {
    const response = await apiService.put(
      apiRoutes.countries.update,
      countryData
    );
    return extractValue<Country>(response);
  }

  static async delete(id: string | number): Promise<string | number> {
    await apiService.delete(apiRoutes.countries.delete(id));
    return id;
  }

  static searchCountries(countries: Country[], searchTerm: string): Country[] {
    if (!searchTerm.trim()) {
      return countries;
    }

    const term = searchTerm.toLowerCase().trim();
    return countries.filter((country) => {
      if (!country || country.isDeleted) return false;

      // Search in country fields
      const countryMatch = (
        country.nameEn?.toLowerCase().includes(term) ||
        country.nameAr?.includes(term) ||
        country.alpha2Code?.toLowerCase().includes(term) ||
        country.alpha3Code?.toLowerCase().includes(term) ||
        country.phoneCode?.toString().includes(term) ||
        country.currencyCode?.toLowerCase().includes(term)
      );

      // Search in states
      const statesMatch = country.states?.some(state => 
        !state.isDeleted && (
          state.nameEn?.toLowerCase().includes(term) ||
          state.nameAr?.includes(term) ||
          state.code?.toLowerCase().includes(term)
        )
      );

      return countryMatch || statesMatch;
    });
  }
}

export default CountryService;
