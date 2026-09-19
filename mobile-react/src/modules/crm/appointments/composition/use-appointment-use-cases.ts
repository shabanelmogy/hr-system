import { createAppointmentUseCases } from '../application/appointment-use-cases';
import { DefaultAppointmentRepository } from '../data/repositories/default-appointment-repository';

const appointmentUseCases = createAppointmentUseCases(new DefaultAppointmentRepository());

export function useAppointmentUseCases() {
  return appointmentUseCases;
}
