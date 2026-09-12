import type { TrackChangeRepository } from '../../domain/repositories/track-change-repository';
import { trackChangeRemoteDataSource } from '../remote/track-change-remote-data-source';

export class DefaultTrackChangeRepository implements TrackChangeRepository {
  constructor(private readonly remote: TrackChangeRepository = trackChangeRemoteDataSource) {}

  getTrackChanges = () => this.remote.getTrackChanges();
}
