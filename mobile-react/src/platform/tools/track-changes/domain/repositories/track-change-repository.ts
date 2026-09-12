import type { TrackChangeLog } from '../models/track-change';

export interface TrackChangeRepository {
  getTrackChanges(): Promise<TrackChangeLog[]>;
}
