import { describe, expect, it } from "vitest";
import { normalizeAuditTrailDetails, normalizeAuditTrailPage } from "./auditTrailService";

describe("auditTrailService", () => {
  it("normalizes a page and keeps the next cursor", () => {
    const page = normalizeAuditTrailPage({
      items: [{
        moduleCode: "hr",
        id: 7,
        entityName: "Department",
        entityKey: "12",
        entityDisplay: "Sales",
        action: "Deleted",
        userId: "u1",
        userName: "Ahmed Ali",
        occurredOn: "2026-01-01T08:00:00Z",
        correlationId: null,
        changeCount: 3,
      }],
      nextCursor: "abc",
    });

    expect(page.nextCursor).toBe("abc");
    expect(page.items[0]).toMatchObject({ moduleCode: "hr", id: 7, action: "Deleted", userName: "Ahmed Ali" });
  });

  it("falls back to Modified for an unknown action and rejects invalid payloads", () => {
    expect(normalizeAuditTrailPage({ items: [{ action: "Weird" }], nextCursor: null }).items[0].action)
      .toBe("Modified");
    expect(() => normalizeAuditTrailPage({})).toThrow(TypeError);
  });

  it("normalizes details with field changes", () => {
    const details = normalizeAuditTrailDetails({
      entry: { moduleCode: "acc", id: 1, action: "Modified" },
      changes: [{ field: "NameEn", oldValue: "Old", newValue: "New" }, { field: "Code", oldValue: null }],
    });

    expect(details.changes).toEqual([
      { field: "NameEn", oldValue: "Old", newValue: "New" },
      { field: "Code", oldValue: null, newValue: null },
    ]);
  });
});
