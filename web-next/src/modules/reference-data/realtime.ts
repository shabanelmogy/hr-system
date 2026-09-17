import { registerRealtimeQueryKeys } from "@/platform/realtime/registry";
import { addressTypeKeys } from "./geographical-information/address-types/hooks/addressTypeQueryKeys";
import { countryKeys } from "./geographical-information/countries/hooks/countryQueryKeys";
import { districtKeys } from "./geographical-information/districts/hooks/districtQueryKeys";
import { stateKeys } from "./geographical-information/states/hooks/stateQueryKeys";

export const referenceDataRealtimeResources = {
  countries: "countries",
  states: "states",
  districts: "districts",
  addressTypes: "address-types",
  addresses: "addresses",
} as const;

export function registerReferenceDataRealtimeResources() {
  registerRealtimeQueryKeys({
    [referenceDataRealtimeResources.countries]: [countryKeys.all, stateKeys.all],
    [referenceDataRealtimeResources.states]: [stateKeys.all, countryKeys.all, districtKeys.all],
    [referenceDataRealtimeResources.districts]: [districtKeys.all, stateKeys.all],
    [referenceDataRealtimeResources.addressTypes]: [addressTypeKeys.all],
    [referenceDataRealtimeResources.addresses]: [],
  });
}
