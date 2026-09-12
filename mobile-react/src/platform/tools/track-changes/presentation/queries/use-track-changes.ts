import { useQuery } from '@tanstack/react-query';

import { useTrackChangeUseCases } from '../../composition/use-track-change-use-cases';

export const trackChangeKeys = {
  all: ['platform-tools', 'track-changes'] as const,
};

export function useTrackChanges() {
  const useCases = useTrackChangeUseCases();
  return useQuery({
    queryKey: trackChangeKeys.all,
    queryFn: () => useCases.getTrackChanges(),
  });
}
