import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AppointmentService, { Appointment, CreateAppointmentRequest, UpdateAppointmentRequest } from "../services/appointmentService";

export const appointmentKeys = {
  all: ["appointments"] as const,
  list: () => [...appointmentKeys.all, "list"] as const,
  detail: (id: number) => [...appointmentKeys.all, "detail", id] as const,
};

export const useAppointments = () =>
  useQuery<Appointment[]>({
    queryKey: appointmentKeys.list(),
    queryFn: AppointmentService.getAll,
    staleTime: 5 * 60 * 1000,
  });

export const useCreateAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAppointmentRequest) => AppointmentService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: appointmentKeys.all as any });
    },
  });
};

export const useUpdateAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateAppointmentRequest) => AppointmentService.update(data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: appointmentKeys.all as any });
      qc.invalidateQueries({ queryKey: appointmentKeys.detail(data.id) as any });
    },
  });
};

export const useDeleteAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => AppointmentService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: appointmentKeys.all as any });
    },
  });
};
