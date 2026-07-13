/* eslint-disable react/prop-types */
import { Box, Chip, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

const MySubItemsDisplay = ({
  label,
  subItems,
  isSelected,
  textColor,
  // Display style: "inline" (label beside chips), "stacked" (label above chips in separate row)
  displayStyle = "inline",
  // Name key options
  arabicNameKey = "nameAr",
  englishNameKey = "nameEn",
  labelKey = null,
  // Message keys
  noItemsMessage = "noSubCategories",
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const getItemLabel = (item) => {
    if (labelKey && item[labelKey]) {
      return item[labelKey];
    }

    if (theme.direction === "rtl" && item[arabicNameKey]) {
      return item[arabicNameKey];
    } else if (item[englishNameKey]) {
      return item[englishNameKey];
    }

    return String(item.id || item.name || "—");
  };

  // Common chips box rendering
  const renderChips = () =>
    Array.isArray(subItems) && subItems.length > 0 ? (
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
        {subItems.map((sub, i) => (
          <Chip
            key={i}
            label={getItemLabel(sub)}
            size="small"
            variant="outlined"
            sx={{
              fontSize: "0.75rem",
              borderRadius: "16px",
              padding: "2px 4px",
              borderColor: "primary.light",
              backgroundColor: "rgba(0, 0, 0, 0.02)",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.08)",
                borderColor: "primary.main",
                boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
              },
              transition: "all 0.2s ease",
              fontWeight: 500,
            }}
          />
        ))}
      </Box>
    ) : (
      <Typography variant="caption" color="text.secondary">
        {t(noItemsMessage)}
      </Typography>
    );

  // Stacked style (label on top row, chips below)
  if (displayStyle === "stacked") {
    return (
      <Box>
        <Typography
          variant="body2"
          sx={{
            fontWeight: "bold",
            color: isSelected ? textColor : "primary.main",
            mb: 0.5,
          }}
        >
          {label}:
        </Typography>
        <Box sx={{ color: textColor }}>{renderChips()}</Box>
      </Box>
    );
  }

  // Inline style (label beside chips on same row)
  return (
    <Box sx={{ display: "flex", gap: 2 }}>
      <Box
        sx={{
          fontWeight: "bold",
          minWidth: "120px",
          color: isSelected ? textColor : "primary.main",
        }}
      >
        {label}:
      </Box>
      <Box sx={{ color: textColor }}>{renderChips()}</Box>
    </Box>
  );
};

export default MySubItemsDisplay;
