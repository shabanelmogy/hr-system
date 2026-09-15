import { beforeEach, describe, expect, it, vi } from "vitest";
import { stateKeys, useArchiveState } from "./useStateQueries";

const queryMocks = vi.hoisted(() => ({
  invalidateQueries: vi.fn(),
  useMutation: vi.fn((options: unknown) => options),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
  useQueryClient: () => ({ invalidateQueries: queryMocks.invalidateQueries }),
  useMutation: queryMocks.useMutation,
}));

describe("State mutation queries", () => {
  beforeEach(() => {
    queryMocks.invalidateQueries.mockReset().mockResolvedValue(undefined);
    queryMocks.useMutation.mockClear();
  });

  it("invalidates the feature root before invoking consumer success handling", async () => {
    const consumerSuccess = vi.fn();
    useArchiveState({ onSuccess: consumerSuccess });
    const mutationOptions = queryMocks.useMutation.mock.calls[0][0] as {
      onSuccess: (...args: unknown[]) => Promise<void>;
    };

    await mutationOptions.onSuccess(7, 7, undefined, {});

    expect(queryMocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: stateKeys.all });
    expect(queryMocks.invalidateQueries.mock.invocationCallOrder[0]).toBeLessThan(
      consumerSuccess.mock.invocationCallOrder[0],
    );
  });
});
