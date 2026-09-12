/** Stable query-key convention for server-managed business entities. */
export function createEntityQueryKeys(root: string) {
  const all = [root] as const;
  return {
    all,
    list: () => [...all, "list"] as const,
    page: <TQuery>(query: TQuery) => [...all, "list", query] as const,
    detail: (id: string | number) => [...all, "detail", id] as const,
    lookup: () => [...all, "lookup"] as const,
  };
}
