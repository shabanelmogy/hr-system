export interface Appointment {
  id: number;
  start: string;
  end: string;
  text: string;
  isAllDay: boolean;
}

export interface AppointmentRange {
  start: string;
  end: string;
}

export interface AppointmentFormData {
  text: string;
  start: string;
  end: string;
  isAllDay: boolean;
}

export interface CreateAppointmentRequest {
  start: string;
  end: string;
  text: string;
  isAllDay: boolean;
}

export interface UpdateAppointmentRequest extends CreateAppointmentRequest {
  id: number;
}
