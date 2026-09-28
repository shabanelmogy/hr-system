import type { TFunction } from "i18next";
import { z } from "zod";
import { canUseCrystalReportFile } from "./files";

export const getCrystalReportCreateSchema = (t: TFunction) => z.object({
  entityKey: z.string().trim().min(1, t("crystalReports.validation.entityRequired")),
  description: z.string().trim().max(500, t("crystalReports.validation.descriptionLength")),
  file: z
    .custom<File>((value) => typeof File !== "undefined" && value instanceof File, {
      error: t("crystalReports.validation.fileRequired"),
    })
    .refine((value) => canUseCrystalReportFile(value), t("crystalReports.fileHint")),
});

export interface CrystalReportCreateFormValues {
  entityKey: string;
  description: string;
  file: File | null;
}
