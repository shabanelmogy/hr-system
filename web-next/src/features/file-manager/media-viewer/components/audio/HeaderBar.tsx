import React from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import BackButton from "@/shared/components/common/BackButton";
import { MoreVert as MoreVertIcon } from "@mui/icons-material";
import { t } from "i18next";

export interface HeaderBarProps {
  onBack?: () => void;
  onOpenMenu?: (e: React.MouseEvent<HTMLElement>) => void;
  showMenu?: boolean;
  title?: string | React.ReactNode;
  rightActions?: React.ReactNode;
  dense?: boolean;
  ariaLabelMore?: string;
}

const HeaderBar: React.FC<HeaderBarProps> = ({
  onBack,
  onOpenMenu,
  showMenu,
  title,
  rightActions,
  dense = false,
  ariaLabelMore,
}) => {
  const moreTitle = ariaLabelMore || t("files.more");

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 1,
        py: dense ? 0.25 : 0.5,
        gap: 1,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
        {onBack && <BackButton onClick={onBack} />}
        {title &&
          (typeof title === "string" ? (
            <Typography variant="subtitle2" noWrap>
              {title}
            </Typography>
          ) : (
            <Box sx={{ minWidth: 0 }}>{title}</Box>
          ))}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        {rightActions}
        {showMenu && (
          <Tooltip title={moreTitle}>
            <IconButton
              aria-label={moreTitle}
              onClick={onOpenMenu}
              size="small"
              sx={{ width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 } }}
            >
              <MoreVertIcon sx={{ fontSize: { xs: 18, sm: 24 } }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};

export default HeaderBar;
