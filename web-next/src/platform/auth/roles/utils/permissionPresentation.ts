import type { RoleClaimsFormData } from "./validation";

export interface PermissionParts {
  action: string;
  resource: string;
}

export interface PermissionBusinessModuleSummary {
  code: string;
  permissionCount: number;
  screenCount: number;
  selectedCount: number;
}

const standardActionOrder = [
  "View",
  "Create",
  "Edit",
  "SetCurrent",
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

export function splitPermission(value: string): PermissionParts | null {
  const separator = value.indexOf(":");
  if (separator <= 0 || separator === value.length - 1) return null;
  return { resource: value.slice(0, separator), action: value.slice(separator + 1) };
}

export function summarizePermissionBusinessModules(
  claims: RoleClaimsFormData["roleClaims"],
): PermissionBusinessModuleSummary[] {
  const modules = new Map<string, {
    code: string;
    permissionCount: number;
    screens: Set<string>;
    selectedCount: number;
  }>();

  for (const claim of claims) {
    const normalizedCode = claim.moduleCode.trim().toLowerCase();
    if (!normalizedCode) continue;
    const current = modules.get(normalizedCode) ?? {
      code: claim.moduleCode.trim(),
      permissionCount: 0,
      screens: new Set<string>(),
      selectedCount: 0,
    };
    const parsed = splitPermission(claim.displayValue);
    if (parsed) current.screens.add(parsed.resource.toLowerCase());
    current.permissionCount += 1;
    if (claim.isSelected) current.selectedCount += 1;
    modules.set(normalizedCode, current);
  }

  return [...modules.values()]
    .map(({ code, permissionCount, screens, selectedCount }) => ({
      code,
      permissionCount,
      screenCount: screens.size,
      selectedCount,
    }))
    .sort((left, right) => left.code.localeCompare(right.code));
}
