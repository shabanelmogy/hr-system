import { describe, expect, it } from "vitest";
import type { TFunction } from "i18next";
import { getHierarchyLevelSchema } from "./coaHierarchyValidation";

const translate = ((key: string) => key) as TFunction;

describe("coaHierarchyValidation", () => {
  it("coerces numeric text emitted by MyTextField for hierarchy level numbers", () => {
    const result = getHierarchyLevelSchema(translate).parse({
      levelNumber: "3",
      nameAr: "المستوى الثالث",
      nameEn: "Level Three",
      canPost: true,
    });

    expect(result.levelNumber).toBe(3);
  });
});
