"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ComponentProps } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Designer } from "@mescius/activereportsjs-react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import reportTemplateService from "../services/reportTemplateService";
import type {
  ReportDataSourceDescriptor,
  ReportTemplateDetail,
  ReportTemplateListItem,
} from "../types/reportTemplate";
import { usePermissions } from "@/shared/hooks/usePermissions";

type DesignerProps = ComponentProps<typeof Designer>;
type OpenResult = Awaited<ReturnType<NonNullable<DesignerProps["onOpen"]>>>;
type SaveResult = Awaited<ReturnType<NonNullable<DesignerProps["onSave"]>>>;
type SaveAsResult = Awaited<ReturnType<NonNullable<DesignerProps["onSaveAs"]>>>;
type SaveOptions = Parameters<NonNullable<DesignerProps["onSave"]>>[0];
type SaveAsOptions = Parameters<NonNullable<DesignerProps["onSaveAs"]>>[0];

export type ServerReportDesignerLabels = {
  title: string;
  description: string;
  starterTemplateName: string;
  dataSourceGuidance: string;
  unsavedChanges: string;
  templateLoadError: string;
  templateSaveError: string;
  concurrencyError: string;
  openTemplate: string;
  noTemplates: string;
  cancel: string;
  published: string;
  draft: string;
  publish: string;
  permissionDenied: string;
  dataSourceUnavailable: string;
};

export type ApprovedReportDataSource = {
  key: string;
  expectedApiPath: string;
  dataSetName: string;
  fields: readonly string[];
};

export type ServerReportDesignerProps = {
  featureKey: string;
  starterReport: { id: string; displayName: string };
  dataSource: ApprovedReportDataSource;
  labels: ServerReportDesignerLabels;
};

const templateKey = (featureKey: string) => ["report-templates", featureKey] as const;

function definitionFrom(value: unknown) {
  if (value && typeof value === "object" && "definition" in value) {
    return (value as { definition: unknown }).definition;
  }

  return value;
}

function serializeDefinition(value: unknown) {
  return JSON.stringify(definitionFrom(value));
}

function parseDefinition(definitionJson: string) {
  return JSON.parse(definitionJson) as Record<string, unknown>;
}

function toDesignerReport(template: ReportTemplateDetail): OpenResult {
  return {
    id: template.id,
    displayName: template.name,
    definition: parseDefinition(template.definitionJson),
  } as OpenResult;
}

function apiErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }

  return fallback;
}

function isConcurrencyError(error: unknown) {
  return Boolean(
    error &&
      typeof error === "object" &&
      "status" in error &&
      (error as { status?: unknown }).status === 409,
  );
}

function toApprovedDataSource(
  descriptor: ReportDataSourceDescriptor | undefined,
  source: ApprovedReportDataSource,
  featureKey: string,
) {
  if (!descriptor ||
    descriptor.key !== source.key ||
    descriptor.featureKey !== featureKey ||
    descriptor.dataProvider !== "JSON" ||
    descriptor.httpMethod.toUpperCase() !== "GET" ||
    !descriptor.requiresAuthentication ||
    descriptor.relativeApiPath !== source.expectedApiPath ||
    descriptor.connectString !== `endpoint=${source.expectedApiPath}`) {
    return undefined;
  }

  return descriptor;
}

function createDataSources(source: ApprovedReportDataSource, descriptor: ReportDataSourceDescriptor) {
  return [
    {
      id: source.key,
      title: descriptor.displayName,
      canEdit: false,
      shouldEdit: false,
      template: {
        Name: source.key,
        ConnectionProperties: {
          DataProvider: "JSON",
          // A same-origin API path survives local and hosted deployments. It is
          // intentionally not a database connection string.
          ConnectString: descriptor.connectString,
        },
      },
      datasets: [
        {
          id: source.dataSetName,
          title: source.dataSetName,
          canEdit: false,
          template: {
            Name: source.dataSetName,
            Query: {
              DataSourceName: source.key,
              CommandText: "jpath=$.[*]",
            },
            Fields: source.fields.map((field) => ({ Name: field, DataField: field })),
          },
        },
      ],
    },
  ];
}

