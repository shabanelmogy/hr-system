import type { AppointmentRepository } from '../../domain/repositories/appointment-repository';
import { appointmentRemoteDataSource } from '../remote/appointment-remote-data-source';

export class DefaultAppointmentRepository implements AppointmentRepository {
  constructor(private readonly remote: AppointmentRepository = appointmentRemoteDataSource) {}

  getAppointments = (range: Parameters<AppointmentRepository['getAppointments']>[0]) => this.remote.getAppointments(range);
  saveAppointment = (input: Parameters<AppointmentRepository['saveAppointment']>[0]) => this.remote.saveAppointment(input);
  deleteAppointment = (id: number) => this.remote.deleteAppointment(id);
}
