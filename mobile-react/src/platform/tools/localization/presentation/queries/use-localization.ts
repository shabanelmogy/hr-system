import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useLocalizationUseCases } from '../../composition/use-localization-use-cases';
import type { LocalizationCulture } from '../../domain/models/localization';
import type { UpdateLocalizationRequest } from '../../domain/repositories/localization-repository';

export const localizationKeys = {
  all: ['platform-tools', 'localization'] as const,
  culture: (culture: LocalizationCulture) => [...localizationKeys.all, culture] as const,
};

export function useLocalizationEntries(culture: LocalizationCulture) {
  const useCases = useLocalizationUseCases();
  return useQuery({
    queryKey: localizationKeys.culture(culture),
    queryFn: () => useCases.getLocalization(culture),
  });
}

export function useUpdateLocalization() {
  const useCases = useLocalizationUseCases();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdateLocalizationRequest) => useCases.updateLocalization(request),
    onSuccess: async (_, request) => queryClient.invalidateQueries({
      queryKey: localizationKeys.culture(request.culture),
    }),
  });
}
