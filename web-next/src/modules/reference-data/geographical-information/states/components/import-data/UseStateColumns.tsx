import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Language as LanguageIcon,
  Map as MapIcon,
  Tag as CodeIcon,
  FactCheck as StatusIcon,
  ErrorOutlined as ErrorIcon,
} from "@mui/icons-material";
import { ColumnConfig } from "./types";

export const useStateImportColumns = (): ColumnConfig[] => {
  const { t } = useTranslation();

  return useMemo(
    () => [
      {
        field: "nameAr",
        headerName: t("countries.arabicName"),
        mobileHeader: "AR",
        icon: <LanguageIcon />,
      },
      {
        field: "nameEn",
        headerName: t("states.name"),
        mobileHeader: "EN",
        icon: <LanguageIcon />,
      },
      {
        field: "code",
        headerName: t("states.code"),
        mobileHeader: t("states.code"),
        icon: <CodeIcon />,
        type: "chip",
      },
      {
        field: "countryName",
        headerName: t("states.countryName"),
        mobileHeader: t("states.countryName"),
        icon: <MapIcon />,
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
    [t]
  );
};
