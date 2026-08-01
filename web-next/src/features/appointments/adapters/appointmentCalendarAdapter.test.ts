import { describe, expect, it } from "vitest";
import {
  appointmentFormToCreateRequest,
  appointmentToCalendarEvent,
  calendarEventToAppointmentForm,
  calendarEventToUpdateRequest,
  selectionToAppointmentForm,
} from "./appointmentCalendarAdapter";

describe("appointment calendar adapter", () => {
  it("keeps an all-day selection inclusive in the form and exclusive in the API", () => {
    const form = selectionToAppointmentForm({
      allDay: true,
      start: new Date("2026-07-20T00:00:00.000Z"),
      end: new Date("2026-07-21T00:00:00.000Z"),
      startStr: "2026-07-20",
      endStr: "2026-07-21",
    });

    expect(form.end).toBe("2026-07-20");
    expect(appointmentFormToCreateRequest(form)).toMatchObject({
      start: "2026-07-20T00:00:00.000Z",
      end: "2026-07-21T00:00:00.000Z",
      isAllDay: true,
    });
  });

  it("does not grow an all-day appointment after editing", () => {
    const event = {
      id: "7",
      title: "Leave",
      allDay: true,
      start: new Date("2026-07-20T00:00:00.000Z"),
      end: new Date("2026-07-22T00:00:00.000Z"),
      startStr: "2026-07-20",
      endStr: "2026-07-22",
    };

    const form = calendarEventToAppointmentForm(event);
    expect(form.end).toBe("2026-07-21");
    expect(calendarEventToUpdateRequest(event)?.end).toBe("2026-07-22T00:00:00.000Z");
  });

  it("preserves timed appointments in month view", () => {
    const event = appointmentToCalendarEvent({
      id: 3,
      text: "Interview",
      start: "2026-07-20T08:30:00.000Z",
      end: "2026-07-20T09:30:00.000Z",
      isAllDay: false,
    });

    expect(event.allDay).toBe(false);
    expect(event.start).toBe("2026-07-20T08:30:00.000Z");
  });
});
