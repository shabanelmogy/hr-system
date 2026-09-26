import { describe, expect, it } from "vitest";
import { getAttendancePermissions } from "./permissions";
describe("attendance device permissions", () => { it("fails closed when claims are absent or app is read-only", () => { expect(getAttendancePermissions([], false).canView).toBe(false); const result = getAttendancePermissions(["AttendanceDevices:View", "AttendanceDevices:Edit"], true); expect(result.canView).toBe(true); expect(result.canEditDevice).toBe(false); }); });
