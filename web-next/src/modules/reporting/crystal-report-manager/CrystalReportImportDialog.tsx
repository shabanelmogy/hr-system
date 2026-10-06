import { SystemUpdateAlt } from "@mui/icons-material";
import { Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { extractErrorMessage } from "@/shared/utils/errorUtils";
import { MySelect } from "@/shared/components/forms";
import { getCrystalReportEntityLabel } from "./entityLabels";
import { formatCrystalReportBytes } from "./files";
import { crystalReportService } from "./services";
import type { DiscoveredCrystalReport, ImportDiscoveredCrystalReportRequest, SupportedCrystalReportEntity } from "./types";

interface Props {
  open: boolean;
  busy: boolean;
  entities: SupportedCrystalReportEntity[];
  entitiesLoading: boolean;
  entitiesError: string | null;
  onRetryEntities: () => void;
  onClose: () => void;
  onImport: (request: ImportDiscoveredCrystalReportRequest) => Promise<boolean>;
}

export function CrystalReportImportDialog({ open, busy, entities, entitiesLoading, entitiesError, onRetryEntities, onClose, onImport }: Props) {
  const { t } = useTranslation();
  const [items, setItems] = useState<DiscoveredCrystalReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [entityKey, setEntityKey] = useState("");

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await crystalReportService.listDeploymentCandidates(entityKey || undefined));
    } catch (cause) {
      setError(extractErrorMessage(cause) || t("crystalReports.catalogError"));
    } finally {
      setLoading(false);
    }
  }, [entityKey, t]);

  useEffect(() => { void Promise.resolve().then(loadCatalog); }, [loadCatalog]);

  const normalizedSearch = search.trim().toLowerCase();
  const visibleItems = items.filter((item) =>
    !normalizedSearch || [item.displayName, item.subject, item.entityKey, item.fileName]
      .some((value) => value?.toLowerCase().includes(normalizedSearch)));

  const importItem = async (item: DiscoveredCrystalReport) => {
    const imported = await onImport({ sourceId: item.sourceId, expectedSha256: item.sha256 });
    if (imported) await loadCatalog();
  };

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle>{t("crystalReports.importExisting")}</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5} sx={{ pt: 1 }}>
          <Typography color="text.secondary">{t("crystalReports.importExistingHint")}</Typography>
          {entitiesError ? <Alert severity="error" action={<Button color="inherit" size="small" onClick={onRetryEntities}>{t("actions.retry")}</Button>}>{entitiesError}</Alert> : null}
          <MySelect
            label={t("crystalReports.entity")}
            dataSource={entities.map((entity) => ({ id: entity.entityKey, label: getCrystalReportEntityLabel(t, entity.entityKey) }))}
            valueMember="id"
            displayMember="label"
            selectedItem={entityKey || 0}
            handleSelectionChange={(event) => setEntityKey(event.target.value === 0 ? "" : String(event.target.value))}
            loading={entitiesLoading}
            disabled={Boolean(entitiesError)}
          />
          <TextField size="small" label={t("actions.search")} value={search} onChange={(event) => setSearch(event.target.value)} />
          {loading && <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>}
          {error && <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => void loadCatalog()}>{t("actions.retry")}</Button>}>{error}</Alert>}
          {!loading && !error && visibleItems.length === 0 && <Alert severity="info">{t("crystalReports.noExistingReports")}</Alert>}
          {!loading && !error && visibleItems.map((item) => (
            <Box key={item.sourceId} sx={{ border: 1, borderColor: "divider", borderRadius: 1.5, p: 1.5, display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
                  <Typography sx={{ fontWeight: 700 }}>{item.displayName}</Typography>
                  <Chip size="small" label={getCrystalReportEntityLabel(t, item.entityKey)} />
                  {item.isImported && <Chip size="small" color="success" label={t("crystalReports.imported")} />}
                </Stack>
                {item.subject && <Typography variant="body2" color="text.secondary">{item.subject}</Typography>}
                <Typography variant="caption" color="text.secondary">{item.fileName} · {formatCrystalReportBytes(item.size)}</Typography>
                {item.validationReason && <Typography variant="caption" color="error" sx={{ display: "block" }}>{item.validationReason}</Typography>}
              </Box>
              <Button
                variant="contained"
                size="small"
                startIcon={<SystemUpdateAlt />}
                disabled={busy || item.isImported || !item.isImportable}
                onClick={() => void importItem(item)}
              >
                {item.isImported ? t("crystalReports.imported") : t("crystalReports.import")}
              </Button>
            </Box>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions><Button onClick={onClose} disabled={busy}>{t("actions.close")}</Button></DialogActions>
    </Dialog>
  );
}
