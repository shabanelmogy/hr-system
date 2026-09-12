"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  Chip,
  IconButton,
  Alert,
  Grid,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import PublicIcon from "@mui/icons-material/Public";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import { useTranslation } from "react-i18next";
import type { RecruitmentSourceConfig } from "../../types/recruitmentSettingsTypes";
import SourceEditDialog from "./SourceEditDialog";

interface SourcesSettingsTabProps {
  sources: RecruitmentSourceConfig[];
  onAddSource: (data: Omit<RecruitmentSourceConfig, "id">) => void;
  onUpdateSource: (id: string, updates: Partial<RecruitmentSourceConfig>) => void;
  onDeleteSource: (id: string) => void;
}

export default function SourcesSettingsTab({
  sources,
  onAddSource,
  onUpdateSource,
  onDeleteSource,
}: SourcesSettingsTabProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<RecruitmentSourceConfig | null>(null);

  const handleOpenAdd = () => {
    setSelectedSource(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (source: RecruitmentSourceConfig) => {
    setSelectedSource(source);
    setDialogOpen(true);
  };

  const handleSave = (data: Omit<RecruitmentSourceConfig, "id">) => {
    if (selectedSource) {
      onUpdateSource(selectedSource.id, data);
    } else {
      onAddSource(data);
    }
  };

  const getSourceIcon = (type: RecruitmentSourceConfig["type"]) => {
    switch (type) {
      case "portal":
        return <PublicIcon sx={{ color: "primary.main" }} />;
      case "social":
        return <ShareOutlinedIcon sx={{ color: "info.main" }} />;
      case "referral":
        return <PeopleAltOutlinedIcon sx={{ color: "success.main" }} />;
      case "agency":
        return <BusinessCenterOutlinedIcon sx={{ color: "warning.main" }} />;
      case "fair":
        return <SchoolOutlinedIcon sx={{ color: "secondary.main" }} />;
      default:
        return <PublicIcon sx={{ color: "text.secondary" }} />;
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {t("recruitment.settings.sourcesTitle", "قنوات ومصادر التوظيف (Sourcing Channels)")}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {t(
              "recruitment.settings.sourcesSubtitle",
              "إدارة وتتبع القنوات والمنصات التي تستقطب منها الشركة مرشحيها وحساب معدل نجاح كل قناة"
            )}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          sx={{ fontWeight: 600 }}
        >
          {t("recruitment.settings.newSourceBtn", "إضافة قناة جديدة")}
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        {t(
          "recruitment.settings.sourcesHint",
          "تُربط هذه القنوات تلقائياً عند إضافة أي مرشح أو تقديمه من البوابة الخارجية، مما يتيح للإدارة تقارير فورية عن القناة الأكثر جدوى وجودة في التعيينات."
        )}
      </Alert>

      <Grid container spacing={2}>
        {sources.map((src) => {
          const conversionRate =
            src.applicationsCount > 0
              ? Math.round((src.hiredCount / src.applicationsCount) * 100)
              : 0;

          return (
            <Grid size={{ xs: 12, md: 6 }} key={src.id}>
              <Card
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 2,
                  "&:hover": { borderColor: "primary.main", boxShadow: 1 },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    {getSourceIcon(src.type)}
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {isArabic ? src.nameAr : src.nameEn}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {isArabic ? src.nameEn : src.nameAr}
                      </Typography>
                    </Box>
                  </Box>

                  <Chip
                    label={src.isActive ? t("common.active", "نشطة") : t("common.inactive", "معطلة")}
                    size="small"
                    color={src.isActive ? "success" : "default"}
                    variant={src.isActive ? "filled" : "outlined"}
                    sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                  />
                </Box>

                {/* Metrics */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-around",
                    alignItems: "center",
                    bgcolor: "background.neutral",
                    py: 1.2,
                    px: 2,
                    borderRadius: 1.5,
                  }}
                >
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {t("recruitment.settings.metricApps", "المتقدمين")}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {src.applicationsCount}
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {t("recruitment.settings.metricHired", "تم تعيينهم")}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "success.main" }}>
                      {src.hiredCount}
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {t("recruitment.settings.metricConversion", "نسبة النجاح")}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "primary.main" }}>
                      {conversionRate}%
                    </Typography>
                  </Box>
                </Box>

                {/* Actions */}
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenEdit(src)}
                    sx={{ color: "primary.main" }}
                  >
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => onDeleteSource(src.id)}
                    sx={{ color: "error.main" }}
                  >
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Source Dialog */}
      <SourceEditDialog
        open={dialogOpen}
        source={selectedSource}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
      />
    </Box>
  );
}
