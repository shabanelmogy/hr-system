"use client";

import React, { useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
  Badge,
} from "@mui/material";
import ViewKanbanOutlinedIcon from "@mui/icons-material/ViewKanbanOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import { useTranslation } from "react-i18next";
import { useRecruitmentSettings } from "../../hooks/useRecruitmentSettings";
import StagesSettingsTab from "./StagesSettingsTab";
import RejectionReasonsTab from "./RejectionReasonsTab";
import SourcesSettingsTab from "./SourcesSettingsTab";
import ScorecardCriteriaTab from "./ScorecardCriteriaTab";
import GeneralGovernanceTab from "./GeneralGovernanceTab";

interface RecruitmentSettingsViewProps {
  canEdit: boolean;
}

export default function RecruitmentSettingsView({ canEdit }: RecruitmentSettingsViewProps) {
  const { t } = useTranslation();

  const [activeSubTab, setActiveSubTab] = useState<
    "stages" | "reasons" | "sources" | "criteria" | "general"
  >("stages");

  const settingsState = useRecruitmentSettings();

  if (settingsState.isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (settingsState.isError || !settingsState.isLoaded || !settingsState.generalSettings) {
    return (
      <Alert severity="error">
        {t("recruitment.settings.loadFailed", "تعذر تحميل إعدادات التوظيف من الخادم. حاول مرة أخرى.")}
      </Alert>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      {/* Sub-navigation Tabs */}
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          mb: 3,
          borderRadius: 2,
          bgcolor: "background.paper",
          overflow: "hidden",
        }}
      >
        <Tabs
          value={activeSubTab}
          onChange={(_, val) => setActiveSubTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 2,
            minHeight: 52,
            "& .MuiTab-root": {
              fontWeight: 700,
              fontSize: "0.9rem",
              minHeight: 52,
              textTransform: "none",
            },
          }}
        >
          <Tab
            value="stages"
            icon={<ViewKanbanOutlinedIcon />}
            iconPosition="start"
            label={
              <Badge
                badgeContent={settingsState.stages.length}
                color="primary"
                sx={{ "& .MuiBadge-badge": { right: -12, top: 2 } }}
              >
                {t("recruitment.settings.tabStages", "مراحل الكانبان")}
              </Badge>
            }
          />
          <Tab
            value="reasons"
            icon={<BlockOutlinedIcon />}
            iconPosition="start"
            label={
              <Badge
                badgeContent={settingsState.reasons.length}
                color="error"
                sx={{ "& .MuiBadge-badge": { right: -12, top: 2 } }}
              >
                {t("recruitment.settings.tabReasons", "أسباب الرفض")}
              </Badge>
            }
          />
          <Tab
            value="sources"
            icon={<HubOutlinedIcon />}
            iconPosition="start"
            label={
              <Badge
                badgeContent={settingsState.sources.length}
                color="info"
                sx={{ "& .MuiBadge-badge": { right: -12, top: 2 } }}
              >
                {t("recruitment.settings.tabSources", "قنوات الاستقطاب")}
              </Badge>
            }
          />
          <Tab
            value="criteria"
            icon={<FactCheckOutlinedIcon />}
            iconPosition="start"
            label={
              <Badge
                badgeContent={settingsState.criteria.length}
                color="secondary"
                sx={{ "& .MuiBadge-badge": { right: -12, top: 2 } }}
              >
                {t("recruitment.settings.tabCriteria", "معايير التقييم")}
              </Badge>
            }
          />
          <Tab
            value="general"
            icon={<TuneOutlinedIcon />}
            iconPosition="start"
            label={t("recruitment.settings.tabGeneral", "الإعدادات العامة")}
          />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      {activeSubTab === "stages" && (
        <StagesSettingsTab
          stages={settingsState.stages}
          canEdit={canEdit && !settingsState.isSaving}
          onAddStage={settingsState.addStage}
          onUpdateStage={settingsState.updateStage}
        />
      )}

      {activeSubTab === "reasons" && (
        <RejectionReasonsTab
          reasons={settingsState.reasons}
          canEdit={canEdit && !settingsState.isSaving}
          onAddReason={settingsState.addReason}
          onUpdateReason={settingsState.updateReason}
        />
      )}

      {activeSubTab === "sources" && (
        <SourcesSettingsTab
          sources={settingsState.sources}
          canEdit={canEdit && !settingsState.isSaving}
          onAddSource={settingsState.addSource}
          onUpdateSource={settingsState.updateSource}
        />
      )}

      {activeSubTab === "criteria" && (
        <ScorecardCriteriaTab
          criteria={settingsState.criteria}
          canEdit={canEdit && !settingsState.isSaving}
          onAddCriterion={settingsState.addCriterion}
          onUpdateCriterion={settingsState.updateCriterion}
        />
      )}

      {activeSubTab === "general" && (
        <GeneralGovernanceTab
          settings={settingsState.generalSettings}
          canEdit={canEdit && !settingsState.isSaving}
          onUpdateSettings={settingsState.updateGeneralSettings}
        />
      )}
    </Box>
  );
}
