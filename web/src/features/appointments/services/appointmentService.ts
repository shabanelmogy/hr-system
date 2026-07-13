import apiService from "@/shared/services/apiService";
import apiRoutes from "@/routes/apiRoutes";
import { extractValue, extractValues } from "@/shared/utils/ApiHelper";

// Types
export type Appointment = {
  id: number;
  start: string; // ISO string
  end: string;   // ISO string
  text: string;
};

export type CreateAppointmentRequest = {
  start: string; // ISO string
  end: string;   // ISO string
  text: string;
};

export type UpdateAppointmentRequest = {
  id: number;
  start: string; // ISO string
  end: string;   // ISO string
  text: string;
};

const normalizeAppointment = (x: any): Appointment => ({
  id: x?.id ?? x?.Id ?? 0,
  start: x?.start ?? x?.Start,
  end: x?.end ?? x?.End,
  text: x?.text ?? x?.Text,
});

export default class AppointmentService {
  static async getAll(): Promise<Appointment[]> {
    const response = await apiService.get(apiRoutes.appointments.getAll);
    const list = extractValues<Appointment>(response);
    return (list || []).map(normalizeAppointment);
  }

  static async create(data: CreateAppointmentRequest): Promise<Appointment> {
    const response = await apiService.post(apiRoutes.appointments.add, {
      id: 0,
      start: data.start,
      end: data.end,
      text: data.text,
    });
    return normalizeAppointment(extractValue<Appointment>(response));
  }

  static async update(data: UpdateAppointmentRequest): Promise<Appointment> {
    const response = await apiService.put(apiRoutes.appointments.update, {
      id: data.id,
      start: data.start,
      end: data.end,
      text: data.text,
    });
    const updated = extractValue<Appointment>(response);
    return normalizeAppointment({ ...data, ...updated });
  }

  static async delete(id: number): Promise<number> {
    await apiService.delete(apiRoutes.appointments.delete(id));
    return id;
  }
}
