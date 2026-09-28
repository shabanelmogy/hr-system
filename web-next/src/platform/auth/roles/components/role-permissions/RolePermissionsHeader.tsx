import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import DifferenceRoundedIcon from "@mui/icons-material/DifferenceRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import { Button, Chip, Paper, Stack, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/shared/components/navigation/header";

type RolePermissionsHeaderProps = {
  roleName: string;
  selected: number;
  total: number;
  changed: number;
  percentage: number;
  readOnly: boolean;
  onBack: () => void;
};

export default function RolePermissionsHeader({
  roleName,
  selected,
  total,
  changed,
  percentage,
  readOnly,
  onBack,
}: RolePermissionsHeaderProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <>
      <PageHeader
        compact
        title={t("roles.permissionsTitle", { role: roleName })}
        actions={
          <Button
            size="small"
            variant="outlined"
            startIcon={<ArrowBackRoundedIcon />}
            onClick={onBack}
            sx={{
              alignSelf: "flex-start",
              "& .MuiButton-startIcon svg": {
                transform: theme.direction === "rtl" ? "scaleX(-1)" : "none",
              },
            }}
          >
            {t("roles.backToRoles")}
          </Button>
        }
      />

      <Paper
        variant="outlined"
        sx={{
          mb: 1.25,
          px: 1,
          py: 0.625,
          borderRadius: 2,
          bgcolor: "background.default",
        }}
      >
        <Stack
          direction="row"
          spacing={0.75}
          useFlexGap
          sx={{ alignItems: "center", flexWrap: "wrap" }}
        >
          <Chip
            size="small"
            color={readOnly ? "default" : "success"}
            icon={readOnly ? <VerifiedUserRoundedIcon /> : <CheckCircleOutlineRoundedIcon />}
            label={t(readOnly ? "roles.readOnlyMode" : "roles.editingEnabled")}
          />
          <Chip
            size="small"
            variant="outlined"
            label={t("roles.permissionsSummary", {
              selected,
              total,
              percentage: percentage.toFixed(1),
            })}
          />
          <Chip
            size="small"
            variant="outlined"
            color={changed > 0 ? "warning" : "default"}
            icon={<DifferenceRoundedIcon fontSize="small" />}
            label={`${t("roles.pendingChanges")}: ${changed}`}
          />
        </Stack>
      </Paper>
    </>
  );
}
