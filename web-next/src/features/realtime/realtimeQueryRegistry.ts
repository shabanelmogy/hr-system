import { appointmentKeys } from "@/features/appointments";
import { addressTypeKeys } from "@/features/basic-data/geographical-information/address-types";
import { countryKeys } from "@/features/basic-data/geographical-information/countries";
import { districtKeys } from "@/features/basic-data/geographical-information/districts";
import { stateKeys } from "@/features/basic-data/geographical-information/states";

type QueryKey = readonly unknown[];

export const realtimeResources = {
  countries: "countries",
  states: "states",
  districts: "districts",
  addressTypes: "address-types",
  addresses: "addresses",
  users: "users",
  appointments: "appointments",
} as const;

const queryKeysByResource: Readonly<Record<string, readonly QueryKey[]>> = {
  [realtimeResources.countries]: [countryKeys.all, stateKeys.all],
  [realtimeResources.states]: [stateKeys.all, countryKeys.all, districtKeys.all],
  [realtimeResources.districts]: [districtKeys.all, stateKeys.all],
  [realtimeResources.addressTypes]: [addressTypeKeys.all],
  [realtimeResources.addresses]: [],
  [realtimeResources.users]: [],
  [realtimeResources.appointments]: [appointmentKeys.all],
};

export function getRealtimeQueryKeys(resource: string): readonly QueryKey[] {
  return queryKeysByResource[resource] ?? [];
}

export function getAllRealtimeQueryKeys(): readonly QueryKey[] {
  const keys = new Map<string, QueryKey>();

  Object.values(queryKeysByResource).flat().forEach((queryKey) => {
    keys.set(JSON.stringify(queryKey), queryKey);
  });

  return [...keys.values()];
}
