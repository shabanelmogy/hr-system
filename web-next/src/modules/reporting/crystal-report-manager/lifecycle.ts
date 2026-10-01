import type { CrystalReportValidationStatus } from "./types";

export function canRevalidateCrystalReportVersion(canUpload: boolean, reportArchived: boolean): boolean {
  return canUpload && !reportArchived;
}

export function canPublishCrystalReportVersion(
  validationStatus: CrystalReportValidationStatus,
  canPublish: boolean,
  reportArchived: boolean,
): boolean {
  return canPublish && !reportArchived && validationStatus === "Valid";
}
