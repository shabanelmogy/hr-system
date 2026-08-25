"use client";

import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import {
  Box,
  Chip,
  CircularProgress,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  alpha,
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState, type MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { useSession } from "@/lib/auth/SessionContext";
import useNotifications from "@/shared/hooks/useNotifications";

export function CompanyContextSwitcher({ compact = false }: { compact?: boolean }) {
  const { user, switchCompany, isSwitchingCompany } = useSession();
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { showError, showSuccess, SnackbarComponent } = useNotifications();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isArabic = i18n.resolvedLanguage?.startsWith("ar") ?? false;
  const isSuperAdmin = user?.roles.some(
    (role) => role.trim().toLowerCase() === "super_admin",
  ) ?? false;
  const companies = user?.companies ?? [];
  const canSwitch = companies.length > 1;
  const currentName = useMemo(
    () => getCompanyName(
      user?.companyNameAr ?? "",
      user?.companyNameEn ?? "",
      user?.companyCode ?? "",
      isArabic,
    ),
    [isArabic, user?.companyCode, user?.companyNameAr, user?.companyNameEn],
  );

  if (!user || isSuperAdmin || !currentName) return null;

  const closeMenu = () => setAnchorEl(null);
  const openMenu = (event: MouseEvent<HTMLElement>) => {
    if (canSwitch && !isSwitchingCompany) setAnchorEl(event.currentTarget);
  };

  const handleSwitch = async (companyId: number) => {
    if (companyId === user.companyId) {
      closeMenu();
      return;
    }

    closeMenu();
    try {
      await switchCompany(companyId);
      queryClient.clear();
      router.refresh();
      showSuccess(t("auth.companySwitched"));
    } catch {
      showError(t("auth.companySwitchFailed"));
    }
  };

  return (
    <>
      <Tooltip
        title={canSwitch ? t("auth.switchCompany") : t("auth.currentCompany")}
        enterDelay={500}
      >
        <Chip
          aria-label={`${t("auth.currentCompany")}: ${currentName}`}
          aria-haspopup={canSwitch ? "menu" : undefined}
          aria-expanded={canSwitch ? Boolean(anchorEl) : undefined}
          icon={isSwitchingCompany ? <CircularProgress size={15} /> : <BusinessRoundedIcon />}
          deleteIcon={canSwitch ? <ExpandMoreRoundedIcon /> : undefined}
          onClick={canSwitch ? openMenu : undefined}
          onDelete={canSwitch ? openMenu : undefined}
          label={currentName}
          size="small"
          sx={(theme) => ({
            flexShrink: 1,
            maxWidth: compact ? 112 : 210,
            height: 30,
            color: theme.palette.text.primary,
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.38)}`,
            fontWeight: 700,
            boxShadow: theme.shadows[2],
            "& .MuiChip-icon": {
              color: theme.palette.primary.main,
              marginInlineStart: "7px",
              marginInlineEnd: "-3px",
            },
            "& .MuiChip-label": {
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            },
            "& .MuiChip-deleteIcon": {
              color: theme.palette.text.secondary,
              marginInline: "-2px 4px",
            },
          })}
        />
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={closeMenu}
        slotProps={{ paper: { sx: { minWidth: 260, maxWidth: 360 } } }}
      >
        <Box sx={{ px: 2, py: 1, color: "text.secondary", fontSize: 12, fontWeight: 700 }}>
          {t("auth.switchCompany")}
        </Box>
        {companies.map((company) => {
          const selected = company.id === user.companyId;
          const name = getCompanyName(
            company.nameAr,
            company.nameEn,
            company.companyCode,
            isArabic,
          );
          return (
            <MenuItem
              key={company.id}
              selected={selected}
              disabled={isSwitchingCompany}
              onClick={() => void handleSwitch(company.id)}
            >
              <ListItemIcon>
                {selected ? <CheckRoundedIcon color="primary" /> : <BusinessRoundedIcon />}
              </ListItemIcon>
              <ListItemText primary={name} secondary={company.companyCode} />
            </MenuItem>
          );
        })}
      </Menu>
      {SnackbarComponent}
    </>
  );
}

function getCompanyName(
  nameAr: string,
  nameEn: string,
  companyCode: string,
  isArabic: boolean,
) {
  return (isArabic ? nameAr : nameEn).trim() ||
    (isArabic ? nameEn : nameAr).trim() ||
    companyCode.trim();
}
