import { describe, expect, it } from "vitest";
import { createEntityQueryKeys } from "./createEntityQueryKeys";

describe("createEntityQueryKeys", () => {
  it("keeps list, page, detail and lookup under one stable root", () => {
    const keys = createEntityQueryKeys("example");
    const query = { pageNumber: 2, pageSize: 10 };

    expect(keys.all).toEqual(["example"]);
    expect(keys.list()).toEqual(["example", "list"]);
    expect(keys.page(query)).toEqual(["example", "list", query]);
    expect(keys.detail(7)).toEqual(["example", "detail", 7]);
    expect(keys.lookup()).toEqual(["example", "lookup"]);
  });
});
