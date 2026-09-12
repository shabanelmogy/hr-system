import { describe, expect, it, vi } from "vitest";
import { installHistoryTraversalGuard, type NavigationNavigateEventLike, type NavigationTraversalController } from "./historyTraversalGuard";
function setup() {
  let listener: ((e: NavigationNavigateEventLike) => void) | undefined;
  let resolve!: (v: boolean) => void;
  const requestDiscard = vi.fn(() => new Promise<boolean>(r => { resolve = r; }));
  const visited: string[] = [];
  const navigation: NavigationTraversalController = {
    currentEntry: { key: "C" },
    addEventListener: (_, fn) => { listener = fn; },
    removeEventListener: () => { listener = undefined; },
    traverseTo: (key) => { emit(key); return { committed: Promise.resolve(), finished: Promise.resolve() }; },
  };
  function emit(key: string, type = "traverse") {
    const preventDefault = vi.fn();
    listener?.({ navigationType: type, cancelable: true, destination: { key, sameDocument: true }, preventDefault });
    if (!preventDefault.mock.calls.length) { navigation.currentEntry = { key }; visited.push(key); }
    return preventDefault;
  }
  let dirty = true;
  const dispose = installHistoryTraversalGuard({ navigation, hasUnsavedChanges: () => dirty, requestDiscard });
  return { emit, visited, navigation, requestDiscard, dispose, decide: (v: boolean) => resolve(v), clean: () => { dirty = false; } };
}
describe("precommit history guard", () => {
  it("blocks repeated traversal with one dialog and cancels without visiting either destination", async () => {
    const s = setup(); s.emit("B"); s.emit("A");
    expect(s.requestDiscard).toHaveBeenCalledTimes(1); expect(s.visited).toEqual([]);
    s.decide(false); await Promise.resolve(); expect(s.visited).toEqual([]);
  });
  it("accepts the exact multi-step destination once", async () => {
    const s = setup(); s.emit("A"); s.decide(true); await Promise.resolve();
    expect(s.visited).toEqual(["A"]);
  });
  it("supports forward traversal and leaves clean navigation untouched", async () => {
    const s = setup(); s.emit("D"); s.decide(true); await Promise.resolve();
    expect(s.visited).toEqual(["D"]); s.clean(); s.emit("E"); expect(s.visited).toEqual(["D", "E"]);
  });
  it("does not replay after another route replaces the origin", async () => {
    const s = setup(); s.emit("A"); s.emit("D", "push"); s.decide(true); await Promise.resolve();
    expect(s.visited).toEqual(["D"]);
  });
  it("does not replay after disposal", async () => {
    const s = setup(); s.emit("A"); s.dispose(); s.decide(true); await Promise.resolve(); expect(s.visited).toEqual([]);
  });
});