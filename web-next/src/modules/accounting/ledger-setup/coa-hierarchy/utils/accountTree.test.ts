import { describe, expect, it } from "vitest";
import { flattenAccountTree } from "./accountTree";

describe("flattenAccountTree", () => {
  it("preserves the hierarchy through explicit parent ids", () => {
    expect(flattenAccountTree([
      {
        id: 10,
        code: "ACC-0010",
        nameAr: "أصول",
        nameEn: "Assets",
        allowPosting: false,
        children: [
          {
            id: 11,
            code: "ACC-0011",
            nameAr: "نقدية",
            nameEn: "Cash",
            allowPosting: true,
            children: [],
          },
        ],
      },
    ])).toEqual([
      expect.objectContaining({ id: 10, parentAccountId: null }),
      expect.objectContaining({ id: 11, parentAccountId: 10 }),
    ]);
  });
});
