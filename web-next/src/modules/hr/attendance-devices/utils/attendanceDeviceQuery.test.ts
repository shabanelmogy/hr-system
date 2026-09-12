import { describe, expect, it } from "vitest";
import { clearSelectionOnDeviceChange, toAttendanceDeviceQuery } from "./attendanceDeviceQuery";
describe("attendance device query mapping", () => {
  it("converts the zero-based UI page and omits blank search", () => expect(toAttendanceDeviceQuery({ page: 0, pageSize: 10, columnName: "updatedOn", sortDirection: "DESC" }, "  ")).toEqual({ pageNumber: 1, pageSize: 10, sortBy: "updatedOn", sortDirection: "desc", search: undefined }));
  it("flags stale operation state when a different device is selected", () => { expect(clearSelectionOnDeviceChange({ id: 1 }, { id: 2 })).toBe(true); expect(clearSelectionOnDeviceChange({ id: 1 }, { id: 1 })).toBe(false); });
});
