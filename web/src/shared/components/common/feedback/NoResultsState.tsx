import React from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Paper,
  Typography,
  useTheme,
  SvgIconProps,
  Chip,
  Stack,
  Divider,
  TextField,
  InputAdornment,
} from "@mui/material";
import { alpha } from '@mui/material/styles';
import { Search, FilterList, Clear, Refresh, RestartAlt } from "@mui/icons-material";

interface NoResultsStateProps {
  /** The search term or filter criteria that produced no results */
  searchTerm?: string;
  /** Custom message to display instead of default */
  message?: string;
  /** Subtitle or additional context */
  subtitle?: string;
  /** Handler for clearing search/filters */
  onClearSearch?: () => void;
  /** Handler for clearing all filters */
  onClearFilters?: () => void;
  /** Handler for refreshing data */
  onRefresh?: () => void;
  /** Custom icon to display */
  icon?: React.ComponentType<SvgIconProps>;
  /** Whether to show the component in a Paper container */
  withPaper?: boolean;
  /** Custom styling for the container */
  sx?: object;
  /** Size variant for the icon */
  iconSize?: "small" | "medium" | "large";
  /** Custom action button */
  customAction?: {
    text: string;
    handler: () => void;
    icon?: React.ComponentType<SvgIconProps>;
    variant?: "contained" | "outlined" | "text";
  };
  /** Show a search input under the message */
  showSearch?: boolean;
  /** Placeholder for the search input */
  searchPlaceholder?: string;
  /** Handler for search input changes */
  onSearchChange?: (value: string) => void;
  /** Active filters to render as chips */
  filters?: { label: string; onRemove?: () => void }[];
  /** Optional list of suggestions/tips to help users refine results */
  tips?: string[];
  /** Compact layout spacing */
  compact?: boolean;
  /** Reset all handler */
  onResetAll?: () => void;
  /** Reset all button text override */
  resetAllText?: string;
}

const NoResultsState: React.FC<NoResultsStateProps> = ({
  searchTerm,
  message,
  subtitle,
  onClearSearch,
  onClearFilters,
  onRefresh,
  icon: IconComponent = Search,
  withPaper = true,
  sx = {},
  iconSize = "large",
  customAction,
  showSearch = false,
  searchPlaceholder,
  onSearchChange,
  filters,
  tips,
  compact = false,
  onResetAll,
  resetAllText,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const getIconSize = () => {
    switch (iconSize) {
      case "small":
        return 32;
      case "medium":
        return 40;
      case "large":
        return 64;
      default:
        return 64;
    }
  };

  const getDefaultMessage = () => {
      if (message) return message;
      if (searchTerm) return t("feedback.noResults.messageWithTerm", { term: searchTerm });
      return t("feedback.noResults.message") || "No results found";
  };

  const content = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        py: compact ? 4 : 6,
        px: 3,
        minHeight: compact ? 160 : 200,
        ...sx,
      }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 2,
          bgcolor:
            theme.palette.mode === "dark"
              ? alpha(theme.palette.primary.main, 0.12)
              : alpha(theme.palette.primary.main, 0.08),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        }}
      >
        <IconComponent
          sx={{
            fontSize: getIconSize(),
            color: theme.palette.primary.main,
            opacity: 0.9,
          }}
        />
      </Box>

      <Typography
        variant="h6"
        color="text.primary"
        gutterBottom
        sx={{ fontWeight: 600 }}
      >
        {getDefaultMessage()}
      </Typography>

      {subtitle && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2, maxWidth: 560, opacity: 0.9 }}
        >
          {subtitle}
        </Typography>
      )}

      {showSearch && onSearchChange && (
        <Box sx={{ mt: 1.5, width: "100%", maxWidth: 420 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={searchPlaceholder || t("common.search") || "Search..."}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      )}

      {filters && filters.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap", justifyContent: "center", maxWidth: 560 }}>
          {filters.map((f, idx) => (
            <Chip key={idx} label={f.label} onDelete={f.onRemove} variant="outlined" size="small" />
          ))}
        </Stack>
      )}

      <Stack direction="row" spacing={2} sx={{ mt: 3, flexWrap: "wrap", justifyContent: "center" }}>
        {searchTerm && onClearSearch && (
          <Button
            variant="outlined"
            onClick={onClearSearch}
            startIcon={<Clear />}
            sx={{ minWidth: 120 }}
          >
            {t("feedback.noResults.clearSearch")}
          </Button>
        )}

        {onClearFilters && (
          <Button
            variant="outlined"
            onClick={onClearFilters}
            startIcon={<FilterList />}
            sx={{ minWidth: 120 }}
          >
            {t("feedback.noResults.clearFilters")}
          </Button>
        )}

        {onRefresh && (
          <Button
            variant="text"
            onClick={onRefresh}
            startIcon={<Refresh />}
            sx={{ minWidth: 100 }}
          >
            {t("feedback.noResults.refresh")}
          </Button>
        )}

        {onResetAll && (
          <Button
            variant="text"
            onClick={onResetAll}
            startIcon={<RestartAlt />}
            sx={{ minWidth: 100 }}
          >
            {resetAllText || t("feedback.noResults.resetAll") || "Reset all"}
          </Button>
        )}

        {customAction && (
          <Button
            variant={customAction.variant || "contained"}
            onClick={customAction.handler}
            startIcon={customAction.icon ? <customAction.icon /> : undefined}
            sx={{ minWidth: 120 }}
          >
            {customAction.text}
          </Button>
        )}
      </Stack>

      {tips && tips.length > 0 && (
        <>
          <Divider sx={{ my: 3, width: "100%", maxWidth: 560 }} />
          <Box sx={{ maxWidth: 560 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
              {t("feedback.noResults.trySuggestions") || "Try the following:"}
            </Typography>
            <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2, textAlign: "left" }}>
              {tips.map((tip, idx) => (
                <Typography component="li" key={idx} variant="body2" color="text.secondary">
                  {tip}
                </Typography>
              ))}
            </Stack>
          </Box>
        </>
      )}
    </Box>
  );

  if (withPaper) {
    return (
      <Paper
        variant="outlined"
        elevation={0}
        sx={{
          bgcolor: theme.palette.mode === 'dark'
            ? alpha(theme.palette.background.paper, 0.9)
            : theme.palette.grey[50],
          backgroundImage: theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${alpha(theme.palette.common.white, 0.06)} 0%, ${alpha(theme.palette.common.white, 0.02)} 100%)`
            : `linear-gradient(135deg, ${theme.palette.grey[50]} 0%, ${theme.palette.grey[100]} 100%)`,
          borderColor: theme.palette.mode === 'dark'
            ? alpha(theme.palette.divider, 0.3)
            : theme.palette.divider,
          borderRadius: 2,
        }}
      >
        {content}
      </Paper>
    );
  }

  return content;
};

export default NoResultsState;
