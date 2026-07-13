// Export all country-related components and hooks

// Main page
export { default as CountriesPage } from './pages/CountriesPage';

// Components
export { default as CountriesMultiView } from './components/CountriesMultiView';
export { default as CountryForm } from './components/CountryForm';
export { default as CountryDeleteDialog } from './components/CountryDeleteDialog';

// Services
export { default as CountryService } from './services/countryService';

// Hooks - TanStack Query
export { default as useCountryGridLogic } from './hooks/useCountryGridLogic';
export {
  useCountries,
  useCountry,
  useCreateCountry,
  useUpdateCountry,
  useDeleteCountry,
  useInvalidateCountries,
  filterCountries,
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
