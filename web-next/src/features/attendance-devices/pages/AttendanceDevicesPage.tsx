"use client";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloudDoneRoundedIcon from "@mui/icons-material/CloudDoneRounded";
import CloudOffRoundedIcon from "@mui/icons-material/CloudOffRounded";
import DevicesRoundedIcon from "@mui/icons-material/DevicesRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import FingerprintRoundedIcon from "@mui/icons-material/FingerprintRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import ManageSearchRoundedIcon from "@mui/icons-material/ManageSearchRounded";
import RouterRoundedIcon from "@mui/icons-material/RouterRounded";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/shared/components/feedback/states";
import { MyDateTimeField } from "@/shared/components/forms";
import { Section } from "@/shared/components/layout";
import { SearchBar } from "@/shared/components/lists/card-view/header-controls/SearchBar";
import { PageHeader } from "@/shared/components/navigation/header";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { useServerListState } from "@/shared/hooks/useServerListState";
import { extractErrorMessage } from "@/shared/utils/errorUtils";
import { AttendanceAgentEnrollmentDialog } from "../components/AttendanceAgentEnrollmentDialog";
import { AttendanceModuleLayout } from "../components/AttendanceModuleLayout";
import { CredentialsDialog } from "../components/CredentialsDialog";
import { DeviceFormDialog } from "../components/DeviceFormDialog";
import {
  useAttendanceAgents,
  useAttendanceBranches,
  useAttendanceDevicePage,
  useCreateAttendanceAgent,
  useCreateDevice,
  useCredentials,
  useProviders,
  usePullAttendance,
  usePullUsers,
  useSetDeviceEnabled,
  useTestDevice,
  useUpdateDevice,
} from "../hooks/useAttendanceDeviceQueries";
import { attendanceDeviceService } from "../services/attendanceDeviceService";
import type { AttendanceDeviceListItem, AttendanceDeviceSort } from "../types/attendanceDevices";
import { toAttendanceDeviceQuery } from "../utils/attendanceDeviceQuery";
import { getAttendancePermissions } from "../utils/permissions";

