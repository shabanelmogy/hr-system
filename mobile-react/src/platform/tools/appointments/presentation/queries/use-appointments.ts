import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAppointmentUseCases } from '../../composition/use-appointment-use-cases';
import type { AppointmentInput, AppointmentRange } from '../../domain/models/appointment';

export const appointmentKeys = {
  all: ['platform-tools', 'appointments'] as const,
  range: (range: AppointmentRange) => [...appointmentKeys.all, range] as const,
};

export function useAppointments(range: AppointmentRange) {
  const useCases = useAppointmentUseCases();
  return useQuery({
    queryKey: appointmentKeys.range(range),
    queryFn: () => useCases.getAppointments(range),
  });
}

export function useSaveAppointment(range: AppointmentRange) {
  const useCases = useAppointmentUseCases();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AppointmentInput) => useCases.saveAppointment(input),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: appointmentKeys.range(range) }),
  });
}

export function useDeleteAppointment(range: AppointmentRange) {
  const useCases = useAppointmentUseCases();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => useCases.deleteAppointment(id),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: appointmentKeys.range(range) }),
  });
}
