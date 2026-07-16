import { AttachMoney, Flag, Phone } from "@mui/icons-material";
import { Box, Chip, Typography } from "@mui/material";
import type { GridRenderCellParams } from "@mui/x-data-grid";
import type { Country } from "../../types/Country";

export const renderCountryName =
  (showFlag = true) =>
  function CountryNameCell({ value }: GridRenderCellParams<Country>): React.ReactNode {
    if (value == null || value === "") return "";
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", gap: 1 }}>
        {showFlag ? <Flag sx={{ fontSize: 16, color: "primary.main" }} /> : null}
        <Typography variant="body2" noWrap>{String(value)}</Typography>
      </Box>
    );
  };

export const renderPhoneCode = ({ value }: GridRenderCellParams<Country>): React.ReactNode => {
  if (value == null || value === "") return "";
  const normalizedCode = String(value).replace(/^\+/, "");
  return (
    <Chip
      label={`+${normalizedCode}`}
      size="small"
      variant="outlined"
      color="primary"
      icon={<Phone sx={{ fontSize: 12 }} />}
    />
  );
};

export const renderCurrencyCode = ({ value }: GridRenderCellParams<Country>): React.ReactNode =>
  value == null || value === "" ? "" : (
    <Chip
      label={String(value)}
      size="small"
      color="secondary"
      icon={<AttachMoney sx={{ fontSize: 12 }} />}
    />
  );

export const renderCountryInfo = ({ value }: GridRenderCellParams): React.ReactNode => {
  const country = asCountry(value);
  if (!country) return "-";
  return (
    <Box sx={{ textAlign: "center" }}>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>{country.nameEn}</Typography>
      <Typography variant="caption" color="text.secondary">{country.nameAr}</Typography>
    </Box>
  );
};

function asCountry(value: unknown): Pick<Country, "nameAr" | "nameEn"> | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  return {
    nameAr: typeof record.nameAr === "string" ? record.nameAr : "",
    nameEn: typeof record.nameEn === "string" ? record.nameEn : "",
  };
}
