import React, { useState } from "react";
import {
  Box,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
  Select,
  MenuItem,
  FormControl,
  Menu,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  FileDownload as DownloadIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  Search as SearchIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  GetApp as ExportIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import BackButton from "@/shared/components/navigation/BackButton";

const ToolbarContainer = styled(Paper)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
  gap: theme.spacing(2),
  flexWrap: "wrap",
}));

export interface ExcelToolbarProps {
  sheetNames: string[];
  currentSheetIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onSheetSelect: (index: number) => void;
  searchTerm: string;
  onSearch: (value: string) => void;
  rowsCount: number;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onDownload: () => void;
  onBack?: () => void;
  onPrint?: () => void;
  onRefresh?: () => void;
  onExport?: () => void;
  onInfo?: () => void;
}

const ExcelToolbar: React.FC<ExcelToolbarProps> = ({
  sheetNames,
  currentSheetIndex,
  onPrev,
  onNext,
  onSheetSelect,
  searchTerm,
  onSearch,
  rowsCount,
  isFullscreen,
  onToggleFullscreen,
  onDownload,
  onBack,
  onPrint,
  onRefresh,
  onExport,
  onInfo,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const isSm = useMediaQuery(theme.breakpoints.down("md"));
  const isMd = useMediaQuery(theme.breakpoints.down("lg"));
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  return (
    <ToolbarContainer elevation={0}>
      <Box
        sx={{ display: "flex", flexDirection: "column", gap: 1, width: "100%" }}
      >
        {/* First Row */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: { xs: 1, sm: 2 },
          }}
        >
          {/* Left Section - Navigation */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {onBack && (
              <BackButton
                onClick={onBack}
                size="small"
                ariaLabel="Back"
              />
            )}
            {!isXs && (
              <>
                <Tooltip title={t("files.previousSheet")}>
                  <span>
                    <IconButton
                      size="small"
                      onClick={onPrev}
                      disabled={currentSheetIndex === 0}
                    >
                      <PrevIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title={t("files.nextSheet")}>
                  <span>
                    <IconButton
                      size="small"
                      onClick={onNext}
                      disabled={currentSheetIndex === sheetNames.length - 1}
                    >
                      <NextIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </>
            )}
          </Box>

          {/* Center Section - Empty for small screens */}
          <Box sx={{ flex: 1 }}>
            {!isSm && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  justifyContent: "center",
                }}
              >
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={currentSheetIndex}
                    onChange={(e) => onSheetSelect(Number(e.target.value))}
                    displayEmpty
                  >
                    {sheetNames.map((name, index) => (
                      <MenuItem key={index} value={index}>
                        {name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  size="small"
                  placeholder={t("files.search")}
                  value={searchTerm}
                  onChange={(e) => onSearch(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
                      ),
                    }
                  }}
                  sx={{ width: "100%", maxWidth: 200 }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    whiteSpace: "nowrap"
                  }}>
                  {rowsCount} rows
                </Typography>
              </Box>
            )}
          </Box>

          {/* Right Section - Actions */}
          <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
            {/* Large screens - show all actions */}
            {!isMd && (
              <>
                {onRefresh && (
                  <Tooltip title={t("files.refresh")}>
                    <IconButton size="small" onClick={onRefresh}>
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                {onPrint && (
                  <Tooltip title={t("files.print")}>
                    <IconButton size="small" onClick={onPrint}>
                      <PrintIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                {onExport && (
                  <Tooltip title={t("files.export")}>
                    <IconButton size="small" onClick={onExport}>
                      <ExportIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </>
            )}

            {/* Always show download and fullscreen */}
            <Tooltip title={t("files.download")}>
              <IconButton size="small" onClick={onDownload}>
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip
              title={
                isFullscreen ? t("media.exitFullscreen") : t("media.fullscreen")
              }
            >
              <IconButton size="small" onClick={onToggleFullscreen}>
                {isFullscreen ? (
                  <FullscreenExitIcon fontSize="small" />
                ) : (
                  <FullscreenIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>

            {/* Show menu for smaller screens */}
            {(isMd || isSm || isXs) && (
              <Tooltip title={t("files.more")}>
                <IconButton
                  size="small"
                  onClick={(e) => setMenuAnchor(e.currentTarget)}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Second Row - Sheet Select & Search for small screens */}
        {isSm && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              justifyContent: "center",
            }}
          >
            <FormControl size="small" sx={{ minWidth: { xs: 80, sm: 120 } }}>
              <Select
                value={currentSheetIndex}
                onChange={(e) => onSheetSelect(Number(e.target.value))}
                displayEmpty
              >
                {sheetNames.map((name, index) => (
                  <MenuItem key={index} value={index}>
                    {isXs ? `S${index + 1}` : name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              size="small"
              placeholder={t("files.searchInSheet")}
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                }
              }}
              sx={{ width: "100%", maxWidth: 300 }}
            />
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                whiteSpace: "nowrap"
              }}>
              {rowsCount} rows
            </Typography>
          </Box>
        )}
      </Box>
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        {/* XS screens - show all menu items */}
        {isXs && (
          <>
            <MenuItem
              onClick={() => {
                onPrev();
                setMenuAnchor(null);
              }}
              disabled={currentSheetIndex === 0}
            >
              Previous Sheet
            </MenuItem>
            <MenuItem
              onClick={() => {
                onNext();
                setMenuAnchor(null);
              }}
              disabled={currentSheetIndex === sheetNames.length - 1}
            >
              Next Sheet
            </MenuItem>

            {onRefresh && (
              <MenuItem
                onClick={() => {
                  onRefresh();
                  setMenuAnchor(null);
                }}
              >
                Refresh
              </MenuItem>
            )}
            {onPrint && (
              <MenuItem
                onClick={() => {
                  onPrint();
                  setMenuAnchor(null);
                }}
              >
                Print
              </MenuItem>
            )}
            {onExport && (
              <MenuItem
                onClick={() => {
                  onExport();
                  setMenuAnchor(null);
                }}
              >
                Export
              </MenuItem>
            )}
            {onInfo && (
              <MenuItem
                onClick={() => {
                  onInfo();
                  setMenuAnchor(null);
                }}
              >
                Info
              </MenuItem>
            )}
          </>
        )}

        {/* SM/MD screens - show hidden actions */}
        {(isSm || isMd) && !isXs && (
          <>
            {onRefresh && (
              <MenuItem
                onClick={() => {
                  onRefresh();
                  setMenuAnchor(null);
                }}
              >
                Refresh
              </MenuItem>
            )}
            {onPrint && (
              <MenuItem
                onClick={() => {
                  onPrint();
                  setMenuAnchor(null);
                }}
              >
                Print
              </MenuItem>
            )}
            {onExport && (
              <MenuItem
                onClick={() => {
                  onExport();
                  setMenuAnchor(null);
                }}
              >
                Export
              </MenuItem>
            )}
            {onInfo && (
              <MenuItem
                onClick={() => {
                  onInfo();
                  setMenuAnchor(null);
                }}
              >
                Info
              </MenuItem>
            )}
          </>
        )}
      </Menu>
    </ToolbarContainer>
  );
};

export default ExcelToolbar;
