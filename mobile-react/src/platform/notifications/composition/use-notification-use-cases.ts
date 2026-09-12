import { useMemo } from 'react';

import { connectivityService } from '@/src/core/offline';
import { createNotificationUseCases } from '../application/notification-use-cases';
import { notificationRemoteDataSource } from '../data/remote/notification-remote-data-source';
import { DefaultNotificationRepository } from '../data/repositories/default-notification-repository';

export function useNotificationUseCases() {
  return useMemo(() => createNotificationUseCases(new DefaultNotificationRepository(
    notificationRemoteDataSource,
    () => connectivityService.getSnapshot().isOnline,
  )), []);
}
