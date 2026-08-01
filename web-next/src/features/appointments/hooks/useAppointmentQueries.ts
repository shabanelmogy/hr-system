import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AppointmentService from "../services/appointmentService";
import type {
  AppointmentRange,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
} from "../types/appointment";

export const appointmentKeys = {
  all: ["appointments"] as const,
  list: (range: AppointmentRange) => [...appointmentKeys.all, "list", range] as const,
};

export const useAppointments = (range: AppointmentRange) =>
  useQuery({
    queryKey: appointmentKeys.list(range),
    queryFn: () => AppointmentService.getAll(range),
    staleTime: 5 * 60 * 1000,
  });

export const useCreateAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAppointmentRequest) => AppointmentService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
};

export const useUpdateAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateAppointmentRequest) => AppointmentService.update(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
};

export const useDeleteAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => AppointmentService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
};
