import { platformToolsApi } from '@/src/features/platform-tools/api/platform-tools-api';

export const appointmentsApi = {
  getAppointments: platformToolsApi.getAppointments,
  saveAppointment: platformToolsApi.saveAppointment,
  deleteAppointment: platformToolsApi.deleteAppointment,
};
