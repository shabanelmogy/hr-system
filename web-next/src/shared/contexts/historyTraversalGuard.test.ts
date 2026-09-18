import { describe, expect, it, vi } from "vitest";
import { installHistoryTraversalGuard, type NavigationNavigateEventLike, type NavigationTraversalController } from "./historyTraversalGuard";
function setup() {
  let listener: ((e: NavigationNavigateEventLike) => void) | undefined;
  let resolve!: (v: boolean) => void;
  const requestDiscard = vi.fn(() => new Promise<boolean>(r => { resolve = r; }));
  const visited: string[] = [];
  const navigation: NavigationTraversalController = {
    addEventListener: (_, fn) => { listener = fn; },
    removeEventListener: () => { listener = undefined; },
  };
  async function emit(key: string, type = "traverse", canIntercept = true) {
    let precommitHandler: (() => Promise<void> | void) | undefined;
    listener?.({
      navigationType: type,
      cancelable: true,
      canIntercept,
      destination: { key, sameDocument: true },
      intercept: (options) => { precommitHandler = options.precommitHandler; },
    });
    if (precommitHandler) {
      try {
        await precommitHandler();
      } catch {
        return false;
      }
    }
    visited.push(key);
    return true;
  }
  let dirty = true;
  const dispose = installHistoryTraversalGuard({ navigation, hasUnsavedChanges: () => dirty, requestDiscard });
  return { emit, visited, navigation, requestDiscard, dispose, decide: (v: boolean) => resolve(v), clean: () => { dirty = false; } };
}
describe("precommit history guard", () => {
  it("blocks repeated traversal with one dialog and cancels without visiting either destination", async () => {
    const s = setup(); const first = s.emit("B"); const second = s.emit("A");
    expect(s.requestDiscard).toHaveBeenCalledTimes(1); expect(s.visited).toEqual([]);
    s.decide(false); await Promise.all([first, second]); expect(s.visited).toEqual([]);
  });
  it("accepts the exact multi-step destination once", async () => {
    const s = setup(); const navigation = s.emit("A"); s.decide(true); await navigation;
    expect(s.visited).toEqual(["A"]);
  });
  it("supports forward traversal and leaves clean navigation untouched", async () => {
    const s = setup(); const guarded = s.emit("D"); s.decide(true); await guarded;
    expect(s.visited).toEqual(["D"]); s.clean(); await s.emit("E"); expect(s.visited).toEqual(["D", "E"]);
  });
  it("leaves non-traversal and non-interceptable navigation untouched", async () => {
    const s = setup(); await s.emit("D", "push"); await s.emit("E", "traverse", false);
    expect(s.requestDiscard).not.toHaveBeenCalled(); expect(s.visited).toEqual(["D", "E"]);
  });
  it("does not replay after disposal", async () => {
    const s = setup(); const navigation = s.emit("A"); s.dispose(); s.decide(true); await navigation; expect(s.visited).toEqual([]);
  });
});
