import { apiRoutes } from "@/config";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CountryService, { toCountryRequest } from "./countryService";

const { post } = vi.hoisted(() => ({ post: vi.fn() }));

vi.mock("@/shared/services/apiService", () => ({
  default: { post },
}));

describe("toCountryRequest", () => {
  beforeEach(() => {
    post.mockReset();
  });

  it("matches the API nullability and normalizes code fields", () => {
    expect(
      toCountryRequest({
        nameAr: " مصر ",
        nameEn: " Egypt ",
        alpha2Code: " eg ",
        alpha3Code: "egy",
        phoneCode: " 20 ",
        currencyCode: " egp ",
      }),
    ).toEqual({
      nameAr: "مصر",
      nameEn: "Egypt",
      alpha2Code: "EG",
      alpha3Code: "EGY",
      phoneCode: "20",
      currencyCode: "EGP",
    });
  });

  it("sends blank optional form fields as null", () => {
    expect(
      toCountryRequest({
        nameAr: "مصر",
        nameEn: "Egypt",
        alpha2Code: " ",
        alpha3Code: "",
        phoneCode: " ",
        currencyCode: "",
      }),
    ).toMatchObject({
      alpha2Code: null,
      alpha3Code: null,
      phoneCode: null,
      currencyCode: null,
    });
  });

  it("posts the exact bulk archive contract", async () => {
    post.mockResolvedValue({ archivedCount: 2 });

    await expect(CountryService.archiveBulk([3, 7])).resolves.toEqual({ archivedCount: 2 });

    expect(post).toHaveBeenCalledWith(apiRoutes.countries.bulkArchive, { ids: [3, 7] });
  });
});
