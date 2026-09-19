import { z } from 'zod';

import { apiService } from '@/src/core/api';

import type { AppointmentRepository } from '../../domain/repositories/appointment-repository';
import { appointmentEndpoints } from './appointment-endpoints';
import { appointmentSchema } from './appointment-schemas';

export const appointmentRemoteDataSource: AppointmentRepository = {
  async getAppointments(range) {
    const response = await apiService.get<unknown>(appointmentEndpoints.getAll, {
      params: { rangeStart: range.start, rangeEnd: range.end },
    });
    return z.array(appointmentSchema).parse(response);
  },

  async saveAppointment(input) {
    const request = {
      id: input.id ?? 0,
      start: input.start,
      end: input.end,
      text: input.text,
      isAllDay: input.isAllDay,
    };
    const response = input.id == null
      ? await apiService.post<unknown, typeof request>(appointmentEndpoints.add, request)
      : await apiService.put<unknown, typeof request>(appointmentEndpoints.update, request);
    return appointmentSchema.parse(response);
  },

  async deleteAppointment(id) {
    await apiService.delete<unknown>(appointmentEndpoints.delete(id));
  },
};
