// Export all country-related components and hooks

// Main page
export { default as CountriesPage } from './pages/CountriesPage';

// Components
export { default as CountriesMultiView } from './components/CountriesMultiView';
export { default as CountryForm } from './components/CountryForm';
export { default as CountryArchiveDialog } from './components/CountryArchiveDialog';

// Services
export { default as CountryService } from './services/countryService';

// Hooks - TanStack Query
export { default as useCountryGridLogic } from './hooks/useCountryGridLogic';
export {
  useCountryPage,
  useCountryLookup,
  useCountry,
  useCreateCountry,
  useUpdateCountry,
  useArchiveCountry,
  useRestoreCountry,
  useInvalidateCountries,
  countryKeys,
} from './hooks/useCountryQueries';

// Types — sourced from the correct location
export type {
  CountryListItem,
  CountryDetail,
  CountryWithStates,
  CountryLookup,
  CountryPageQuery,
  CountryPageResponse,
  CountrySortColumn,
  CountryStatus,
  CountryListFilters,
  SimpleState,
  CreateCountryRequest,
  UpdateCountryMutation,
  CountryFormData,
  CountryFormProps,
} from './types/Country';
