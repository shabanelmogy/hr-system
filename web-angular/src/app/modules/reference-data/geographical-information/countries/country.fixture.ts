import { defaultCountryQuery, type CountryDetail, type CountryListItem, type CountryPage, type CountryQuery } from './types/country';
/** Synthetic global reference data, matching the retained Next e2e baseline. */
export const countryFixture: CountryListItem = {
  id: 1, nameAr: 'مصر', nameEn: 'Egypt', alpha2Code: 'EG', alpha3Code: 'EGY',
  phoneCode: '+20', currencyCode: 'EGP', createdOn: '2026-01-01T00:00:00.000Z', updatedOn: null, isDeleted: false, statesCount: 4,
};
export const countryDetailFixture: CountryDetail = { ...countryFixture };
export function countryPageFixture(query: CountryQuery = defaultCountryQuery, items: CountryListItem[] = [countryFixture], totalCount = items.length): CountryPage {
  const totalPages = Math.ceil(totalCount / query.pageSize);
  return { items, metaData: { pageSize: query.pageSize, currentPage: query.pageNumber, pageNumber: query.pageNumber, totalCount, totalPages, hasPrev: query.pageNumber > 1, hasNext: query.pageNumber < totalPages } };
}
