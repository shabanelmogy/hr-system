import { z } from 'zod';

import { apiService } from '@/src/core/api';

import type { TrackChangeLog } from '../../domain/models/track-change';
import type { TrackChangeRepository } from '../../domain/repositories/track-change-repository';
import { trackChangeEndpoints } from './track-change-endpoints';
import { trackChangeLogSchema } from './track-change-schemas';

export function toTrackChangeLogs(values: readonly z.infer<typeof trackChangeLogSchema>[]): TrackChangeLog[] {
  const occurrences = new Map<string, number>();
  return values.map((change) => {
    const fingerprint = [change.changeLogId, change.entityName, change.key, change.changedBy, change.changedAt]
      .map((part) => encodeURIComponent(part))
      .join('|');
    const occurrence = occurrences.get(fingerprint) ?? 0;
    occurrences.set(fingerprint, occurrence + 1);
    return {
      ...change,
      id: occurrence === 0 ? fingerprint : `${fingerprint}|${occurrence}`,
    };
  });
}

export const trackChangeRemoteDataSource: TrackChangeRepository = {
  async getTrackChanges() {
    const response = await apiService.get<unknown>(trackChangeEndpoints.all);
    return toTrackChangeLogs(z.array(trackChangeLogSchema).parse(response));
  },
};
