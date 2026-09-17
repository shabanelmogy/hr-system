import { useQuery } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAdaptivePagination } from "./useAdaptivePagination";

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
}));

const mockedUseQuery = vi.mocked(useQuery);

describe("adaptive pagination", () => {
  beforeEach(() => {
    mockedUseQuery.mockReset();
  });

  it("requests only the current server page and preserves the existing result shape", async () => {
    const query = { pageNumber: 3, pageSize: 25, search: "finance" };
    const response = {
      items: [{ id: 51 }, { id: 52 }],
      metaData: {
        currentPage: 3,
        pageSize: 25,
        totalCount: 77,
        totalPages: 4,
        hasPrevious: true,
        hasNext: true,
      },
    };
    const queryFn = vi.fn().mockResolvedValue(response);
    const refetch = vi.fn();
    mockedUseQuery.mockReturnValue({
      data: response,
      error: null,
      isLoading: false,
      isFetching: false,
      refetch,
    } as never);

    const result = useAdaptivePagination({
      query,
      queryKey: (value) => ["items", value],
      queryFn,
    });

    expect(mockedUseQuery).toHaveBeenCalledTimes(1);
    const options = mockedUseQuery.mock.calls[0][0];
    expect(options.queryKey).toEqual(["items", query]);
    expect(typeof options.queryFn).toBe("function");
    if (typeof options.queryFn !== "function") throw new Error("Expected a query function");
    await options.queryFn({} as never);
    expect(queryFn).toHaveBeenCalledTimes(1);
    expect(queryFn).toHaveBeenCalledWith(query);

    expect(result.mode).toBe("server");
    expect(result.isReady).toBe(true);
    expect(result.allItems).toBe(response.items);
    expect(result.pageItems).toBe(response.items);
    expect(result.totalCount).toBe(77);
    expect(result.refetch).toBe(refetch);
  });

  it("does not synthesize a client collection while the page is loading", () => {
    mockedUseQuery.mockReturnValue({
      data: undefined,
      error: null,
      isLoading: true,
      isFetching: true,
      refetch: vi.fn(),
    } as never);

    const result = useAdaptivePagination({
      query: { pageNumber: 1, pageSize: 10 },
      queryKey: (value) => ["items", value],
      queryFn: vi.fn(),
    });

    expect(mockedUseQuery).toHaveBeenCalledTimes(1);
    expect(result.mode).toBe("server");
    expect(result.isReady).toBe(false);
    expect(result.allItems).toEqual([]);
    expect(result.pageItems).toEqual([]);
    expect(result.totalCount).toBe(0);
    expect(result.isLoading).toBe(true);
    expect(result.isFetching).toBe(true);
  });
});
