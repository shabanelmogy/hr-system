import { ArrowBack, SaveAlt } from "@mui/icons-material";
import { Box, Button, CircularProgress, Typography } from "@mui/material";

type RolePermissionsActionsProps = {
  selected: number;
  total: number;
  isSaving: boolean;
  onBack: () => void;
};

export default function RolePermissionsActions(props: RolePermissionsActionsProps) {
  return (
    <Box sx={{ p: 3, display: "flex", gap: 2, justifyContent: "space-between", alignItems: "center" }}>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {props.selected} of {props.total} permissions selected
      </Typography>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={props.onBack}
          disabled={props.isSaving}
        >
          Back To Roles
        </Button>
        <Button
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
          {props.isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </Box>
    </Box>
  );
}
