import type { Appointment, AppointmentInput, AppointmentRange } from '../models/appointment';

export interface AppointmentRepository {
  getAppointments(range: AppointmentRange): Promise<Appointment[]>;
  saveAppointment(input: AppointmentInput): Promise<Appointment>;
  deleteAppointment(id: number): Promise<void>;
}
