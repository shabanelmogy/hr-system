/** Deliberate cross-feature API for the Districts capability. */
export { default as DistrictsPage } from "./pages/DistrictsPage";
export { districtKeys, useDistrict, useDistrictLookup } from "./hooks/useDistrictQueries";
export type { DistrictLookup, DistrictListItem, DistrictDetail } from "./types/District";
