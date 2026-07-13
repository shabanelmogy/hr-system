import React from "react";
import { Tooltip, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { Public } from "@mui/icons-material";
import { alpha, useTheme } from "@mui/material/styles";

const paletteKeys = ["primary", "secondary", "success", "info", "warning", "error"] as const;
type ColorKey = typeof paletteKeys[number];
let lastUsedKey: ColorKey | null = null;

const hashString = (str: string): number => {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0; // Convert to 32bit integer
  }
  return Math.abs(h);
};

const colorKeyFor = (id?: string | number | null, name?: string | null): ColorKey => {
  const base = typeof id === "number" ? id : id ? hashString(String(id)) : name ? hashString(name) : 0;
  const idx = Math.abs(base % paletteKeys.length);
  return paletteKeys[idx];
};

export interface CountryPillProps {
  id?: string | number | null;
  nameEn: string;
  nameAr?: string | null;
  icon?: React.ReactNode;
}

export const CountryPill: React.FC<CountryPillProps> = ({ id, nameEn, nameAr, icon }) => {
  const theme = useTheme();
  let key = colorKeyFor(id ?? null, nameEn ?? null);
  if (lastUsedKey && key === lastUsedKey) {
    const currentIdx = paletteKeys.indexOf(key);
    key = paletteKeys[(currentIdx + 1) % paletteKeys.length];
  }
  lastUsedKey = key;
  const colorMain = theme.palette[key].main;
  const contrast = theme.palette.getContrastText(colorMain);
  const isRTL = theme.direction === "rtl";
  const primaryName = isRTL ? (nameAr ?? nameEn) : nameEn;
  const secondaryName = isRTL ? nameEn : (nameAr ?? null);
  const tooltipTitle = secondaryName ? `${primaryName} / ${secondaryName}` : primaryName;

  return (
    <Tooltip title={tooltipTitle} arrow>
      <Box sx={{ position: "relative", display: "inline-flex", alignItems: "center", mb: 1 }}>
        <Box
          sx={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            height: 28,
            pl: 3.5,
            pr: 1.25,
            borderRadius: 999,
            bgcolor: alpha(colorMain, 0.12),
            border: `1px solid ${alpha(colorMain, 0.35)}`,
          }}
        >
          <Typography variant="caption" sx={{ color: colorMain, fontWeight: "bold", lineHeight: 1 }}>
            {primaryName}
          </Typography>

          <Box
            sx={{
              position: "absolute",
              left: -6,
              top: "50%",
              transform: "translateY(-50%)",
              width: 28,
              height: 28,
              borderRadius: "50%",
              bgcolor: colorMain,
              boxShadow: `0 2px 8px ${alpha(colorMain, 0.25)}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `1px solid ${alpha(contrast, 0.15)}`,
            }}
          >
            {icon || <Public sx={{ fontSize: 16, color: contrast }} />}
          </Box>
        </Box>
      </Box>
    </Tooltip>
  );
};

export default CountryPill;
