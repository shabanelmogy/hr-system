import { apiRoutes } from "@/config";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AppointmentService from "./appointmentService";
import { parseAppointment } from "../validation/appointmentApiSchema";

const { get, post, put, remove } = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  remove: vi.fn(),
}));

vi.mock("@/shared/services/apiService", () => ({
  default: { get, post, put, delete: remove },
}));

const appointment = {
  id: 7,
  start: "2026-09-10T08:00:00.000Z",
  end: "2026-09-10T09:00:00.000Z",
  text: "Planning",
  isAllDay: false,
};

describe("AppointmentService API contract", () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
    put.mockReset();
    remove.mockReset();
  });

  it("uses the current direct CRM contract without tenant or company identifiers", async () => {
    get.mockResolvedValue([appointment]);
    const range = { start: "2026-09-01T00:00:00.000Z", end: "2026-10-01T00:00:00.000Z" };

    await expect(AppointmentService.getAll(range)).resolves.toEqual([appointment]);
    expect(get).toHaveBeenCalledWith(apiRoutes.appointments.getAll, {
      rangeStart: range.start,
      rangeEnd: range.end,
    });
    expect(get.mock.calls[0][1]).not.toHaveProperty("tenantId");
    expect(get.mock.calls[0][1]).not.toHaveProperty("companyId");
  });

  it("sends the canonical create request without a fabricated id", async () => {
    post.mockResolvedValue(appointment);
    const request = {
      start: appointment.start,
      end: appointment.end,
      text: appointment.text,
      isAllDay: appointment.isAllDay,
    };

    await expect(AppointmentService.create(request)).resolves.toEqual(appointment);
    expect(post).toHaveBeenCalledWith(apiRoutes.appointments.add, request);
    expect(post.mock.calls[0][1]).not.toHaveProperty("id");
  });

  it("fails closed on obsolete wrapped or PascalCase response shapes", async () => {
    get.mockResolvedValue({ data: [appointment] });
    await expect(AppointmentService.getAll({ start: appointment.start, end: appointment.end })).rejects.toBeDefined();
    expect(() => parseAppointment({ Id: 7, Start: appointment.start, End: appointment.end, Text: "Planning", IsAllDay: false })).toThrow();
  });
});