export default function AttendanceDevicesPage() {
  const { t } = useTranslation();
  const { userPermissions, isReadOnly } = usePermissions();
  const permissions = getAttendancePermissions(userPermissions, isReadOnly);
  const list = useServerListState<AttendanceDeviceSort, Record<string, never>>({
    defaultColumn: "updatedOn",
    defaultSortDirection: "DESC",
    defaultFilters: {},
    defaultPageSize: 10,
  });
  const query = useMemo(
    () => toAttendanceDeviceQuery(list.state, list.debouncedSearchValue),
    [list.debouncedSearchValue, list.state],
  );
  const devices = useAttendanceDevicePage(query);
  const providers = useProviders();
  const branches = useAttendanceBranches();
  const agents = useAttendanceAgents();
  const create = useCreateDevice();
  const createAgent = useCreateAttendanceAgent();
  const update = useUpdateDevice();
  const credentials = useCredentials();
  const setEnabled = useSetDeviceEnabled();
  const test = useTestDevice();
  const pullUsers = usePullUsers();
  const pullAttendance = usePullAttendance();

  const [selected, setSelected] = useState<AttendanceDeviceListItem | null>(null);
  const [editing, setEditing] = useState<AttendanceDeviceListItem | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [agentOpen, setAgentOpen] = useState(false);
  const [createdAgent, setCreatedAgent] = useState<Awaited<ReturnType<typeof attendanceDeviceService.createAgent>> | null>(null);
  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [testResult, setTestResult] = useState<Awaited<ReturnType<typeof attendanceDeviceService.test>> | null>(null);
  const [range, setRange] = useState({ fromUtc: "", toUtc: "" });
  const [feedback, setFeedback] = useState<string | null>(null);
  const deviceItems = devices.data?.items ?? [];

  useEffect(() => {
    if (selected && !deviceItems.some((item) => item.id === selected.id)) setSelected(null);
  }, [deviceItems, selected]);

  const selectDevice = (device: AttendanceDeviceListItem) => {
    setSelected(device);
    setTestResult(null);
    setFeedback(null);
  };
  const run = async (work: () => Promise<unknown>, message: string) => {
    try {
      await work();
      setFeedback(message);
    } catch (error) {
      setFeedback(extractErrorMessage(error));
    }
  };
  const canOperateSelected = Boolean(selected?.enabled && selected?.attendanceAgentId);
  const selectedAgent = agents.data?.find((agent) => agent.id === selected?.attendanceAgentId) ?? null;
  const agentOnline = selectedAgent?.lastSeenAtUtc
    ? Date.now() - new Date(selectedAgent.lastSeenAtUtc).getTime() < 90_000
    : false;

  return (
    <AttendanceModuleLayout>
      <Box sx={{ display: "flex", flex: 1, minHeight: 0, flexDirection: "column", gap: 2 }}>
        <PageHeader
          title={t("attendanceDevices.viewTitle")}
          subTitle={t("attendanceDevices.viewSubtitle")}
          actions={permissions.canManage ? (
            <Stack direction="row" spacing={1}>
              <Button startIcon={<GroupsRoundedIcon />} onClick={() => {
                setCreatedAgent(null);
                setAgentOpen(true);
              }}>
                {t("attendanceDevices.siteAgent")}
              </Button>
              <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}>
                {t("attendanceDevices.addDevice")}
              </Button>
            </Stack>
          ) : undefined}
        />

        {permissions.canManage && !agents.isLoading && agents.data?.length === 0 ? (
          <Alert
            severity="info"
            action={(
              <Button
                color="inherit"
                size="small"
                startIcon={<GroupsRoundedIcon />}
                onClick={() => {
                  setCreatedAgent(null);
                  setAgentOpen(true);
                }}
              >
                {t("attendanceDevices.addSiteAgent")}
              </Button>
            )}
          >
            {t("attendanceDevices.createSiteAgentFirst")}
          </Alert>
        ) : null}

        {feedback ? <Alert severity="info" onClose={() => setFeedback(null)}>{feedback}</Alert> : null}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(260px, .8fr) minmax(0, 1.5fr) minmax(250px, .72fr)" },
            alignItems: "start",
            gap: 2,
            minHeight: 0,
          }}
        >
          <Section
            title={t("attendanceDevices.deviceRegistry")}
            subtitle={t("attendanceDevices.deviceRegistrySubtitle")}
            actions={<Chip size="small" label={devices.data?.metaData.totalCount ?? 0} />}
            sx={{ minHeight: { lg: 520 }, display: "flex", flexDirection: "column" }}
          >
            <Stack spacing={1.25} sx={{ flex: 1, minHeight: 0 }}>
              <SearchBar
                margin="none"
                searchTerm={list.state.searchValue}
                placeholder={t("attendanceDevices.searchDevices")}
                onSearchChange={list.setSearchValue}
                onClearSearch={() => list.setSearchValue("")}
              />
              <Button size="small" onClick={() => void devices.refetch()}>{t("attendanceDevices.refreshList")}</Button>
              <Divider />
              {deviceItems.length > 0 ? (
                <List dense disablePadding aria-label={t("attendanceDevices.title")} sx={{ maxHeight: { lg: 385 }, overflowY: "auto", pr: 0.5 }}>
                  {deviceItems.map((device) => (
                    <ListItemButton
                      key={device.id}
                      selected={device.id === selected?.id}
                      onClick={() => selectDevice(device)}
                      sx={{ borderRadius: 2, mb: 0.5, py: 1.1 }}
                    >
                      <ListItemIcon sx={{ minWidth: 38 }}>
                        <FingerprintRoundedIcon color={device.enabled ? "primary" : "disabled"} />
                      </ListItemIcon>
                      <ListItemText
                        primary={<Typography noWrap sx={{ fontWeight: 600 }}>{device.name}</Typography>}
                        secondary={<Typography noWrap variant="caption">{device.host}:{device.port} · {device.attendanceAgentName ?? t("attendanceDevices.noAgent")}</Typography>}
                      />
                      <Chip size="small" color={device.enabled ? "success" : "default"} label={device.enabled ? t("attendanceDevices.enabled") : t("attendanceDevices.disabled")} />
                    </ListItemButton>
                  ))}
                </List>
              ) : null}
              {!devices.isLoading && deviceItems.length === 0 ? (
                <EmptyState
                  icon={DevicesRoundedIcon}
                  title={t("attendanceDevices.noDevicesTitle")}
                  subtitle={t("attendanceDevices.noDevicesSubtitle")}
                  action={permissions.canManage ? (
                    <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => {
                      setEditing(null);
                      setFormOpen(true);
                    }}>
                      {t("attendanceDevices.addDevice")}
                    </Button>
                  ) : undefined}
                  sx={{ minHeight: 280, py: 4 }}
                />
              ) : null}
            </Stack>
          </Section>

          <Stack spacing={2} sx={{ minWidth: 0 }}>
            {selected ? (
              <>
                <Section
                  title={selected.name}
                  subtitle={`${selected.providerId} · ${selected.host}:${selected.port}`}
                  actions={<Stack direction="row" spacing={1}>
                    <Button disabled={!permissions.canManage} onClick={() => {
                      setEditing(selected);
                      setFormOpen(true);
                    }}>
                      {t("actions.edit")}
                    </Button>
                    <Button
                      color={selected.enabled ? "warning" : "success"}
                      disabled={!permissions.canManage || setEnabled.isPending}
                      onClick={() => void run(
                        () => setEnabled.mutateAsync({ id: selected.id, enabled: !selected.enabled }),
                        selected.enabled ? t("attendanceDevices.deviceDisabled") : t("attendanceDevices.deviceEnabled"),
                      )}
                    >
                      {selected.enabled ? t("actions.disable") : t("actions.enable")}
                    </Button>
                  </Stack>}
                >
                  <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", flexWrap: "wrap" }}>
                    <Box sx={{ display: "grid", placeItems: "center", width: 46, height: 46, borderRadius: 2, bgcolor: "primary.lighter", color: "primary.main" }}>
                      <RouterRoundedIcon />
                    </Box>
                    <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap" }}>
                      <Chip
                        size="small"
                        icon={agentOnline ? <CloudDoneRoundedIcon /> : <CloudOffRoundedIcon />}
                        color={agentOnline ? "success" : "warning"}
                        label={agentOnline ? t("attendanceDevices.agentServiceReady") : t("attendanceDevices.waitingForAgent")}
                      />
                      <Chip size="small" variant="outlined" label={selected.attendanceAgentName ?? t("attendanceDevices.agentNotAssigned")} />
                    </Stack>
                  </Stack>
                </Section>

                <Section
                  title={t("attendanceDevices.connectionCheck")}
                  subtitle={t("attendanceDevices.connectionCheckSubtitle")}
                  actions={<ManageSearchRoundedIcon color="action" />}
                >
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                    <Button disabled={!permissions.canCredentials} onClick={() => setCredentialsOpen(true)}>{t("attendanceDevices.credentials")}</Button>
                    <Button
                      variant="contained"
                      disabled={!permissions.canPull || !canOperateSelected || test.isPending}
                      onClick={() => void run(async () => {
                        const result = await test.mutateAsync(selected.id);
                        setTestResult(result);
                      }, selected.attendanceAgentId
                        ? t("attendanceDevices.connectionTestQueued")
                        : t("attendanceDevices.connectionTestComplete"))}
                    >
                      {t("attendanceDevices.testConnection")}
                    </Button>
                  </Stack>
                  {testResult ? (
                    <Alert sx={{ mt: 1.5 }} severity={testResult.errorCode === "QUEUED" ? "info" : testResult.connected ? "success" : "error"}>
                      {testResult.errorCode === "QUEUED"
                        ? testResult.message ?? t("attendanceDevices.connectionTestQueued")
                        : testResult.connected
                        ? `${t("attendanceDevices.connected")}${testResult.serialNumber ? ` · ${testResult.serialNumber}` : ""}`
                        : testResult.message ?? t("attendanceDevices.connectionFailed")}
                    </Alert>
                  ) : null}
                </Section>
              </>
            ) : (
              <EmptyState
                icon={FingerprintRoundedIcon}
                title={t("attendanceDevices.selectDeviceTitle")}
                subtitle={t("attendanceDevices.selectDeviceSubtitle")}
                sx={{ minHeight: 310 }}
              />
            )}
          </Stack>

          <Section
            title={t("attendanceDevices.readDeviceData")}
            subtitle={t("attendanceDevices.readDeviceDataSubtitle")}
            actions={<DownloadRoundedIcon color="action" />}
            sx={{ position: { lg: "sticky" }, top: 16 }}
          >
            <Stack spacing={1.25}>
              <Button
                fullWidth
                disabled={!permissions.canPull || !canOperateSelected || pullUsers.isPending}
                onClick={() => {
                  if (selected) void run(() => pullUsers.mutateAsync(selected.id), t("attendanceDevices.userPullQueued"));
                }}
              >
                {t("attendanceDevices.pullUsers")}
              </Button>
              <MyDateTimeField
                fieldName="pull-from"
                label={t("attendanceDevices.from")}
                value={range.fromUtc}
                onChange={(fromUtc) => setRange({ ...range, fromUtc })}
              />
              <MyDateTimeField
                fieldName="pull-to"
                label={t("attendanceDevices.to")}
                value={range.toUtc}
                onChange={(toUtc) => setRange({ ...range, toUtc })}
              />
              <Button
                fullWidth
                variant="contained"
                startIcon={<DownloadRoundedIcon />}
                disabled={!permissions.canPull || !canOperateSelected || pullAttendance.isPending}
                onClick={() => {
                  if (selected) void run(
                    () => pullAttendance.mutateAsync({
                      id: selected.id,
                      request: {
                        fromUtc: range.fromUtc ? new Date(range.fromUtc).toISOString() : undefined,
                        toUtc: range.toUtc ? new Date(range.toUtc).toISOString() : undefined,
                      },
                    }),
                    t("attendanceDevices.attendancePullQueued"),
                  );
                }}
              >
                {t("attendanceDevices.pullAttendance")}
              </Button>
              <Alert icon={false} severity="info" sx={{ py: 0 }}>
                {t("attendanceDevices.siteAgentRequired")}
              </Alert>
            </Stack>
          </Section>
        </Box>

        <DeviceFormDialog
          open={formOpen}
          device={editing}
          providers={providers.data ?? []}
          branches={branches.data ?? []}
          agents={agents.data ?? []}
          disabled={!permissions.canManage || create.isPending || update.isPending}
          onClose={() => setFormOpen(false)}
          onSubmit={(request) => void run(async () => {
            if (editing) await update.mutateAsync({ id: editing.id, request });
            else await create.mutateAsync(request);
            setFormOpen(false);
          }, t("attendanceDevices.saved"))}
        />
        <AttendanceAgentEnrollmentDialog
          open={agentOpen}
          disabled={!permissions.canManage || createAgent.isPending}
          created={createdAgent}
          onClose={() => {
            setAgentOpen(false);
            setCreatedAgent(null);
            createAgent.reset();
          }}
          onCreate={(name) => void run(async () => {
            setCreatedAgent(await createAgent.mutateAsync({ name }));
          }, t("attendanceDevices.createEnrollment"))}
        />
        <CredentialsDialog
          open={credentialsOpen}
          deviceId={selected?.id ?? null}
          disabled={!permissions.canCredentials || credentials.isPending}
          onClose={() => setCredentialsOpen(false)}
          onSubmit={(id, values) => void run(async () => {
            await credentials.mutateAsync({ id, request: values });
            setCredentialsOpen(false);
          }, t("attendanceDevices.credentialsSaved"))}
        />
      </Box>
    </AttendanceModuleLayout>
  );
}
