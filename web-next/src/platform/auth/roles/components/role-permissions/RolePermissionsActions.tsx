import { ArrowBack, SaveAlt } from "@mui/icons-material";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

type RolePermissionsActionsProps = {
  selected: number;
  total: number;
  isSaving: boolean;
  onBack: () => void;
  readOnly: boolean;
};

export default function RolePermissionsActions(props: RolePermissionsActionsProps) {
  const { t } = useTranslation();
  return (
    <Box sx={{ p: 3, display: "flex", gap: 2, justifyContent: "space-between", alignItems: "center" }}>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {t("roles.permissionsSelected", { selected: props.selected, total: props.total })}
      </Typography>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={props.onBack}
          disabled={props.isSaving}
        >
          {t("roles.backToRoles")}
        </Button>
        {!props.readOnly && <Button
          type="submit"
          variant="contained"
          size="large"
          startIcon={props.isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveAlt />}
          disabled={props.isSaving}
          sx={{
            minWidth: 120,
            boxShadow: 2,
            transition: "all 0.2s ease",
            "&:hover": { boxShadow: 4, transform: "translateY(-1px)" },
          }}
        >
          {props.isSaving ? t("common.saving") : t("actions.save")}
        </Button>}
      </Box>
    </Box>
  );
}