const ServerReportDesignerClient = ({
  featureKey,
  starterReport,
  dataSource,
  labels,
}: ServerReportDesignerProps) => {
  const designerRef = useRef<Designer>(null);
  const openResolverRef = useRef<((result: OpenResult) => void) | null>(null);
  const queryClient = useQueryClient();
  const { hasPermission, isReadOnly } = usePermissions();
  const [currentTemplate, setCurrentTemplate] = useState<ReportTemplateDetail | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpenDialogVisible, setOpenDialogVisible] = useState(false);
  const [openResolver, setOpenResolver] = useState<((result: OpenResult) => void) | null>(null);
  const canView = hasPermission("ReportTemplates:View");
  const canCreate = !isReadOnly && hasPermission("ReportTemplates:Create");
  const canEdit = !isReadOnly && hasPermission("ReportTemplates:Edit");
  const canPublish = !isReadOnly && hasPermission("ReportTemplates:Publish");

  const templatesQuery = useQuery({
    queryKey: templateKey(featureKey),
    queryFn: () => reportTemplateService.listForManagement(featureKey),
    enabled: canView && canEdit,
    staleTime: 30_000,
  });
  const dataSourcesQuery = useQuery({
    queryKey: ["report-template-data-sources", featureKey],
    queryFn: () => reportTemplateService.getDataSources(featureKey),
    enabled: canView && canEdit,
    staleTime: 5 * 60_000,
  });
  const templates = templatesQuery.data ?? [];
  const approvedDescriptor = useMemo(
    () => toApprovedDataSource(dataSourcesQuery.data?.find((item) => item.key === dataSource.key), dataSource, featureKey),
    [dataSource, dataSourcesQuery.data, featureKey],
  );
  const dataSources = useMemo(
    () => approvedDescriptor ? createDataSources(dataSource, approvedDescriptor) : [],
    [approvedDescriptor, dataSource],
  );

  const invalidateTemplates = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: templateKey(featureKey) });
  }, [featureKey, queryClient]);

  const closeOpenDialog = useCallback(() => {
    openResolverRef.current?.(undefined);
    openResolverRef.current = null;
    setOpenResolver(null);
    setOpenDialogVisible(false);
  }, [openResolver]);

  useEffect(() => () => {
    openResolverRef.current?.(undefined);
    openResolverRef.current = null;
  }, []);

  const loadTemplate = useCallback(async (template: ReportTemplateListItem) => {
    if (hasUnsavedChanges && !window.confirm(labels.unsavedChanges)) return;

    try {
      const detail = await reportTemplateService.getForManagement(template.id);
      setCurrentTemplate(detail);
      setHasUnsavedChanges(false);
      setError(null);
      openResolverRef.current?.(toDesignerReport(detail));
      openResolverRef.current = null;
      setOpenResolver(null);
      setOpenDialogVisible(false);
    } catch (loadError) {
      setError(apiErrorMessage(loadError, labels.templateLoadError));
    }
  }, [hasUnsavedChanges, labels.templateLoadError, labels.unsavedChanges]);

  const handleCreate: NonNullable<DesignerProps["onCreate"]> = useCallback(async () => {
    if (!canCreate) {
      setError(labels.permissionDenied);
      return undefined;
    }
    if (hasUnsavedChanges && !window.confirm(labels.unsavedChanges)) return undefined;

    setCurrentTemplate(null);
    setHasUnsavedChanges(false);
    setError(null);
    return {
      id: starterReport.id,
      displayName: starterReport.displayName,
    } as never;
  }, [canCreate, hasUnsavedChanges, labels.permissionDenied, labels.unsavedChanges, starterReport]);

  const handleOpen: NonNullable<DesignerProps["onOpen"]> = useCallback(() => {
    if (!canView || !canEdit) {
      setError(labels.permissionDenied);
      return Promise.resolve(undefined);
    }
    return new Promise<OpenResult>((resolve) => {
      openResolverRef.current = resolve;
      setOpenResolver(() => resolve);
      setOpenDialogVisible(true);
    });
  }, [canEdit, canView, labels.permissionDenied]);

  const saveTemplate = useCallback(async (
    options: SaveOptions | SaveAsOptions,
    saveAs: boolean,
  ): Promise<ReportTemplateDetail | undefined> => {
    const name = options.displayName?.trim() || currentTemplate?.name || starterReport.displayName;
    const definitionJson = serializeDefinition(options.definition);

    try {
      let saved: ReportTemplateDetail;
      if (!saveAs && currentTemplate) {
        if (!canEdit) {
          setError(labels.permissionDenied);
          return undefined;
        }
        saved = await reportTemplateService.update(currentTemplate.id, {
          name,
          definitionJson,
          dataSourceKey: dataSource.key,
          rowVersion: currentTemplate.rowVersion,
        });
      } else {
        if (!canCreate) {
          setError(labels.permissionDenied);
          return undefined;
        }
        saved = await reportTemplateService.create({
          featureKey,
          name,
          definitionJson,
          dataSourceKey: dataSource.key,
          description: currentTemplate?.description ?? null,
        });
      }

      setCurrentTemplate(saved);
      setHasUnsavedChanges(false);
      setError(null);
      await invalidateTemplates();
      return saved;
    } catch (saveError) {
      setError(
        isConcurrencyError(saveError)
          ? labels.concurrencyError
          : apiErrorMessage(saveError, labels.templateSaveError),
      );
      return undefined;
    }
  }, [canCreate, canEdit, currentTemplate, dataSource.key, featureKey, invalidateTemplates, labels.concurrencyError, labels.permissionDenied, labels.templateSaveError, starterReport.displayName]);

  const handleSave: NonNullable<DesignerProps["onSave"]> = useCallback(
    async (options) => {
      const saved = await saveTemplate(options, false);
      return saved ? { displayName: saved.name } as SaveResult : undefined;
    },
    [saveTemplate],
  );
  const handleSaveAs: NonNullable<DesignerProps["onSaveAs"]> = useCallback(
    async (options) => {
      const saved = await saveTemplate(options, true);
      return saved ? { id: saved.id, displayName: saved.name } as SaveAsResult : undefined;
    },
    [saveTemplate],
  );

  const publishCurrentTemplate = useCallback(async () => {
    if (!currentTemplate || !canPublish) {
      setError(labels.permissionDenied);
      return;
    }

    try {
      await reportTemplateService.publish(currentTemplate.id, currentTemplate.rowVersion);
      const published = await reportTemplateService.getForManagement(currentTemplate.id);
      setCurrentTemplate(published);
      setError(null);
      await invalidateTemplates();
    } catch (publishError) {
      setError(isConcurrencyError(publishError)
        ? labels.concurrencyError
        : apiErrorMessage(publishError, labels.templateSaveError));
    }
  }, [canPublish, currentTemplate, invalidateTemplates, labels.concurrencyError, labels.permissionDenied, labels.templateSaveError]);

  return (
    <Box sx={{ display: "flex", flex: 1, flexDirection: "column", gap: 1.5, minHeight: 0, p: { xs: 1, sm: 1.5 } }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        sx={{ alignItems: { xs: "stretch", sm: "center" }, justifyContent: "space-between" }}
      >
        <Box>
          <Typography component="h2" variant="subtitle1">{labels.title}</Typography>
          <Typography color="text.secondary" variant="body2">{labels.description}</Typography>
        </Box>
        {currentTemplate ? (
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Chip color={currentTemplate.isPublished ? "success" : "default"} label={currentTemplate.isPublished ? labels.published : labels.draft} size="small" />
            {!currentTemplate.isPublished && canPublish ? (
              <Button onClick={() => void publishCurrentTemplate()} size="small" variant="outlined">{labels.publish}</Button>
            ) : null}
          </Stack>
        ) : null}
      </Stack>

      {hasUnsavedChanges ? <Alert severity="warning">{labels.unsavedChanges}</Alert> : null}
      {error ? <Alert severity="error">{error}</Alert> : null}
      {templatesQuery.isError ? <Alert severity="warning">{labels.templateLoadError}</Alert> : null}
      {dataSourcesQuery.isError || (!dataSourcesQuery.isLoading && !approvedDescriptor) ? (
        <Alert severity="error">{labels.dataSourceUnavailable}</Alert>
      ) : null}
      <Alert severity="info">{labels.dataSourceGuidance}</Alert>

      {approvedDescriptor ? <Box sx={{ flex: 1, minHeight: { xs: 640, md: 720 }, overflow: "auto", "& > div": { minWidth: 960 } }}>
        <Designer
          ref={designerRef}
          dataSources={dataSources as never}
          documentChanged={(event) => setHasUnsavedChanges(Boolean(event.isDirty))}
          onCreate={handleCreate}
          onOpen={handleOpen}
          onSave={handleSave}
          onSaveAs={handleSaveAs}
          onInit={() => ({
            data: {
              dataSources: { canModify: false },
              dataSets: { canModify: false },
            },
          })}
          report={starterReport as never}
          reportList={templates.map((template) => ({ id: template.id, displayName: template.name }))}
        />
      </Box> : null}

      <Dialog fullWidth maxWidth="sm" onClose={closeOpenDialog} open={isOpenDialogVisible}>
        <DialogTitle>{labels.openTemplate}</DialogTitle>
        <DialogContent dividers>
          {templates.length === 0 ? (
            <Typography color="text.secondary">{labels.noTemplates}</Typography>
          ) : (
            <List disablePadding>
              {templates.map((template) => (
                <ListItemButton key={template.id} onClick={() => void loadTemplate(template)}>
                  <ListItemText
                    primary={template.name}
                    secondary={template.isPublished ? labels.published : labels.draft}
                  />
                </ListItemButton>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions><Button onClick={closeOpenDialog}>{labels.cancel}</Button></DialogActions>
      </Dialog>
    </Box>
  );
};

export default ServerReportDesignerClient;
