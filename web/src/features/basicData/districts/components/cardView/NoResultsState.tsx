import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { SearchOff } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

interface NoResultsStateProps {
  searchTerm: string;
  onClearSearch: () => void;
  onClearFilters?: () => void;
  onRefresh?: () => void;
}

const NoResultsState: React.FC<NoResultsStateProps> = ({
  searchTerm,
  onClearSearch,
  onClearFilters,
  onRefresh,
}) => {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 300,
        gap: 2,
        textAlign: "center",
        p: 3,
      }}
    >
      <SearchOff sx={{ fontSize: 64, color: "text.secondary" }} />
      <Typography variant="h6" color="text.secondary">
        {t("feedback.noResults.noDistrictsFound")}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {searchTerm
          ? t("feedback.noResults.noMatchWithTerm", { term: searchTerm })
          : t("feedback.noResults.noAvailableWithFilters")}
      </Typography>
      <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
        {searchTerm && (
          <Button variant="outlined" onClick={onClearSearch}>
            {t("feedback.noResults.clearSearch")}
          </Button>
        )}
        {onClearFilters && (
          <Button variant="outlined" onClick={onClearFilters}>
            {t("feedback.noResults.clearFilters")}
          </Button>
        )}
        {onRefresh && (
          <Button variant="outlined" onClick={onRefresh}>
            {t("feedback.noResults.refresh")}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default NoResultsState;