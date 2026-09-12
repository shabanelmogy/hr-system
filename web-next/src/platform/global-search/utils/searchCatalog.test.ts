import { describe, expect, it } from "vitest";
import {
  buildSearchCatalog,
  filterSearchCatalog,
  normalizeSearchText,
} from "./searchCatalog";

const translate = (key: string) =>
  ({
    "menu.basicData": "Basic Data",
    "menu.geographicData": "Geographic Data",
    "menu.countries": "Countries",
    "menu.states": "States",
  })[key] ?? key;

describe("global search catalog", () => {
  const navigation = [
    {
      title: "menu.basicData",
      items: [
        {
          title: "menu.geographicData",
          items: [
            { title: "menu.countries", path: "/basic-data/countries" },
            { title: "menu.states", path: "/basic-data/states" },
          ],
        },
      ],
    },
  ];

  it("flattens only the supplied permission-filtered navigation tree", () => {
    const catalog = buildSearchCatalog(navigation, translate);

    expect(catalog).toHaveLength(2);
    expect(catalog[0]).toMatchObject({
      title: "Countries",
      category: "Geographic Data",
      path: "/basic-data/countries",
      breadcrumbs: ["Basic Data", "Geographic Data"],
    });
  });

  it("matches translated labels and parent breadcrumbs", () => {
    const catalog = buildSearchCatalog(navigation, translate);

    expect(filterSearchCatalog(catalog, "geo countries", 2, 10)).toHaveLength(1);
    expect(filterSearchCatalog(catalog, "basic", 2, 10)).toHaveLength(2);
  });

  it("honors minimum length and result limits", () => {
    const catalog = buildSearchCatalog(navigation, translate);

    expect(filterSearchCatalog(catalog, "s", 2, 10)).toEqual([]);
    expect(filterSearchCatalog(catalog, "data", 2, 1)).toHaveLength(1);
  });

  it("normalizes case and diacritics", () => {
    expect(normalizeSearchText("  ÉMPLoyées  ")).toBe("employees");
  });
});

