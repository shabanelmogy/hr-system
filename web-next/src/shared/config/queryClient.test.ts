import { QueryObserver } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { createQueryClient } from "./queryClient";

describe("shared QueryClient cache consistency", () => {
  it("refetches an invalidated inactive query when its screen mounts again", async () => {
    const client = createQueryClient();
    const queryKey = ["reference-data", "lookup"] as const;
    let serverValue = ["old"];
    const queryFn = vi.fn(async () => serverValue);

    await client.fetchQuery({ queryKey, queryFn });
    serverValue = ["new"];

    // This mirrors a mutation while the dependent screen/query is inactive.
    await client.invalidateQueries({ queryKey, refetchType: "active" });
    expect(queryFn).toHaveBeenCalledTimes(1);

    const observer = new QueryObserver(client, { queryKey, queryFn });
    const unsubscribe = observer.subscribe(() => undefined);

    try {
      await vi.waitFor(() => {
        expect(queryFn).toHaveBeenCalledTimes(2);
        expect(observer.getCurrentResult().data).toEqual(["new"]);
      });
    } finally {
      unsubscribe();
      client.clear();
    }
  });
});
