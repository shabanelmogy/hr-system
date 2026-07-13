import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Language as LanguageIcon,
  Phone as PhoneIcon,
  AttachMoney as CurrencyIcon,
  Code as CodeIcon,
} from "@mui/icons-material";
import { ColumnConfig } from "./types";

export const useCountryColumns = (): ColumnConfig[] => {
  const { t } = useTranslation();

  return useMemo(
    () => [
      {
        field: "nameAr",
        headerName: t("countries.arabicName") || "Name (AR)",
        mobileHeader: "AR",
        icon: <LanguageIcon />,
      },
      {
        field: "nameEn",
        headerName: t("countries.englishName") || "Name (EN)",
        mobileHeader: "EN",
        icon: <LanguageIcon />,
      },
      {
        field: "alpha2Code",
        headerName: t("countries.alpha2Code") || "Alpha-2",
        mobileHeader: "A2",
        icon: <CodeIcon />,
        type: "chip",
      },
      {
        field: "alpha3Code",
        headerName: t("countries.alpha3Code") || "Alpha-3",
        mobileHeader: "A3",
        icon: <CodeIcon />,
        type: "chip",
      },
      {
        field: "phoneCode",
        headerName: t("countries.phoneCode") || "Phone",
        mobileHeader: t("countries.phoneCode") || "Phone",
        icon: <PhoneIcon />,
        type: "chip",
      },
      {
        field: "currencyCode",
        headerName: t("countries.currencyCode") || "Currency",
        mobileHeader: t("countries.currencyCode") || "Curr",
        icon: <CurrencyIcon />,
        type: "chip",
      },
    ],
    [t]
  );
};
