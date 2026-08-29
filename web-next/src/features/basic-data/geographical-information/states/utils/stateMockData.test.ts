import { describe, expect, it } from "vitest";
import { getNextStateMockData } from "./stateMockData";

describe("getNextStateMockData", () => {
  it("keeps the generated state tied to the selected country", () => {
    expect(getNextStateMockData(new Set(), 12, () => 0)).toEqual({
      nameAr: "القاهرة",
      nameEn: "Cairo",
      code: "CAI",
      countryId: 12,
    });
  });
});
