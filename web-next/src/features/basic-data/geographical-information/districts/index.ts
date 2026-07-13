// Export all district-related components and hooks

// Main page
export { default as DistrictsPage } from './pages/DistrictsPage';

// Components
export { default as DistrictsMultiView } from './components/DistrictsMultiView';
export { default as DistrictsChartView } from './components/DistrictsChartView';
export { default as DistrictForm } from './components/DistrictForm';
export { default as DistrictDeleteDialog } from './components/DistrictDeleteDialog';

// Services
export { default as districtService } from './services/districtService';

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
