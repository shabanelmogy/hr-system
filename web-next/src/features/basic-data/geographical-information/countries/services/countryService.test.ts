import { describe, expect, it } from "vitest";
import { toCountryRequest } from "./countryService";

describe("toCountryRequest", () => {
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
});
