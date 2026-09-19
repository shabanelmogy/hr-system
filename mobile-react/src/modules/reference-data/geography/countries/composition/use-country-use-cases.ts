import { useMemo } from 'react';

import {
  connectivityService,
  isOfflineReadFresh,
  OFFLINE_READ_POLICIES,
  useOfflineDatabase,
} from '@/src/core/offline';
import { OFFLINE_CAPABILITY_IDS } from '@/src/core/offline-policy';
import { useOfflineReadPreferences } from '@/src/core/preferences';
import { useAuth } from '@/src/platform/auth';
import { useOfflineOperationsPolicy } from '@/src/platform/offline-operations';

import { createCountryUseCases } from '../application/country-use-cases';
import { unavailableCountryLocalDataSource } from '../data/local/country-local-data-source';
import { SqliteCountryLocalDataSource } from '../data/local/sqlite-country-local-data-source';
import {
  countryRemoteDataSource,
  isCountryOfflineReadError,
} from '../data/remote/country-remote-data-source';
import { DefaultCountryRepository } from '../data/repositories/default-country-repository';

export function useCountryUseCases() {
  const database = useOfflineDatabase();
  const offlinePreferences = useOfflineReadPreferences();
  const offlinePolicy = useOfflineOperationsPolicy();
  const { session } = useAuth();
  const userId = session?.userId ?? null;
  const tenantId = session?.tenantId ?? null;
  const companyId = session?.companyId ?? null;
  const offlineReadEnabled = offlinePreferences.loaded
    && offlinePolicy.loaded
    && offlinePolicy.canReadOffline(OFFLINE_CAPABILITY_IDS.countriesRead)
    && offlinePreferences.isOfflineReadEnabled('countries');

  return useMemo(() => {
    const local = database && userId && tenantId && companyId
      ? new SqliteCountryLocalDataSource(database, { userId, tenantId, companyId })
      : unavailableCountryLocalDataSource;
    const repository = new DefaultCountryRepository(
      countryRemoteDataSource,
      local,
      isCountryOfflineReadError,
      () => connectivityService.getSnapshot().isOnline,
      {
        enabled: () => offlineReadEnabled,
        isFresh: (cachedAt) => isOfflineReadFresh(cachedAt, OFFLINE_READ_POLICIES.countries),
      },
    );
    return createCountryUseCases(repository);
  }, [companyId, database, offlineReadEnabled, tenantId, userId]);
}
