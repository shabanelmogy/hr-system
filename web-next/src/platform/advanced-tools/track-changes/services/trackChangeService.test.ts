import { describe, expect, it } from "vitest";
import { normalizeTrackChanges } from "./trackChangeService";

const sharedChange = {
  changeLogId: 2,
  entityName: "State",
  changedBy: "admin",
  changedAt: "2026-07-18T18:00:00Z",
  changedByPc: "WORKSTATION",
};

describe("normalizeTrackChanges", () => {
  it("creates stable unique grid IDs when one entity has multiple changed fields", () => {
    const input = [
      { ...sharedChange, key: "Name", oldValue: "Old", newValue: "New" },
      { ...sharedChange, key: "Code", oldValue: "A", newValue: "B" },
    ];

    const first = normalizeTrackChanges(input);
    const second = normalizeTrackChanges(input);

    expect(new Set(first.map(({ id }) => id)).size).toBe(first.length);
    expect(first.map(({ id }) => id)).toEqual(second.map(({ id }) => id));
  });

  it("disambiguates duplicate rows without random IDs", () => {
    const duplicate = {
      ...sharedChange,
      key: "Name",
      oldValue: "Old",
      newValue: "New",
    };

    const rows = normalizeTrackChanges([duplicate, duplicate]);

    expect(rows[0].id).not.toBe(rows[1].id);
    expect(rows[1].id).toBe(`${rows[0].id}|1`);
  });
});
