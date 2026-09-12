export interface Appointment {
  id: number;
  start: string;
  end: string;
  text: string;
  isAllDay: boolean;
}

export interface AppointmentInput {
  id?: number;
  start: string;
  end: string;
  text: string;
  isAllDay: boolean;
}

export interface AppointmentRange {
  start: string;
  end: string;
}
