import type {
  UpdateWorkforcePlanRequest,
  WorkforcePlanDetail,
  WorkforcePlanLineRequest,
} from '../models/workforce-plan';

export function workforcePlanMatchesDraftUpdate(
  server: WorkforcePlanDetail,
  request: UpdateWorkforcePlanRequest,
): boolean {
  if (
    server.titleEn !== request.titleEn ||
    server.titleAr !== request.titleAr ||
    normalizeOptional(server.description) !== normalizeOptional(request.description)
  ) {
    return false;
  }

  return JSON.stringify(canonicalLines(server.lines)) === JSON.stringify(canonicalLines(request.lines));
}

function canonicalLines(lines: readonly WorkforcePlanLineRequest[]) {
  return lines.map((line) => ({
    positionId: line.positionId,
    targetBranchId: line.targetBranchId ?? null,
    newHireSlots: line.newHireSlots,
    replacementSlots: line.replacementSlots,
    justification: normalizeOptional(line.justification),
    periodTargets: [...line.periodTargets]
      .map((target) => ({
        fiscalPeriodId: target.fiscalPeriodId,
        newHireSlots: target.newHireSlots,
        replacementSlots: target.replacementSlots,
      }))
      .sort((left, right) => left.fiscalPeriodId - right.fiscalPeriodId),
  })).sort((left, right) =>
    left.positionId - right.positionId ||
    (left.targetBranchId ?? 0) - (right.targetBranchId ?? 0)
  );
}

function normalizeOptional(value: string | null | undefined): string | null {
  return value?.trim() || null;
}
