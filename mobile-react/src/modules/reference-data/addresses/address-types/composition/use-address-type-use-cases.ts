import { useMemo } from 'react';

import { connectivityService } from '@/src/core/offline';
import { createAddressTypeUseCases } from '../application/address-type-use-cases';
import { addressTypeRemoteDataSource } from '../data/remote/address-type-remote-data-source';
import { DefaultAddressTypeRepository } from '../data/repositories/default-address-type-repository';

export function useAddressTypeUseCases() {
  return useMemo(() => createAddressTypeUseCases(new DefaultAddressTypeRepository(
    addressTypeRemoteDataSource,
    () => connectivityService.getSnapshot().isOnline,
  )), []);
}
