import { createTrackChangeUseCases } from '../application/track-change-use-cases';
import { DefaultTrackChangeRepository } from '../data/repositories/default-track-change-repository';

const trackChangeUseCases = createTrackChangeUseCases(new DefaultTrackChangeRepository());

export function useTrackChangeUseCases() {
  return trackChangeUseCases;
}
