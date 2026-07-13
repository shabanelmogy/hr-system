// Export all address type-related components and hooks

// Main page
export { default as AddressTypesPage } from './addressTypesPage';

// Components
export { default as AddressTypesMultiView } from './components/addressTypesMultiView';
export { default as AddressTypeForm } from './components/addressTypeForm';
export { default as AddressTypeDeleteDialog } from './components/addressTypeDeleteDialog';

// Services
export { default as AddressTypeService } from './services/addressTypeService';
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
