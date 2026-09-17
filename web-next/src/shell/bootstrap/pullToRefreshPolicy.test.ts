import { describe, expect, it } from "vitest";
import { canPullToRefresh, type PullToRefreshSafetyState } from "./pullToRefreshPolicy";

const safeState: PullToRefreshSafetyState = {
  scrollY: 0,
  hasUnsavedChanges: false,
  isBusy: false,
  hasPendingMutations: false,
  hasOpenModal: false,
  gestureStartedInBlockedSurface: false,
  hasFocusedEditableElement: false,
};

describe("pull-to-refresh safety policy", () => {
  it("allows refresh only from a clean idle top-level surface", () => {
    expect(canPullToRefresh(safeState)).toBe(true);
  });

  it.each([
    ["page is scrolled", { scrollY: 1 }],
    ["form has unsaved changes", { hasUnsavedChanges: true }],
    ["form submission is busy", { isBusy: true }],
    ["a write mutation is pending", { hasPendingMutations: true }],
    ["a dialog or modal is open", { hasOpenModal: true }],
    ["gesture starts in a grid/dialog surface", { gestureStartedInBlockedSurface: true }],
    ["an editable control has focus", { hasFocusedEditableElement: true }],
  ] satisfies Array<[string, Partial<PullToRefreshSafetyState>]>) (
    "blocks refresh when %s",
    (_label, override) => {
      expect(canPullToRefresh({ ...safeState, ...override })).toBe(false);
    },
  );
});
