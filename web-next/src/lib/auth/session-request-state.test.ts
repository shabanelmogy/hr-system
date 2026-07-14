import { describe, expect, it } from "vitest";
import { SessionRequestState } from "./session-request-state";

describe("SessionRequestState", () => {
  it("coalesces concurrent refresh requests", async () => {
    const state = new SessionRequestState();
    let calls = 0;
    let release!: () => void;
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });

    const first = state.run(async () => {
      calls += 1;
      await pending;
    });
    const second = state.run(async () => {
      calls += 1;
    });

    expect(second).toBe(first);
    release();
    await Promise.all([first, second]);
    expect(calls).toBe(1);
  });

  it("invalidates a pending response after logout", async () => {
    const state = new SessionRequestState();
    let requestGeneration = -1;
    let release!: () => void;
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });

    const request = state.run(async (generation) => {
      requestGeneration = generation;
      await pending;
    });
    state.invalidate();
    release();
    await request;

    expect(state.isCurrent(requestGeneration)).toBe(false);
  });
});
