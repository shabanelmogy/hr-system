import { apiRoutes } from "@/config";
import apiService from "@/shared/services/apiService";
import type {
  Appointment,
  AppointmentRange,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
} from "../types/appointment";
import { parseAppointment } from "../validation/appointmentApiSchema";

export default class AppointmentService {
  static async getAll(range: AppointmentRange): Promise<Appointment[]> {
    const response = await apiService.get<unknown>(apiRoutes.appointments.getAll, {
      rangeStart: range.start,
      rangeEnd: range.end,
    });
    return extractList(response).map(parseAppointment);
  }

  static async create(data: CreateAppointmentRequest): Promise<Appointment> {
    const response = await apiService.post<unknown>(apiRoutes.appointments.add, {
      id: 0,
      ...data,
    });
    return parseAppointment(extractValue(response));
  }

  static async update(data: UpdateAppointmentRequest): Promise<Appointment> {
    const response = await apiService.put<unknown>(apiRoutes.appointments.update, data);
    return parseAppointment(extractValue(response));
  }

  static async delete(id: number): Promise<number> {
    await apiService.delete(apiRoutes.appointments.delete(id));
    return id;
  }
}

function extractValue(response: unknown): unknown {
  if (!isRecord(response)) return response;
  if (response.isSuccess === true && "value" in response) return response.value;
  if ("data" in response) return response.data;
  return response;
}

function extractList(response: unknown): unknown[] {
  const value = extractValue(response);
  if (!Array.isArray(value)) return [];
  return value.map(extractValue);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
