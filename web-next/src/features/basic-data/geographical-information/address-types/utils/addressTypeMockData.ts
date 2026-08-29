import { getNextMockSample } from "@/shared/utils/mockData";
import { addressTypes } from "./fakeData";

export function getNextAddressTypeMockData(
  usedIndexes: Set<number>,
  random: () => number = Math.random,
) {
  return getNextMockSample(addressTypes, usedIndexes, random);
}
