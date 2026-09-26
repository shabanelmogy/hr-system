import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import DifferenceRoundedIcon from "@mui/icons-material/DifferenceRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import {
  alpha,
  Box,
  Button,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import type { ReactNode } from "react";
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
        title={t("roles.permissionsTitle", { role: roleName })}
        subTitle={t(readOnly ? "roles.permissionsReadOnly" : "roles.permissionsSubtitle")}
        actions={
          <Button
            variant="outlined"
            startIcon={<ArrowBackRoundedIcon />}
            onClick={onBack}
            sx={{
              width: { xs: "100%", md: "auto" },
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
          mb: 2.5,
          p: { xs: 2, md: 2.5 },
          borderRadius: 3,
          borderColor: alpha(theme.palette.primary.main, 0.18),
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.background.paper, 0.96)} 55%)`,
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2.5}
          sx={{ alignItems: { md: "center" }, justifyContent: "space-between" }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", minWidth: 0 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
                borderRadius: 2,
                color: "primary.main",
                bgcolor: alpha(theme.palette.primary.main, 0.12),
              }}
            >
              <SecurityRoundedIcon />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {t("roles.permissionWorkspace")}
                </Typography>
                <Chip
                  size="small"
                  color={readOnly ? "default" : "success"}
                  icon={readOnly ? <VerifiedUserRoundedIcon /> : <CheckCircleOutlineRoundedIcon />}
                  label={t(readOnly ? "roles.readOnlyMode" : "roles.editingEnabled")}
                />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {t("roles.permissionsSummary", {
                  selected,
                  total,
                  percentage: percentage.toFixed(1),
                })}
              </Typography>
            </Box>
          </Stack>

          <Box sx={{ width: { xs: "100%", md: 300 }, flexShrink: 0 }}>
            <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.75 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                {t("roles.permissionCoverage")}
              </Typography>
              <Typography variant="body2" color="primary.main" sx={{ fontWeight: 800 }}>
                {percentage.toFixed(1)}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={percentage}
              aria-label={t("roles.permissionCoverage")}
              sx={{ height: 8, borderRadius: 999 }}
            />
          </Box>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
            gap: 1.5,
            mt: 2.5,
          }}
        >
          <SummaryMetric
            icon={<CheckCircleOutlineRoundedIcon fontSize="small" />}
            label={t("roles.selectedPermissions")}
            value={selected}
            color={theme.palette.success.main}
          />
          <SummaryMetric
            icon={<SecurityRoundedIcon fontSize="small" />}
            label={t("roles.availablePermissions")}
            value={total}
            color={theme.palette.info.main}
          />
          <SummaryMetric
            icon={<DifferenceRoundedIcon fontSize="small" />}
            label={t("roles.pendingChanges")}
            value={changed}
            color={changed > 0 ? theme.palette.warning.main : theme.palette.text.secondary}
          />
        </Box>
      </Paper>
    </>
  );
}

function SummaryMetric({
  icon,
  label,
  value,
  color,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Stack
      direction="row"
      spacing={1.25}
      sx={{
        alignItems: "center",
        p: 1.5,
        borderRadius: 2,
        bgcolor: "background.paper",
        border: 1,
        borderColor: "divider",
      }}
    >
      <Box sx={{ color, display: "grid", placeItems: "center" }}>{icon}</Box>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 850, lineHeight: 1 }}>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      </Box>
    </Stack>
  );
}
