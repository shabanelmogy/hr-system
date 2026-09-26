import DifferenceRoundedIcon from "@mui/icons-material/DifferenceRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import { Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

type RolePermissionsActionsProps = {
  selected: number;
  total: number;
  changed: number;
  isSaving: boolean;
};

export default function RolePermissionsActions(props: RolePermissionsActionsProps) {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        position: "sticky",
        bottom: 0,
        zIndex: 5,
        p: { xs: 2, md: 2.5 },
        bgcolor: "background.paper",
        borderTop: 1,
        borderColor: "divider",
        boxShadow: "0 -10px 24px rgba(0, 0, 0, 0.06)",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ alignItems: { sm: "center" }, justifyContent: "space-between" }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <DifferenceRoundedIcon color={props.changed > 0 ? "warning" : "disabled"} />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 800 }}>
              {props.changed > 0
                ? t("roles.pendingChangesCount", { count: props.changed })
                : t("roles.noPendingChanges")}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t("roles.permissionsSelected", { selected: props.selected, total: props.total })}
            </Typography>
          </Box>
        </Stack>

        <Button
          type="submit"
          variant="contained"
          size="large"
          startIcon={props.isSaving
            ? <CircularProgress size={20} color="inherit" />
            : <SaveRoundedIcon />}
          disabled={props.isSaving}
          sx={{ minWidth: { sm: 170 } }}
        >
          {props.isSaving ? t("common.saving") : t("roles.savePermissions")}
        </Button>
      </Stack>
    </Box>
  );
}
