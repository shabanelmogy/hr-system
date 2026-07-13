// Export all district-related components and hooks

// Main page
export { default as DistrictsPage } from './districtsPage';

// Components
export { default as DistrictsMultiView } from './components/districtsMultiView';
export { default as DistrictsChartView } from './components/districtsChartView';
export { default as DistrictForm } from './components/districtForm';
export { default as DistrictDeleteDialog } from './components/districtDeleteDialog';

// Services
export { default as DistrictService } from './services/districtService';

// Hooks - TanStack Query
export {
  useDistricts,
  useDistrictsByState,
  useDistrict,
  useDistrictWithAddresses,
  useDistrictCount,
  useDistrictSearch,
  useCreateDistrict,
  useUpdateDistrict,
  useDeleteDistrict,
  useInvalidateDistricts,
  districtKeys,
} from './hooks/useDistrictQueries';

// Types
export type {
  District,
  SimpleState,
  CreateDistrictRequest,
  UpdateDistrictRequest,
} from './types/District';