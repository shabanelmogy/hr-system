import type { EventInput } from "@fullcalendar/core";
import dayjs from "dayjs";
import type {
  Appointment,
  AppointmentFormData,
  AppointmentRange,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
} from "../types/appointment";

const dateOnlyFormat = "YYYY-MM-DD";

interface CalendarSelection {
  allDay: boolean;
  start: Date;
  end: Date;
  startStr: string;
  endStr: string;
}

interface CalendarEventValue {
  id: string;
  title: string;
  allDay: boolean;
  start: Date | null;
  end: Date | null;
  startStr: string;
  endStr: string;
}

export function appointmentToCalendarEvent(appointment: Appointment): EventInput {
  if (appointment.isAllDay || isLegacyAllDayAppointment(appointment)) {
    return {
      id: String(appointment.id),
      title: appointment.text,
      start: utcDateKey(appointment.start),
      end: utcDateKey(appointment.end),
      allDay: true,
      durationEditable: true,
    };
  }

  return {
    id: String(appointment.id),
    title: appointment.text,
    start: appointment.start,
    end: appointment.end,
    allDay: false,
  };
}

function isLegacyAllDayAppointment(appointment: Appointment): boolean {
  const start = new Date(appointment.start);
  const end = new Date(appointment.end);
  const duration = end.getTime() - start.getTime();
  const day = 24 * 60 * 60 * 1000;

  return (
    duration >= day &&
    duration % day === 0 &&
    start.getUTCHours() === 12 &&
    end.getUTCHours() === 12 &&
    start.getUTCMinutes() === 0 &&
    end.getUTCMinutes() === 0
  );
}

export function selectionToAppointmentForm(
  selection: CalendarSelection,
): AppointmentFormData {
  if (selection.allDay) {
    const exclusiveEnd = selection.endStr || dayjs(selection.start).add(1, "day").format(dateOnlyFormat);
    return {
      text: "",
      start: dayjs(selection.startStr || selection.start).format(dateOnlyFormat),
      end: dayjs(exclusiveEnd).subtract(1, "day").format(dateOnlyFormat),
      isAllDay: true,
    };
  }

  return {
    text: "",
    start: selection.start.toISOString(),
    end: selection.end.toISOString(),
    isAllDay: false,
  };
}

export function calendarEventToAppointmentForm(
  event: CalendarEventValue,
): AppointmentFormData {
  if (event.allDay) {
    const start = event.startStr || dayjs(event.start).format(dateOnlyFormat);
    const exclusiveEnd = event.endStr || dayjs(start).add(1, "day").format(dateOnlyFormat);
    return {
      text: event.title,
      start,
      end: dayjs(exclusiveEnd).subtract(1, "day").format(dateOnlyFormat),
      isAllDay: true,
    };
  }

  const start = event.start ?? new Date();
  const end = event.end ?? new Date(start.getTime() + 60 * 60 * 1000);
  return {
    text: event.title,
    start: start.toISOString(),
    end: end.toISOString(),
    isAllDay: false,
  };
}

export function appointmentFormToCreateRequest(
  form: AppointmentFormData,
): CreateAppointmentRequest {
  return appointmentFormToRequest(form);
}

export function appointmentFormToUpdateRequest(
  id: number,
  form: AppointmentFormData,
): UpdateAppointmentRequest {
  return { id, ...appointmentFormToRequest(form) };
}

export function calendarEventToUpdateRequest(
  event: CalendarEventValue,
): UpdateAppointmentRequest | null {
  const id = Number(event.id);
  if (!Number.isInteger(id) || id <= 0) return null;

  if (event.allDay) {
    const start = event.startStr || dayjs(event.start).format(dateOnlyFormat);
    const end = event.endStr || dayjs(start).add(1, "day").format(dateOnlyFormat);
    return {
      id,
      text: event.title,
      start: toUtcDayStart(start),
      end: toUtcDayStart(end),
      isAllDay: true,
    };
  }

  if (!event.start || !event.end) return null;
  return {
    id,
    text: event.title,
    start: event.start.toISOString(),
    end: event.end.toISOString(),
    isAllDay: false,
  };
}

export function getInitialAppointmentRange(now = dayjs()): AppointmentRange {
  return {
    start: now.startOf("month").subtract(7, "day").toISOString(),
    end: now.endOf("month").add(7, "day").toISOString(),
  };
}

function appointmentFormToRequest(
  form: AppointmentFormData,
): CreateAppointmentRequest {
  if (form.isAllDay) {
    return {
      text: form.text.trim(),
      start: toUtcDayStart(form.start),
      end: toUtcDayStart(dayjs(form.end).add(1, "day").format(dateOnlyFormat)),
      isAllDay: true,
    };
  }

  return {
    text: form.text.trim(),
    start: dayjs(form.start).toDate().toISOString(),
    end: dayjs(form.end).toDate().toISOString(),
    isAllDay: false,
  };
}

function toUtcDayStart(value: string): string {
  return `${dayjs(value).format(dateOnlyFormat)}T00:00:00.000Z`;
}

function utcDateKey(value: string): string {
  return new Date(value).toISOString().slice(0, 10);
}
