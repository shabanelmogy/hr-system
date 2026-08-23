"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Viewer } from "@mescius/activereportsjs-react";
import { Alert, Box, MenuItem, Select, Stack, Typography } from "@mui/material";
import reportTemplateService from "../services/reportTemplateService";

export type ServerReportViewerProps = {
  featureKey: string;
  labels: {
    title: string;
    description: string;
    selectTemplate: string;
    noTemplates: string;
    loadError: string;
  };
};

function messageFrom(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
}

const ServerReportViewerClient = ({ featureKey, labels }: ServerReportViewerProps) => {
  const viewerRef = useRef<Viewer>(null);
  const [selectedId, setSelectedId] = useState("");
  const [renderError, setRenderError] = useState<string | null>(null);
  const templatesQuery = useQuery({
    queryKey: ["report-templates", "published", featureKey],
    queryFn: () => reportTemplateService.list(featureKey),
    staleTime: 30_000,
  });
  const templates = templatesQuery.data ?? [];

  useEffect(() => {
    if (!selectedId && templates[0]) setSelectedId(templates[0].id);
  }, [selectedId, templates]);

  const detailQuery = useQuery({
    queryKey: ["report-templates", "published", featureKey, selectedId],
    queryFn: () => reportTemplateService.getById(selectedId),
    enabled: Boolean(selectedId),
    staleTime: 30_000,
  });

  useEffect(() => {
    const definition = detailQuery.data?.definitionJson;
    if (!definition || !viewerRef.current) return;

    void viewerRef.current.open(definition).then(
      () => setRenderError(null),
      (error: unknown) => setRenderError(messageFrom(error, labels.loadError)),
    );
  }, [detailQuery.data?.definitionJson, labels.loadError]);

  return (
    <Box sx={{ display: "flex", flex: 1, flexDirection: "column", gap: 1.5, minHeight: 0, p: { xs: 1, sm: 1.5 } }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ alignItems: { xs: "stretch", sm: "center" }, justifyContent: "space-between" }}>
        <Box>
          <Typography component="h2" variant="subtitle1">{labels.title}</Typography>
          <Typography color="text.secondary" variant="body2">{labels.description}</Typography>
        </Box>
        <Select
          aria-label={labels.selectTemplate}
          displayEmpty
          onChange={(event) => setSelectedId(event.target.value)}
          size="small"
          sx={{ minWidth: 220 }}
          value={selectedId}
        >
          {templates.length === 0 ? <MenuItem disabled value="">{labels.noTemplates}</MenuItem> : null}
          {templates.map((template) => <MenuItem key={template.id} value={template.id}>{template.name}</MenuItem>)}
        </Select>
      </Stack>
      {templatesQuery.isError || detailQuery.isError || renderError ? (
        <Alert severity="error">{renderError ?? messageFrom(templatesQuery.error ?? detailQuery.error, labels.loadError)}</Alert>
      ) : null}
      {!templatesQuery.isLoading && templates.length === 0 ? <Alert severity="info">{labels.noTemplates}</Alert> : null}
      {selectedId ? (
        <Box sx={{ flex: 1, minHeight: { xs: 640, md: 720 }, overflow: "hidden" }}>
          <Viewer ref={viewerRef} toolbarVisible />
        </Box>
      ) : null}
    </Box>
  );
};

export default ServerReportViewerClient;
