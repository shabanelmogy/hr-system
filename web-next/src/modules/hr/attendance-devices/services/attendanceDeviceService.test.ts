import { apiRoutes } from "@/config";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { attendanceDeviceService } from "./attendanceDeviceService";

const { post, put, patch } = vi.hoisted(() => ({ post: vi.fn(), put: vi.fn(), patch: vi.fn() }));
vi.mock("@/shared/services/apiService", () => ({ default: { get: vi.fn(), post, put, patch } }));

describe("attendanceDeviceService", () => {
  beforeEach(() => { post.mockReset(); put.mockReset(); patch.mockReset(); });

  it("sends the current row version on device metadata and enabled mutations", async () => {
    put.mockResolvedValue({ id: 7 });
    patch.mockResolvedValue(undefined);

    await attendanceDeviceService.update(7, {
      name: "  Main Clock  ", providerId: " zkteco-com ", host: " 10.0.0.7 ", port: 4370,
      timeZoneId: " UTC ", branchId: 3, attendanceAgentId: "b8bd17da-a585-46b0-a73e-e1f8d7bc25f5",
      rowVersion: "AQIDBA==",
    });
    await attendanceDeviceService.setEnabled(7, false, "BQYHCA==");

    expect(put).toHaveBeenCalledWith(apiRoutes.attendanceDevices.update(7), {
      name: "Main Clock", providerId: "zkteco-com", host: "10.0.0.7", port: 4370,
      timeZoneId: "UTC", branchId: 3, attendanceAgentId: "b8bd17da-a585-46b0-a73e-e1f8d7bc25f5",
      rowVersion: "AQIDBA==",
    });
    expect(patch).toHaveBeenCalledWith(apiRoutes.attendanceDevices.enabled(7), { enabled: false, rowVersion: "BQYHCA==" });
  });

  it("preserves a caller operation id for attendance pull retries", async () => {
    post.mockResolvedValue({ id: 12 });
    const request = { fromUtc: "2026-09-15T08:00:00.000Z", toUtc: "2026-09-15T10:00:00.000Z", operationId: "aebc44ab-ea82-4e33-a664-10c9185d9500" };

    await attendanceDeviceService.pullAttendance(7, request);

    expect(post).toHaveBeenCalledWith(apiRoutes.attendanceDevices.pullAttendance(7), request);
  });
});
