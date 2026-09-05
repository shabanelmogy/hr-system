"use client";

import React, { useState } from "react";
import { Box, Button, Typography, useTheme, Tabs, Tab, Badge } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import { useTranslation } from "react-i18next";
import PageHeader from "@/shared/components/navigation/header/PageHeader";
import RecruitmentDashboardStats from "../components/RecruitmentDashboardStats";
import JobOpeningsGrid from "../components/JobOpeningsGrid";
import JobRequisitionsGrid from "../components/JobRequisitionsGrid";
import RecruitmentSettingsView from "../components/settings/RecruitmentSettingsView";
import RecruitmentKanbanBoard from "../components/RecruitmentKanbanBoard";
import CandidateDetailDialog from "../components/CandidateDetailDialog";
import JobOpeningDialog from "../components/JobOpeningDialog";
import JobRequisitionDialog from "../components/JobRequisitionDialog";
import NewApplicationDialog from "../components/NewApplicationDialog";
import ScheduleInterviewDialog from "../components/ScheduleInterviewDialog";
import JobOfferDialog from "../components/JobOfferDialog";
import InterviewEvaluationDialog from "../components/InterviewEvaluationDialog";
import RecruitmentService from "../services/recruitmentService";
import { showToast } from "@/shared/components/feedback/transient/showToast";
import type { EmploymentApplicationDto, JobRequisitionDto } from "../types";
import type { JobOpeningFormData } from "../validation/recruitmentValidation";
import { useJobRequisitions } from "../hooks/useRecruitment";
import { useRecruitmentPermissions } from "@/shared/hooks/usePermissions";

