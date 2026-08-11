import { describe, expect, it } from "vitest";
import type { AppPath } from "@/config/routes";
import {
  findActiveNavigationTrail,
  flattenFeatureNavigation,
  isFeaturePathActive,
} from "./navigation";
import type { FeatureModuleNavigationItem } from "./types";

const path = (value: string) => value as AppPath;

const navigation: readonly FeatureModuleNavigationItem[] = [
  {
    id: "geography",
    label: "Geography",
    href: path("/basic-data"),
    icon: null,
    children: [
      {
        id: "countries",
        label: "Countries",
        href: path("/basic-data/countries"),
        icon: null,
      },
      {
        id: "states",
        label: "States",
        href: path("/basic-data/states"),
        icon: null,
      },
    ],
  },
];

describe("feature module navigation", () => {
  it("matches route boundaries instead of similar prefixes", () => {
    expect(isFeaturePathActive("/basic-data/countries", "/basic-data/countries")).toBe(true);
    expect(isFeaturePathActive("/basic-data/countries/1", "/basic-data/countries")).toBe(true);
    expect(isFeaturePathActive("/basic-data/countries-archive", "/basic-data/countries")).toBe(false);
  });

  it("returns the complete active breadcrumb trail", () => {
    expect(findActiveNavigationTrail(navigation, "/basic-data/countries").map((item) => item.id)).toEqual([
      "geography",
      "countries",
    ]);
  });

  it("flattens only navigable leaf items for compact navigation", () => {
    expect(flattenFeatureNavigation(navigation).map((item) => item.id)).toEqual([
      "countries",
      "states",
    ]);
  });
});
