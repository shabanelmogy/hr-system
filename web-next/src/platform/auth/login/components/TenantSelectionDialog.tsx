import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
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
import type { TenantSelectionResponse } from "../types";

interface TenantSelectionDialogProps {
  selection: TenantSelectionResponse | null;
  loading: boolean;
  onSelect: (tenantId: string) => Promise<void>;
  onCancel: () => void;
}

export default function TenantSelectionDialog({
  selection,
  loading,
  onSelect,
  onCancel,
}: TenantSelectionDialogProps) {
  const { t } = useTranslation();
  const [selectedTenant, setSelectedTenant] = useState({ token: "", id: "" });
  const selectionToken = selection?.tenantSelectionToken ?? "";
  const selectedTenantId = selectedTenant.token === selectionToken
    ? selectedTenant.id
    : "";

  return (
    <Dialog
      open={selection !== null}
      onClose={() => !loading && onCancel()}
      fullWidth
      maxWidth="sm"
      aria-labelledby="tenant-selection-title"
    >
      <DialogTitle id="tenant-selection-title" sx={{ pe: 7 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar sx={{ bgcolor: "primary.main", width: 40, height: 40 }}>
            <ApartmentOutlinedIcon />
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" component="span" sx={{ display: "block" }}>
              {t("auth.selectTenant")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("auth.selectTenantDescription")}
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
        <List disablePadding aria-label={t("auth.availableTenants")}>
          {selection?.tenants.map((tenant) => {
            const selected = selectedTenantId === tenant.id;
            return (
              <ListItemButton
                key={tenant.id}
                selected={selected}
                onClick={() => setSelectedTenant({ token: selectionToken, id: tenant.id })}
                disabled={loading}
                sx={{ borderRadius: 1, mb: 0.5, minHeight: 64 }}
              >
                <ListItemAvatar>
                  <Avatar variant="rounded" sx={{ bgcolor: "action.selected", color: "primary.main" }}>
                    <ApartmentOutlinedIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={tenant.name}
                  secondary={tenant.identifier}
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
          disabled={!selectedTenantId || loading}
          onClick={() => selectedTenantId && void onSelect(selectedTenantId)}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : undefined}
        >
          {t("auth.continueToTenant")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
