export const DEFAULT_DELETE_CONFIRMATION = "DELETE";

export function matchesConfirmationText(value: string, keyword: string): boolean {
  const expected = keyword.trim();
  return expected.length > 0 && value.trim() === expected;
}