export default function RecruitmentPage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const perms = useRecruitmentPermissions();

  // Tab State
  const [activeTab, setActiveTab] = useState<"openings" | "requisitions" | "settings">("openings");

  // Selection State
  const [selectedOpeningId, setSelectedOpeningId] = useState<number | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<EmploymentApplicationDto | null>(null);

  // Dialog triggers
  const [openOpeningDialog, setOpenOpeningDialog] = useState(false);
  const [openingInitialValues, setOpeningInitialValues] = useState<Partial<JobOpeningFormData> | undefined>(undefined);
  const [openRequisitionDialog, setOpenRequisitionDialog] = useState(false);
  const [openApplicationDialog, setOpenApplicationDialog] = useState(false);
  const [targetOpeningIdForApp, setTargetOpeningIdForApp] = useState<number | null>(null);
  const [interviewAppId, setInterviewAppId] = useState<number | null>(null);
  const [offerAppId, setOfferAppId] = useState<number | null>(null);
  const [evaluateInterviewId, setEvaluateInterviewId] = useState<number | null>(null);
  const [evaluateCandidateName, setEvaluateCandidateName] = useState<string | undefined>(undefined);
  const [evaluatePositionTitle, setEvaluatePositionTitle] = useState<string | undefined>(undefined);

  // Total requisitions count for tab badge
  const requisitionsQuery = useJobRequisitions({ pageSize: 1 });
  const requisitionsCount = requisitionsQuery.data?.metaData.totalCount ?? 0;

  const handleOpenEvaluation = async (app: EmploymentApplicationDto) => {
    try {
      const interviews = await RecruitmentService.getInterviews({ applicationId: app.id });
      if (interviews.items.length > 0) {
        setEvaluateInterviewId(interviews.items[0].id);
        setEvaluateCandidateName(app.candidateName);
        setEvaluatePositionTitle(app.positionTitleAr || app.positionTitleEn);
      } else {
        showToast.warning(t("recruitment.interviews.noInterviewsYet", "لم يتم جدولة مقابلة لهذا المرشح بعد"));
      }
    } catch (err: any) {
      showToast.error(err, t("common.error", "حدث خطأ أثناء جلب بيانات المقابلة"));
    }
  };

  const handleOpenNewApp = (openingId?: number) => {
    setTargetOpeningIdForApp(openingId ?? selectedOpeningId ?? 1);
    setOpenApplicationDialog(true);
  };

  const handleOpenOpeningFromRequisition = (req: JobRequisitionDto) => {
    setOpeningInitialValues({
      jobRequisitionId: req.id,
      positionId: req.positionId,
      branchId: req.branchId,
      departmentId: req.departmentId,
      divisionId: req.divisionId,
      positionCount: req.requestedPositions,
      employmentType: req.employmentType,
      workArrangement: req.workArrangement,
    });
    setOpenOpeningDialog(true);
  };

  return (
    <Box sx={{ width: "100%", pb: 5 }}>
      {/* Page Header */}
      <PageHeader
        title={t("recruitment.page.title", "موديول التوظيف والتعيينات / Recruitment & Hiring")}
        subTitle={t(
          "recruitment.page.subtitle",
          "إدارة دورة التوظيف الشاملة: الشواغر، المتقدمين، المقابلات، العروض الوظيفية، والتعيين بنقرة واحدة"
        )}
        actions={
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            {perms.canManageRequisitions && (
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<AssignmentIcon />}
                onClick={() => setOpenRequisitionDialog(true)}
                sx={{ fontWeight: 600 }}
              >
                {t("recruitment.requisitions.newRequisition", "طلب احتياج وظيفي / New Requisition")}
              </Button>
            )}
            {(perms.canManageCandidates || perms.canManageApplications) && (
              <Button
                variant="outlined"
                startIcon={<PersonAddAlt1Icon />}
                onClick={() => handleOpenNewApp()}
                sx={{ fontWeight: 600 }}
              >
                {t("recruitment.page.newCandidate", "مرشح جديد / New Candidate")}
              </Button>
            )}
            {perms.canManageOpenings && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setOpeningInitialValues(undefined);
                  setOpenOpeningDialog(true);
                }}
                sx={{ fontWeight: 600 }}
              >
                {t("recruitment.page.newPosition", "وظيفة جديدة / New Position")}
              </Button>
            )}
          </Box>
        }
      />

      {/* KPI Overview Cards */}
      <RecruitmentDashboardStats />

      {/* Module Navigation Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        sx={{
          mb: 3,
          borderBottom: 1,
          borderColor: "divider",
          "& .MuiTab-root": {
            fontWeight: 700,
            fontSize: "0.95rem",
            textTransform: "none",
          },
        }}
      >
        <Tab
          value="openings"
          icon={<WorkOutlineRoundedIcon />}
          iconPosition="start"
          label={t("recruitment.tabs.openings", "الشواغر الوظيفية ومسار التعيين / Job Openings & Pipeline")}
        />
        <Tab
          value="requisitions"
          icon={
            <Badge
              badgeContent={requisitionsCount}
              color="secondary"
              sx={{ "& .MuiBadge-badge": { right: -12, top: 4 } }}
            >
              <AssignmentOutlinedIcon />
            </Badge>
          }
          iconPosition="start"
          label={t("recruitment.tabs.requisitions", "طلبات الاحتياج الوظيفي / Job Requisitions")}
        />
        {(perms.canManageOpenings || perms.canManageRequisitions) && (
          <Tab
            value="settings"
            icon={<TuneRoundedIcon />}
            iconPosition="start"
            label={t("recruitment.tabs.settings", "إعدادات وتهيئة التوظيف / Settings & Configuration")}
          />
        )}
      </Tabs>

      {activeTab === "openings" && (
        <>
          {/* Odoo-style Job Positions Cards */}
          <JobOpeningsGrid
            selectedOpeningId={selectedOpeningId}
            onSelectOpening={(id) => setSelectedOpeningId(id)}
            onNewApplication={(openingId) => handleOpenNewApp(openingId)}
            onCreateOpening={() => {
              setOpeningInitialValues(undefined);
              setOpenOpeningDialog(true);
            }}
          />

          {/* Section Divider & Kanban Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
              mt: 2,
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {t("recruitment.pipeline.title", "مسار المرشحين والمراحل / Recruitment Pipeline")}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {selectedOpeningId
                  ? t("recruitment.pipeline.filteredOpening", "عرض متقدمي الوظيفة المحددة (انقر على بطاقة الوظيفة لإلغاء التصفية)")
                  : t("recruitment.pipeline.allOpenings", "عرض كافة المتقدمين عبر جميع الوظائف")}
              </Typography>
            </Box>

            {selectedOpeningId && (
              <Button
                size="small"
                variant="text"
                onClick={() => setSelectedOpeningId(null)}
                sx={{ fontWeight: 600 }}
              >
                {t("recruitment.pipeline.clearFilter", "عرض كل الوظائف / Clear Filter")}
              </Button>
            )}
          </Box>

          {/* Framer-Motion Interactive Pipeline Board */}
          <RecruitmentKanbanBoard
            selectedOpeningId={selectedOpeningId}
            onSelectApplication={(app) => setSelectedApplication(app)}
            onScheduleInterview={(appId) => setInterviewAppId(appId)}
            onEvaluateInterview={handleOpenEvaluation}
            onMakeOffer={(appId) => setOfferAppId(appId)}
            onHire={(appId) => {
              // Open details dialog with hiring state
              const app = selectedApplication || ({ id: appId } as EmploymentApplicationDto);
              setSelectedApplication(app);
            }}
          />
        </>
      )}

      {activeTab === "requisitions" && (
        <JobRequisitionsGrid
          onCreateRequisition={() => setOpenRequisitionDialog(true)}
          onOpenJobOpeningFromRequisition={handleOpenOpeningFromRequisition}
        />
      )}

      {activeTab === "settings" && (
        <RecruitmentSettingsView />
      )}

      {/* Modals and Dialogs */}
      <CandidateDetailDialog
        open={Boolean(selectedApplication)}
        application={selectedApplication}
        onClose={() => setSelectedApplication(null)}
        onScheduleInterview={(appId) => setInterviewAppId(appId)}
        onEvaluateInterview={handleOpenEvaluation}
        onMakeOffer={(appId) => setOfferAppId(appId)}
      />

      <JobOpeningDialog
        open={openOpeningDialog}
        initialValues={openingInitialValues}
        onClose={() => {
          setOpenOpeningDialog(false);
          setOpeningInitialValues(undefined);
        }}
      />

      <JobRequisitionDialog
        open={openRequisitionDialog}
        onClose={() => setOpenRequisitionDialog(false)}
      />

      <NewApplicationDialog
        open={openApplicationDialog}
        openingId={targetOpeningIdForApp}
        onClose={() => {
          setOpenApplicationDialog(false);
          setTargetOpeningIdForApp(null);
        }}
      />

      <ScheduleInterviewDialog
        open={Boolean(interviewAppId)}
        applicationId={interviewAppId}
        onClose={() => setInterviewAppId(null)}
      />

      <InterviewEvaluationDialog
        open={Boolean(evaluateInterviewId)}
        interviewId={evaluateInterviewId}
        candidateName={evaluateCandidateName}
        positionTitle={evaluatePositionTitle}
        onClose={() => {
          setEvaluateInterviewId(null);
          setEvaluateCandidateName(undefined);
          setEvaluatePositionTitle(undefined);
        }}
      />

      <JobOfferDialog
        open={Boolean(offerAppId)}
        applicationId={offerAppId}
        onClose={() => setOfferAppId(null)}
      />
    </Box>
  );
}
