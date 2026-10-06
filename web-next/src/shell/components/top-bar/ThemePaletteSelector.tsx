import { Box, ButtonBase, Typography, alpha, useTheme } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { getTheme, themePaletteOrder, type ThemePalette } from "@app/tokens";
import { useTranslation } from "react-i18next";

type ThemePaletteSelectorProps = {
  value: ThemePalette;
  onChange: (palette: ThemePalette) => void;
};

/**
 * Palette picker shown in the settings menu. Same palettes and order as the
 * mobile `AppThemePalettePicker`; swatches preview each palette in the current mode.
 */
const ThemePaletteSelector = ({ value, onChange }: ThemePaletteSelectorProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const mode = theme.palette.mode;

  return (
    <Box dir={theme.direction} sx={{ px: 1.25, py: 1 }}>
      <Typography
        id="theme-palette-label"
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", fontWeight: 600, mb: 0.75, textAlign: "start" }}
      >
        {t("menu.colorPalette")}
      </Typography>
      <Box
        role="radiogroup"
        aria-labelledby="theme-palette-label"
        sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0.75 }}
      >
        {themePaletteOrder.map((palette) => {
          const selected = palette === value;
          const preview = getTheme(palette, mode).colors;
          const label = t(`menu.palettes.${palette}`);

          return (
            <ButtonBase
              key={palette}
              role="radio"
              aria-checked={selected}
              aria-label={label}
              title={label}
              onClick={() => onChange(palette)}
              sx={{
                flexDirection: "column",
                gap: 0.5,
                p: 0.75,
                borderRadius: 1.5,
                border: `${selected ? 2 : 1}px solid ${
                  selected ? theme.palette.primary.main : theme.palette.divider
                }`,
                backgroundColor: selected
                  ? alpha(theme.palette.primary.main, 0.08)
                  : "transparent",
                "&:hover": { backgroundColor: alpha(theme.palette.primary.main, 0.06) },
                "&.Mui-focusVisible": {
                  outline: `2px solid ${theme.palette.primary.main}`,
                  outlineOffset: 2,
                },
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  display: "flex",
                  gap: 0.5,
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  py: 0.75,
                  borderRadius: 1,
                  backgroundColor: preview.background,
                  border: `1px solid ${preview.border}`,
                }}
              >
                <Box sx={{ width: 18, height: 18, borderRadius: "50%", backgroundColor: preview.primary }} />
                <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: preview.brand2 }} />
                {selected && (
                  <CheckIcon
                    sx={{
                      position: "absolute",
                      top: 2,
                      insetInlineEnd: 2,
                      fontSize: 12,
                      color: preview.primary,
                    }}
                  />
                )}
              </Box>
              <Typography variant="caption" noWrap sx={{ fontSize: "0.7rem", maxWidth: "100%" }}>
                {label}
              </Typography>
            </ButtonBase>
          );
        })}
      </Box>
    </Box>
  );
};

export default ThemePaletteSelector;
