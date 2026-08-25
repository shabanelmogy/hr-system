import {
  ErrorOutlined as ErrorIcon,
  FactCheck as StatusIcon,
  Language as LanguageIcon,
} from "@mui/icons-material";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { AddressTypeImportColumn } from "./types";

export const useAddressTypeColumns = (): AddressTypeImportColumn[] => {
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
