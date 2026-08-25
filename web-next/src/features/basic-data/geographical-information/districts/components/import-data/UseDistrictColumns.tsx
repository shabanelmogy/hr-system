import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Language as LanguageIcon,
  Map as StateIcon,
  Tag as CodeIcon,
  FactCheck as StatusIcon,
  ErrorOutlined as ErrorIcon,
} from "@mui/icons-material";
import type { ColumnConfig } from "./types";

export const useDistrictImportColumns = (): ColumnConfig[] => {
  const { t } = useTranslation();

  return useMemo(
    () => [
      {
        field: "nameAr",
        headerName: t("general.nameAr"),
        mobileHeader: "AR",
        icon: <LanguageIcon />,
      },
      {
        field: "nameEn",
        headerName: t("general.nameEn"),
        mobileHeader: "EN",
        icon: <LanguageIcon />,
      },
      {
        field: "code",
        headerName: t("districts.code"),
        mobileHeader: t("districts.code"),
        icon: <CodeIcon />,
        type: "chip",
      },
      {
        field: "stateName",
        headerName: t("districts.stateName"),
        mobileHeader: t("districts.stateName"),
        icon: <StateIcon />,
        type: "chip",
      },
      {
        field: "importStatus",
        headerName: t("imports.status"),
        mobileHeader: t("imports.status"),
        icon: <StatusIcon />,
        type: "chip",
      },
      {
        field: "errorMessage",
        headerName: t("imports.errorDetails"),
        mobileHeader: t("imports.errorDetails"),
        icon: <ErrorIcon />,
      },
    ],
    [t],
  );
};
