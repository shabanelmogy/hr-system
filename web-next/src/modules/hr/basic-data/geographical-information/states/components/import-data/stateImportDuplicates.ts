import type { CreateStateRequest } from "../../types/State";

export interface StateImportDuplicateTracker {
  nameAr: Set<string>;
  nameEn: Set<string>;
  code: Set<string>;
}

export const createStateImportDuplicateTracker = (): StateImportDuplicateTracker => ({
  nameAr: new Set<string>(),
  nameEn: new Set<string>(),
  code: new Set<string>(),
});

const keyFor = (countryId: number, value: string) =>
  `${countryId}:${value.trim().toLowerCase()}`;

export function registerStateImportValues(
  tracker: StateImportDuplicateTracker,
  countryId: number,
  state: Pick<CreateStateRequest, "nameAr" | "nameEn" | "code">,
): boolean {
  const nameArKey = keyFor(countryId, state.nameAr);
  const nameEnKey = keyFor(countryId, state.nameEn);
  const codeKey = keyFor(countryId, state.code);

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
