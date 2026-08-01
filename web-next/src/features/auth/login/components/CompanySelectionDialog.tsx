import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import CloseIcon from "@mui/icons-material/Close";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { CompanySelectionResponse } from "../types";

interface CompanySelectionDialogProps {
  selection: CompanySelectionResponse | null;
  loading: boolean;
  onSelect: (companyId: number) => Promise<void>;
  onCancel: () => void;
}

export default function CompanySelectionDialog({
  selection,
  loading,
  onSelect,
  onCancel,
}: CompanySelectionDialogProps) {
  const { t, i18n } = useTranslation();
  const [selectedCompany, setSelectedCompany] = useState<{ token: string; id: number | null }>({ token: "", id: null });
  const selectionToken = selection?.companySelectionToken ?? "";
  const selectedCompanyId = selectedCompany.token === selectionToken
    ? selectedCompany.id
    : selection?.companies[0]?.id ?? null;

  const handleCompanySelect = (companyId: number) => {
    // The token makes the selection reset naturally when a new login response arrives.
    setSelectedCompany({ token: selectionToken, id: companyId });
  };

  const isArabic = i18n.resolvedLanguage?.startsWith("ar") ?? false;

  return (
    <Dialog
      open={selection !== null}
      onClose={() => {
        if (!loading) onCancel();
      }}
      fullWidth
      maxWidth="sm"
      aria-labelledby="company-selection-title"
    >
      <DialogTitle id="company-selection-title" sx={{ pe: 7 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar sx={{ bgcolor: "primary.main", width: 40, height: 40 }}>
            <BusinessOutlinedIcon />
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" component="span" sx={{ display: "block" }}>
              {t("auth.selectCompany")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("auth.selectCompanyDescription")}
            </Typography>
          </Box>
        </Box>
        <IconButton
          aria-label={t("actions.close")}
          onClick={onCancel}
          disabled={loading}
          sx={{ position: "absolute", insetInlineEnd: 12, top: 12 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 1.5 }}>
        <List disablePadding aria-label={t("auth.availableCompanies")}>
          {selection?.companies.map((company) => {
            const selected = selectedCompanyId === company.id;
            const primaryName = isArabic ? company.nameAr : company.nameEn;
            const secondaryName = isArabic ? company.nameEn : company.nameAr;

            return (
              <ListItemButton
                key={company.id}
                selected={selected}
                onClick={() => handleCompanySelect(company.id)}
                disabled={loading}
                sx={{ borderRadius: 1, mb: 0.5, minHeight: 64 }}
              >
                <ListItemAvatar>
                  <Avatar variant="rounded" sx={{ bgcolor: "action.selected", color: "primary.main" }}>
                    <BusinessOutlinedIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={primaryName}
                  secondary={secondaryName && secondaryName !== primaryName ? secondaryName : undefined}
                  slotProps={{ primary: { sx: { fontWeight: selected ? 700 : 500 } } }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </DialogContent>

      <DialogActions sx={{ px: 2.5, py: 2 }}>
        <Button onClick={onCancel} disabled={loading} color="inherit">
          {t("actions.cancel")}
        </Button>
        <Button
          variant="contained"
          disabled={selectedCompanyId === null || loading}
          onClick={() => selectedCompanyId !== null && void onSelect(selectedCompanyId)}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : undefined}
        >
          {t("auth.continueToCompany")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
