import type { CountryFormData } from "../types/Country";

const countryMockSamples: readonly CountryFormData[] = [
  { nameAr: "مصر", nameEn: "Egypt", alpha2Code: "EG", alpha3Code: "EGY", phoneCode: "20", currencyCode: "EGP" },
  { nameAr: "السعودية", nameEn: "Saudi Arabia", alpha2Code: "SA", alpha3Code: "SAU", phoneCode: "966", currencyCode: "SAR" },
  { nameAr: "الإمارات", nameEn: "United Arab Emirates", alpha2Code: "AE", alpha3Code: "ARE", phoneCode: "971", currencyCode: "AED" },
  { nameAr: "الأردن", nameEn: "Jordan", alpha2Code: "JO", alpha3Code: "JOR", phoneCode: "962", currencyCode: "JOD" },
  { nameAr: "المغرب", nameEn: "Morocco", alpha2Code: "MA", alpha3Code: "MAR", phoneCode: "212", currencyCode: "MAD" },
  { nameAr: "تونس", nameEn: "Tunisia", alpha2Code: "TN", alpha3Code: "TUN", phoneCode: "216", currencyCode: "TND" },
  { nameAr: "الجزائر", nameEn: "Algeria", alpha2Code: "DZ", alpha3Code: "DZA", phoneCode: "213", currencyCode: "DZD" },
  { nameAr: "عمان", nameEn: "Oman", alpha2Code: "OM", alpha3Code: "OMN", phoneCode: "968", currencyCode: "OMR" },
  { nameAr: "قطر", nameEn: "Qatar", alpha2Code: "QA", alpha3Code: "QAT", phoneCode: "974", currencyCode: "QAR" },
  { nameAr: "البحرين", nameEn: "Bahrain", alpha2Code: "BH", alpha3Code: "BHR", phoneCode: "973", currencyCode: "BHD" },
  { nameAr: "الكويت", nameEn: "Kuwait", alpha2Code: "KW", alpha3Code: "KWT", phoneCode: "965", currencyCode: "KWD" },
  { nameAr: "لبنان", nameEn: "Lebanon", alpha2Code: "LB", alpha3Code: "LBN", phoneCode: "961", currencyCode: "LBP" },
];

/**
 * Returns a consistent country sample without repeating one in the current form
 * session. Names and ISO/phone/currency codes always belong to the same country.
 */
export function getNextCountryMockData(
  usedIndexes: Set<number>,
  random: () => number = Math.random,
): CountryFormData {
  if (usedIndexes.size >= countryMockSamples.length) usedIndexes.clear();

  const startIndex = Math.min(
    Math.floor(random() * countryMockSamples.length),
    countryMockSamples.length - 1,
  );
  let index = startIndex;
  while (usedIndexes.has(index)) index = (index + 1) % countryMockSamples.length;

  usedIndexes.add(index);
  return { ...countryMockSamples[index] };
}
