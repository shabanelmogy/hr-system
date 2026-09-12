import { describe, expect, it } from "vitest";
import { createUnsavedChangesRegistry } from "./unsavedChangesRegistry";

describe("unsaved changes registry", () => {
  it("keeps pending submissions protected even without dirty fields", () => {
    const registry = createUnsavedChangesRegistry();
    const release = registry.register("saving", true);
    expect(registry.hasUnsavedChanges()).toBe(true);
    expect(registry.isBusy()).toBe(true);
    release();
    expect(registry.isBusy()).toBe(false);
    expect(registry.hasUnsavedChanges()).toBe(false);
  });
  it("tracks independent dirty sources and unregisters idempotently", () => {
    const registry = createUnsavedChangesRegistry();
    const releaseFirst = registry.register("form:first");
    const releaseSecond = registry.register("form:second");

    expect(registry.hasUnsavedChanges()).toBe(true);
    expect(registry.count()).toBe(2);

    releaseFirst();
    releaseFirst();
    expect(registry.count()).toBe(1);

    releaseSecond();
    expect(registry.hasUnsavedChanges()).toBe(false);
  });

  it("notifies subscribers when the dirty snapshot changes", () => {
    const registry = createUnsavedChangesRegistry();
    let notifications = 0;
    const unsubscribe = registry.subscribe(() => {
      notifications += 1;
    });

    const release = registry.register("form:first");
    expect(registry.getSnapshot()).toBe(1);
    expect(notifications).toBe(1);

    release();
    expect(registry.getSnapshot()).toBe(2);
    expect(notifications).toBe(2);

    unsubscribe();
    registry.register("form:second");
    expect(notifications).toBe(2);
  });
});
