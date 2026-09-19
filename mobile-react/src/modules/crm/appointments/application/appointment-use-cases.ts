import type { AppointmentInput, AppointmentRange } from '../domain/models/appointment';
import type { AppointmentRepository } from '../domain/repositories/appointment-repository';

export interface AppointmentUseCases {
  getAppointments(range: AppointmentRange): ReturnType<AppointmentRepository['getAppointments']>;
  saveAppointment(input: AppointmentInput): ReturnType<AppointmentRepository['saveAppointment']>;
  deleteAppointment(id: number): ReturnType<AppointmentRepository['deleteAppointment']>;
}

export function createAppointmentUseCases(repository: AppointmentRepository): AppointmentUseCases {
  return {
    getAppointments: (range) => repository.getAppointments(range),
    saveAppointment: (input) => repository.saveAppointment(input),
    deleteAppointment: (id) => repository.deleteAppointment(id),
  };
}
