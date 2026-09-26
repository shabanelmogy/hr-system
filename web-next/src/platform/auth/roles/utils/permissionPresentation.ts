import type { RoleClaimsFormData } from "./validation";

const standardActionOrder = [
  "View",
  "Create",
  "Edit",
  "Approve",
  "Submit",
  "Review",
  "Archive",
  "Restore",
  "Delete",
] as const;

const actionPriority = new Map<string, number>(
  standardActionOrder.map((action, index) => [action.toLowerCase(), index]),
);

export function sortPermissionActions(actions: readonly string[]): string[] {
  return [...actions].sort((left, right) => {
    const leftPriority = actionPriority.get(left.toLowerCase());
    const rightPriority = actionPriority.get(right.toLowerCase());

    if (leftPriority !== undefined || rightPriority !== undefined) {
      return (leftPriority ?? Number.MAX_SAFE_INTEGER) -
        (rightPriority ?? Number.MAX_SAFE_INTEGER);
    }

    return left.localeCompare(right);
  });
}

export function countChangedClaims(
  current: RoleClaimsFormData["roleClaims"],
  baseline: RoleClaimsFormData["roleClaims"],
): number {
  const baselineSelection = new Map(
    baseline.map((claim) => [claim.displayValue.toLowerCase(), claim.isSelected]),
  );

  return current.reduce((count, claim) => {
    const previousSelection = baselineSelection.get(claim.displayValue.toLowerCase());
    return count + (previousSelection !== claim.isSelected ? 1 : 0);
  }, 0);
}
