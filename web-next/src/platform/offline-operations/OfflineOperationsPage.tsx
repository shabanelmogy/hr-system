"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import CloudOffRoundedIcon from "@mui/icons-material/CloudOffRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Snackbar,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { ContentWrapper } from "@/shared/components/layout";
import { PageHeader } from "@/shared/components/navigation/header";
import { ConfirmationDialog } from "@/shared/components/dialogs";
import { useSession } from "@/lib/auth/SessionContext";
import { ApiClientError } from "@/lib/api/client";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { permissions } from "@/lib/auth/permissions";
import { offlineOperationsService } from "./offlineOperationsService";
import {
  getSafeSupportedModes,
  isCapabilityStateCompatible,
  isKnownOfflineCapabilityId,
  isPolicySafeForEditing,
  offlineOperationsPolicyQueryKey,
  type OfflineOperationMode,
  type OfflineOperationsPolicy,
} from "./types";

const capabilityPresentation = {
  "countries.read": { icon: <PublicRoundedIcon />, key: "countriesRead" },
  "workforce-plan.update-draft": { icon: <BadgeRoundedIcon />, key: "workforcePlanUpdateDraft" },
} as const;

export function OfflineOperationsPage() {
  const { t, i18n } = useTranslation();
  const { user } = useSession();
  const { hasPermission, isReadOnly } = usePermissions();
  const canManage = hasPermission(permissions.EditOfflineOperations) && !isReadOnly;
  const client = useQueryClient();
  const [resetOpen, setResetOpen] = useState(false);
  const [notice, setNotice] = useState<{ severity: "success" | "error" | "warning"; text: string } | null>(null);
  const queryKey = offlineOperationsPolicyQueryKey(user?.tenantId, user?.companyId);

  const policyQuery = useQuery({
    queryKey,
    queryFn: offlineOperationsService.getPolicy,
    staleTime: 15_000,
    enabled: Boolean(user?.tenantId && user?.companyId),
  });
  const mutation = useMutation({
    mutationFn: offlineOperationsService.updatePolicy,
    retry: false,
    onSuccess: (policy) => client.setQueryData(queryKey, policy),
  });

  const policy = policyQuery.data;
  const scopeMatchesSession = Boolean(
    policy && user && policy.tenantId === user.tenantId && policy.companyId === user.companyId,
  );
  const policySafeForEditing = Boolean(policy && isPolicySafeForEditing(policy));
  const editable = Boolean(policy && canManage && scopeMatchesSession && policySafeForEditing && !mutation.isPending);
  const resettable = Boolean(
    editable && policy?.capabilities.every((capability) => capability.supportedModes.includes("online-only")),
  );

  const applyModes = async (nextModes: OfflineOperationsPolicy["modes"]): Promise<boolean> => {
    if (!policy || !editable) return false;
    try {
      await mutation.mutateAsync({ modes: nextModes, rowVersion: policy.rowVersion });
      setNotice({ severity: "success", text: t("offlineOperations.saveSuccess") });
      return true;
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 409) {
        await policyQuery.refetch();
        setNotice({ severity: "warning", text: t("offlineOperations.conflictReloaded") });
        return false;
      }
      setNotice({ severity: "error", text: error instanceof Error ? error.message : t("offlineOperations.saveFailed") });
      return false;
    }
  };

  const resetPolicy = async () => {
    if (!policy || !resettable) return;
    const onlineOnly = Object.fromEntries(
      policy.capabilities.map((capability) => [capability.id, "online-only"]),
    ) as OfflineOperationsPolicy["modes"];
    if (await applyModes(onlineOnly)) setResetOpen(false);
  };

  const scopeDetails = useMemo(() => {
    if (!policy) return null;
    const company = user?.companies.find((item) => item.id === policy.companyId);
    const companyName = i18n.language.toLowerCase().startsWith("ar")
      ? company?.nameAr || company?.nameEn || user?.companyCode || String(policy.companyId)
      : company?.nameEn || company?.nameAr || user?.companyCode || String(policy.companyId);
    return {
      tenantName: user?.tenantName || policy.tenantId,
      companyName,
    };
  }, [i18n.language, policy, user]);

  return (
    <ContentWrapper>
      <PageHeader
        title={t("offlineOperations.title")}
        subTitle={t("offlineOperations.subtitle")}
        actions={
          <Button
            variant="outlined"
            color="warning"
            startIcon={<RestartAltRoundedIcon />}
            disabled={!resettable}
            onClick={() => setResetOpen(true)}
          >
            {t("offlineOperations.reset")}
          </Button>
        }
      />

      <Stack spacing={2.5}>
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={1.5}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                sx={{ alignItems: { sm: "center" }, justifyContent: "space-between" }}
              >
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{t("offlineOperations.scopeTitle")}</Typography>
                  {policy && scopeDetails ? (
                    <Stack spacing={0.25} sx={{ mt: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t("offlineOperations.tenantScopeValue", {
                          name: scopeDetails.tenantName,
                          id: policy.tenantId,
                        })}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t("offlineOperations.companyScopeValue", {
                          name: scopeDetails.companyName,
                          id: policy.companyId,
                        })}
                      </Typography>
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">{t("offlineOperations.loading")}</Typography>
                  )}
                </Box>
                <Chip
                  icon={<CloudOffRoundedIcon />}
                  label={t("offlineOperations.source.serverPolicy")}
                  color={scopeMatchesSession ? "primary" : "warning"}
                  variant="outlined"
                />
              </Stack>
              <Alert severity="info">{t("offlineOperations.serverAuthorityNotice")}</Alert>
              {policy && !scopeMatchesSession ? <Alert severity="error">{t("offlineOperations.scopeMismatch")}</Alert> : null}
              {isReadOnly ? <Alert severity="warning">{t("offlineOperations.readOnlyNotice")}</Alert> : null}
              {policy && !policySafeForEditing ? (
                <Alert severity="warning">{t("offlineOperations.incompatiblePolicy")}</Alert>
              ) : null}
            </Stack>
          </CardContent>
        </Card>

        {policyQuery.isLoading ? (
          <Stack sx={{ alignItems: "center", py: 6 }}><CircularProgress /></Stack>
        ) : policyQuery.error ? (
          <Alert
            severity="error"
            action={<Button color="inherit" size="small" onClick={() => void policyQuery.refetch()}>{t("common.retry")}</Button>}
          >
            {policyQuery.error instanceof Error ? policyQuery.error.message : t("offlineOperations.loadFailed")}
          </Alert>
        ) : policy ? (
          <Stack spacing={2}>
            {policy.capabilities.map((capability) => {
              const presentation = capabilityPresentation[capability.id as keyof typeof capabilityPresentation];
              const safeModes = getSafeSupportedModes(capability);
              const currentMode = policy.modes[capability.id];
              const known = isKnownOfflineCapabilityId(capability.id) && Boolean(presentation);
              const compatible = isCapabilityStateCompatible(capability, currentMode);
              return (
                <Card key={capability.id} variant="outlined">
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
                        <Box sx={{ mt: 0.25, color: "primary.main" }}>{presentation?.icon ?? <CloudOffRoundedIcon />}</Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                            {presentation ? t(`offlineOperations.capabilities.${presentation.key}`) : capability.id}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {presentation ? t(`offlineOperations.capabilities.${presentation.key}Description`) : t("offlineOperations.unknownCapability")}
                          </Typography>
                        </Box>
                        {currentMode ? (
                          <Chip
                            size="small"
                            label={compatible
                              ? t(`offlineOperations.modes.${modeKey(currentMode)}`)
                              : t("offlineOperations.incompatibleCurrentMode", {
                                  mode: t(`offlineOperations.modes.${modeKey(currentMode)}`),
                                })}
                            color={compatible ? "primary" : "warning"}
                            variant={compatible ? "filled" : "outlined"}
                          />
                        ) : null}
                      </Stack>

                      {known ? (
                        <ToggleButtonGroup
                          exclusive
                          fullWidth
                          value={compatible ? currentMode : null}
                          disabled={!editable || !compatible}
                          onChange={(_, next: OfflineOperationMode | null) => {
                            if (!next || next === currentMode || !safeModes.includes(next)) return;
                            void applyModes({ ...policy.modes, [capability.id]: next });
                          }}
                          sx={{ flexWrap: "wrap", "& .MuiToggleButton-root": { minWidth: { xs: "50%", md: 150 }, flex: 1 } }}
                        >
                          {safeModes.map((mode) => (
                            <ToggleButton key={mode} value={mode}>
                              {t(`offlineOperations.modes.${modeKey(mode)}`)}
                            </ToggleButton>
                          ))}
                        </ToggleButtonGroup>
                      ) : null}

                      {!known ? <Alert severity="warning">{t("offlineOperations.unsupportedCapability")}</Alert> : null}
                      {known && !compatible ? <Alert severity="warning">{t("offlineOperations.incompatibleCapability")}</Alert> : null}
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}

            <Typography variant="caption" color="text.secondary">
              {t("offlineOperations.lastUpdated", {
                date: policy.updatedOn
                  ? new Date(policy.updatedOn).toLocaleString(i18n.resolvedLanguage || i18n.language)
                  : t("offlineOperations.never"),
                user: policy.updatedByUserId || t("offlineOperations.system"),
              })}
            </Typography>
          </Stack>
        ) : null}
      </Stack>

      <ConfirmationDialog
        open={resetOpen}
        title={t("offlineOperations.resetConfirmTitle")}
        description={t("offlineOperations.resetConfirmDescription")}
        confirmLabel={t("offlineOperations.reset")}
        cancelLabel={t("offlineOperations.cancel")}
        confirmColor="warning"
        busy={mutation.isPending}
        onClose={() => setResetOpen(false)}
        onConfirm={() => void resetPolicy()}
      />

      <Snackbar open={Boolean(notice)} autoHideDuration={5000} onClose={() => setNotice(null)}>
        {notice ? <Alert severity={notice.severity} onClose={() => setNotice(null)}>{notice.text}</Alert> : undefined}
      </Snackbar>
    </ContentWrapper>
  );
}

function modeKey(mode: OfflineOperationMode) {
  return mode === "online-only"
    ? "onlineOnly"
    : mode === "offline-read"
      ? "offlineRead"
      : mode === "offline-draft"
        ? "offlineDraft"
        : "offlineCommand";
}
