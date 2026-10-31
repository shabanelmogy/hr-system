export { countryColumnFilterDefinitions,parseCountryFilters } from '../types/country-filters';
import { parseCountryFilters } from '../types/country-filters';
import type { CountryQuery } from '../types/country';
export const countryColumnFilters=(query:CountryQuery)=>query.filters??[];
export function countryColumnFilterPatch(value:unknown):Pick<CountryQuery,'filters'>|null{try{return {filters:parseCountryFilters(value)};}catch{return null;}}
