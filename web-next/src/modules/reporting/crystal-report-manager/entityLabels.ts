import type { TFunction } from "i18next";

export function getCrystalReportEntityLabel(t: TFunction, entityKey: string): string {
  return t(`crystalReports.entities.${entityKey}`, { defaultValue: entityKey });
}
