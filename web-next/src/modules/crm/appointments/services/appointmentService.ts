import { apiRoutes } from "@/config";
import apiService from "@/shared/services/apiService";
import type {
  Appointment,
  AppointmentRange,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
} from "../types/appointment";
import { parseAppointment, parseAppointments } from "../validation/appointmentApiSchema";

export default class AppointmentService {
  static async getAll(range: AppointmentRange): Promise<Appointment[]> {
    const response = await apiService.get<unknown>(apiRoutes.appointments.getAll, {
      rangeStart: range.start,
      rangeEnd: range.end,
    });
    return parseAppointments(response);
  }

  static async create(data: CreateAppointmentRequest): Promise<Appointment> {
    const response = await apiService.post<unknown>(apiRoutes.appointments.add, data);
    return parseAppointment(response);
  }

  static async update(data: UpdateAppointmentRequest): Promise<Appointment> {
    const response = await apiService.put<unknown>(apiRoutes.appointments.update, data);
    return parseAppointment(response);
  }

  static async delete(id: number): Promise<number> {
    await apiService.delete(apiRoutes.appointments.delete(id));
    return id;
  }
}

