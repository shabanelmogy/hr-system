import React from "react";
import { Box, IconButton, Tooltip, Typography, useTheme } from "@mui/material";
import {
  Download,
  Fullscreen,
  Print,
  FirstPage,
  LastPage,
  NavigateBefore,
  NavigateNext,
} from "@mui/icons-material";
import BackButton from "@/shared/components/common/BackButton";
import { useTranslation } from "react-i18next";

interface ToolbarProps {
  onBack: () => void;
  onPrint: () => void;
  onDownload: () => void;
  onFullscreen: () => void;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  onFirst: () => void;
  onPrev: () => void;
  onNext: () => void;
  onLast: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onBack,
  onPrint,
  onDownload,
  onFullscreen,
  currentPage,
  totalPages,
  onFirst,
  onPrev,
  onNext,
  onLast,
}) => {

  const {t} = useTranslation();
  const actionButtons = [
    { title: t("files.print"), icon: Print, onClick: onPrint },
    { title: t("files.download"), icon: Download, onClick: onDownload },
    { title: t("media.fullscreen"), icon: Fullscreen, onClick: onFullscreen },
  ];
  const theme = useTheme();

  const isRtl = theme.direction === 'rtl';
  const navButtons = [
    {
      title: t("pagination.first"),
      icon: isRtl ? LastPage : FirstPage,
      onClick: onFirst,
      disabled: currentPage <= 1,
    },
    {
      title: t("pagination.previous"),
      icon: isRtl ? NavigateNext : NavigateBefore,
      onClick: onPrev,
      disabled: currentPage <= 1,
    },
    {
      title: t("pagination.next"),
      icon: isRtl ? NavigateBefore : NavigateNext,
      onClick: onNext,
      disabled: currentPage >= totalPages,
    },
    {
      title: t("pagination.last"),
      icon: isRtl ? FirstPage : LastPage,
      onClick: onLast,
      disabled: currentPage >= totalPages,
    },
  ];

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderBottom: 1,
        borderColor: "divider",
        minHeight: 32,
        display: "flex",
        alignItems: "center",
        px: 0.5,
        py : 1,
        gap: 0.5,
        mt : 5
      }}
    >
      <BackButton onClick={onBack} size="small" />
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mx: "auto" }}>
        <Typography variant="body2" sx={{ color: "primary.main", mr: 1 }}>
         {t("pagination.pages")} : {totalPages}
        </Typography>
        {navButtons.map(({ title, icon: Icon, onClick, disabled }) => (
          <Tooltip key={title} title={`${title} Page`}>
            <span>
              <IconButton size="small" onClick={onClick} disabled={disabled}>
                <Icon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        ))}
        <Typography variant="body2" sx={{ mx: 1 }}>
          {currentPage} / {totalPages}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, mr: 3 }}>
        {actionButtons.map(({ title, icon: Icon, onClick }) => (
          <Tooltip key={title} title={title}>
            <IconButton size="small" onClick={onClick}>
              <Icon fontSize="small" />
            </IconButton>
          </Tooltip>
        ))}
      </Box>
    </Box>
  );
};

export default Toolbar;
