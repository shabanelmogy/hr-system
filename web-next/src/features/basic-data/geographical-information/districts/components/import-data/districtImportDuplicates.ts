import type { CreateDistrictRequest } from "../../types/District";

export interface DistrictImportDuplicateTracker {
  nameAr: Set<string>;
  nameEn: Set<string>;
  code: Set<string>;
}

export const createDistrictImportDuplicateTracker = (): DistrictImportDuplicateTracker => ({
  nameAr: new Set<string>(),
  nameEn: new Set<string>(),
  code: new Set<string>(),
});

const keyFor = (stateId: number, value: string) =>
  `${stateId}:${value.trim().toLowerCase()}`;

export function registerDistrictImportValues(
  tracker: DistrictImportDuplicateTracker,
  stateId: number,
  district: Pick<CreateDistrictRequest, "nameAr" | "nameEn" | "code">,
): boolean {
  const nameArKey = keyFor(stateId, district.nameAr);
  const nameEnKey = keyFor(stateId, district.nameEn);
  const codeKey = keyFor(stateId, district.code);

  if (
    tracker.nameAr.has(nameArKey) ||
    tracker.nameEn.has(nameEnKey) ||
    tracker.code.has(codeKey)
  ) {
    return true;
  }

  tracker.nameAr.add(nameArKey);
  tracker.nameEn.add(nameEnKey);
  tracker.code.add(codeKey);
  return false;
}
