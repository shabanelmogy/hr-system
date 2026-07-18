import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import useHealthCheckQuery from "../hooks/useHealthCheckQuery";
import HealthStatusChip from "./HealthStatusChip";

export default function HealthCheckPanel() {
  const { t } = useTranslation();
  const { data, dataUpdatedAt, error, isFetching, isLoading, refetch } =
    useHealthCheckQuery();

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress aria-label={t("healthCheck.loading")} />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Alert
        action={
          <Button color="inherit" onClick={() => void refetch()} size="small">
            {t("healthCheck.retry")}
          </Button>
        }
        severity="error"
      >
        {t("healthCheck.loadError")}
      </Alert>
    );
  }

  return (
    <Box sx={{ display: "grid", gap: 2, minWidth: 0 }}>
      <Box
        sx={{
          alignItems: { xs: "flex-start", sm: "center" },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 1.5,
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: 1.5 }}>
          <Typography component="span" variant="subtitle2">
            {t("healthCheck.overallStatus")}
          </Typography>
          <HealthStatusChip status={data.status} />
          <Typography color="text.secondary" variant="body2">
            {t("healthCheck.totalDuration", { duration: data.totalDuration })}
          </Typography>
        </Box>
        <Button
          disabled={isFetching}
          onClick={() => void refetch()}
          startIcon={<RefreshCw size={18} />}
          variant="outlined"
        >
          {t("healthCheck.refresh")}
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table aria-label={t("healthCheck.tableLabel")} size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t("healthCheck.component")}</TableCell>
              <TableCell>{t("healthCheck.status")}</TableCell>
              <TableCell>{t("healthCheck.duration")}</TableCell>
              <TableCell>{t("healthCheck.details")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.entries.map((entry) => (
              <TableRow key={entry.name}>
                <TableCell sx={{ fontWeight: 600 }}>{entry.name}</TableCell>
                <TableCell>
                  <HealthStatusChip status={entry.status} />
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{entry.duration}</TableCell>
                <TableCell>
                  {entry.description ?? t("healthCheck.noIssuesReported")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography color="text.secondary" variant="caption">
        {t("healthCheck.lastChecked", {
          time: new Intl.DateTimeFormat(undefined, {
            dateStyle: "medium",
            timeStyle: "medium",
          }).format(dataUpdatedAt),
        })}
      </Typography>
    </Box>
  );
}
