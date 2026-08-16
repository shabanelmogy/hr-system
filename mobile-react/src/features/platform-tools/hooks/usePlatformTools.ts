import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { platformToolsApi } from '@/src/features/platform-tools/api/platform-tools-api';
import type {
  AppointmentInput,
  AppointmentRange,
  LocalizationCulture,
  UploadFileAsset,
} from '@/src/features/platform-tools/types/platform-tools';

export const platformToolKeys = {
  files: ['platform-tools', 'files'] as const,
  appointments: (range: AppointmentRange) => ['platform-tools', 'appointments', range] as const,
  trackChanges: ['platform-tools', 'track-changes'] as const,
  localization: (culture: LocalizationCulture) =>
    ['platform-tools', 'localization', culture] as const,
  health: ['platform-tools', 'health'] as const,
  backgroundJobs: ['platform-tools', 'background-jobs'] as const,
};

export function useStoredFiles() {
  return useQuery({ queryKey: platformToolKeys.files, queryFn: platformToolsApi.getFiles });
}

export function useUploadFiles() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (files: readonly UploadFileAsset[]) => platformToolsApi.uploadFiles(files),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: platformToolKeys.files }),
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: platformToolsApi.deleteFile,
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: platformToolKeys.files }),
  });
}

export function useAppointments(range: AppointmentRange) {
  return useQuery({
    queryKey: platformToolKeys.appointments(range),
    queryFn: () => platformToolsApi.getAppointments(range),
  });
}

export function useSaveAppointment(range: AppointmentRange) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AppointmentInput) => platformToolsApi.saveAppointment(input),
    onSuccess: async () => queryClient.invalidateQueries({
      queryKey: platformToolKeys.appointments(range),
    }),
  });
}

export function useDeleteAppointment(range: AppointmentRange) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: platformToolsApi.deleteAppointment,
    onSuccess: async () => queryClient.invalidateQueries({
      queryKey: platformToolKeys.appointments(range),
    }),
  });
}

export function useTrackChanges() {
  return useQuery({
    queryKey: platformToolKeys.trackChanges,
    queryFn: platformToolsApi.getTrackChanges,
  });
}

export function useLocalizationEntries(culture: LocalizationCulture) {
  return useQuery({
    queryKey: platformToolKeys.localization(culture),
    queryFn: () => platformToolsApi.getLocalization(culture),
  });
}

export function useUpdateLocalization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: platformToolsApi.updateLocalization,
    onSuccess: async (_, request) => queryClient.invalidateQueries({
      queryKey: platformToolKeys.localization(request.culture),
    }),
  });
}

export function useHealthCheck() {
  return useQuery({
    queryKey: platformToolKeys.health,
    queryFn: platformToolsApi.getHealthCheck,
    refetchInterval: 30_000,
  });
}

export function useBackgroundJobs() {
  return useQuery({
    queryKey: platformToolKeys.backgroundJobs,
    queryFn: platformToolsApi.getBackgroundJobs,
    refetchInterval: 15_000,
  });
}
