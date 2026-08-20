import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Language as LanguageIcon,
  Phone as PhoneIcon,
  AttachMoney as CurrencyIcon,
  Code as CodeIcon,
  FactCheck as StatusIcon,
} from "@mui/icons-material";
import { ColumnConfig } from "./types";

export const useCountryColumns = (): ColumnConfig[] => {
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
        headerName: t("countries.englishName"),
        mobileHeader: "EN",
        icon: <LanguageIcon />,
      },
      {
        field: "alpha2Code",
        headerName: t("countries.alpha2Code"),
        mobileHeader: "A2",
        icon: <CodeIcon />,
        type: "chip",
      },
      {
        field: "alpha3Code",
        headerName: t("countries.alpha3Code"),
        mobileHeader: "A3",
        icon: <CodeIcon />,
        type: "chip",
      },
      {
        field: "phoneCode",
        headerName: t("countries.phoneCode"),
        mobileHeader: t("countries.phoneCode"),
        icon: <PhoneIcon />,
        type: "chip",
      },
      {
        field: "currencyCode",
        headerName: t("countries.currencyCode"),
        mobileHeader: t("countries.currencyCode"),
        icon: <CurrencyIcon />,
        type: "chip",
      },
      {
        field: "importStatus",
        headerName: t("imports.status"),
        mobileHeader: t("imports.status"),
        icon: <StatusIcon />,
        type: "chip",
      },
    ],
    [t]
  );
};
