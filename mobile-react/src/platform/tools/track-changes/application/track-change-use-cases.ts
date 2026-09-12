import type { TrackChangeRepository } from '../domain/repositories/track-change-repository';

export type TrackChangeUseCases = TrackChangeRepository;

export function createTrackChangeUseCases(repository: TrackChangeRepository): TrackChangeUseCases {
  return { getTrackChanges: () => repository.getTrackChanges() };
}
