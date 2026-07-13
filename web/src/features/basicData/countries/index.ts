// Export all country-related components and hooks

// Main page
export { default as CountriesPage } from './countriesPage';

// Components
export { default as CountriesMultiView } from './components/countriesMultiView';
export { default as CountryForm } from './components/countryForm';
export { default as CountryDeleteDialog } from './components/countryDeleteDialog';

// Services
export { default as CountryService } from './services/countryService';

// Hooks - TanStack Query
export { default as useCountryGridLogic } from './hooks/useCountryGridLogic';
export {
  useCountries,
  useCountry,
  useCountrySearch,
  useCreateCountry,
  useUpdateCountry,
  useDeleteCountry,
  useInvalidateCountries,
  countryKeys,
} from './hooks/useCountryQueries';

// Types — sourced from the correct location
export type {
  Country,
  SimpleState,
  CreateCountryRequest,
  UpdateCountryRequest,
  CountryFormData,
  CountryFormProps,
} from './types/Country';
