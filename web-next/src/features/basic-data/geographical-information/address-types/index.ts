// Export all address type-related components and hooks

// Main page
export { default as AddressTypesPage } from './pages/AddressTypesPage';

// Components
export { default as AddressTypesMultiView } from './components/AddressTypesMultiView';
export { default as AddressTypeForm } from './components/AddressTypeForm';
export { default as AddressTypeDeleteDialog } from './components/AddressTypeDeleteDialog';

// Services
export { default as addressTypeService } from './services/addressTypeService';
export type { AddressType, CreateAddressTypeRequest, UpdateAddressTypeRequest } from './types/AddressType';

// Hooks - TanStack Query
export { default as useAddressTypeGridLogic } from './hooks/useAddressTypeGridLogic';
export {
  useAddressTypes,
  useAddressType,
  useAddressTypeSearch,
  useCreateAddressType,
  useUpdateAddressType,
  useDeleteAddressType,
  useInvalidateAddressTypes,
  addressTypeKeys,
} from './hooks/useAddressTypeQueries';
