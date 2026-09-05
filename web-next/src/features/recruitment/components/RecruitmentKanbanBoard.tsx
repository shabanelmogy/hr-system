"use client";

import React, { useState } from "react";
import {
  Box,
  Card,
  Typography,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  Button,
  Rating,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import EventIcon from "@mui/icons-material/Event";
import { useTranslation } from "react-i18next";
import {
  useApplications,
  useMoveApplicationStage,
  useRejectApplication,
} from "../hooks/useRecruitment";
import { ApplicationStatus, EmploymentApplicationDto } from "../types";
import { useRecruitmentPermissions } from "@/shared/hooks/usePermissions";

interface PipelineStageConfig {
  id: string;
  statuses: ApplicationStatus[];
  primaryStatus: ApplicationStatus;
  titleEn: string;
  titleAr: string;
  color: string;
}

const PIPELINE_STAGES: PipelineStageConfig[] = [
  {
    id: "stage-new",
    statuses: [ApplicationStatus.Draft, ApplicationStatus.Submitted],
    primaryStatus: ApplicationStatus.Submitted,
    titleEn: "New / Applications",
    titleAr: "طلبات جديدة",
    color: "#3B82F6",
  },
  {
    id: "stage-review",
    statuses: [ApplicationStatus.UnderReview],
    primaryStatus: ApplicationStatus.UnderReview,
    titleEn: "Under Review",
    titleAr: "قيد المراجعة والفرز",
    color: "#8B5CF6",
  },
  {
    id: "stage-shortlist",
    statuses: [ApplicationStatus.Shortlisted],
    primaryStatus: ApplicationStatus.Shortlisted,
    titleEn: "Shortlisted",
    titleAr: "القائمة المختصرة",
    color: "#EC4899",
  },
  {
    id: "stage-interview",
    statuses: [ApplicationStatus.InterviewScheduled, ApplicationStatus.Interviewed],
    primaryStatus: ApplicationStatus.InterviewScheduled,
    titleEn: "Interviewing",
    titleAr: "المقابلات الشخصية",
    color: "#F97316",
  },
  {
    id: "stage-offer",
    statuses: [ApplicationStatus.OfferIssued, ApplicationStatus.OfferAccepted],
    primaryStatus: ApplicationStatus.OfferIssued,
    titleEn: "Job Offer",
    titleAr: "عروض العمل",
    color: "#14B8A6",
  },
  {
    id: "stage-hired",
    statuses: [ApplicationStatus.Hired],
    primaryStatus: ApplicationStatus.Hired,
    titleEn: "Hired",
    titleAr: "تم التعيين",
    color: "#10B981",
  },
];

interface RecruitmentKanbanBoardProps {
  selectedOpeningId: number | null;
  onSelectApplication: (application: EmploymentApplicationDto) => void;
  onScheduleInterview: (applicationId: number) => void;
  onEvaluateInterview?: (application: EmploymentApplicationDto) => void;
  onMakeOffer: (applicationId: number) => void;
  onHire: (applicationId: number) => void;
}

export default function RecruitmentKanbanBoard({
  selectedOpeningId,
  onSelectApplication,
  onScheduleInterview,
  onEvaluateInterview,
  onMakeOffer,
  onHire,
}: RecruitmentKanbanBoardProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const perms = useRecruitmentPermissions();
  const isArabic = i18n.language === "ar";

  const { data: appsData, isLoading } = useApplications({
    jobOpeningId: selectedOpeningId ?? undefined,
    pageSize: 100,
  });

  const moveStageMutation = useMoveApplicationStage();
  const rejectMutation = useRejectApplication();

  const [cardMenu, setCardMenu] = useState<{
    el: HTMLElement;
    app: EmploymentApplicationDto;
  } | null>(null);

  const applications = appsData?.items ?? [];

  const handleCardMenuOpen = (e: React.MouseEvent<HTMLElement>, app: EmploymentApplicationDto) => {
    e.stopPropagation();
    setCardMenu({ el: e.currentTarget, app });
  };

  const handleCardMenuClose = () => {
    setCardMenu(null);
  };

  const handleMoveStage = async (targetStatus: ApplicationStatus) => {
    if (!cardMenu) return;
    const { id } = cardMenu.app;
    handleCardMenuClose();
    await moveStageMutation.mutateAsync({ id, targetStatus });
  };

  const handleReject = async () => {
    if (!cardMenu) return;
    const { id } = cardMenu.app;
    handleCardMenuClose();
    await rejectMutation.mutateAsync({ id, reason: "Does not meet role requirements" });
  };

  return (
    <Box sx={{ width: "100%", overflowX: "auto", pb: 2 }}>
      <Box
        sx={{
          display: "flex",
          gap: 2.5,
          minWidth: 1200,
          alignItems: "flex-start",
        }}
      >
        {PIPELINE_STAGES.map((stage) => {
          const stageApps = applications.filter((app) => stage.statuses.includes(app.status));

          return (
            <Box
              key={stage.id}
              sx={{
                flex: 1,
                minWidth: 260,
                maxWidth: 320,
                borderRadius: 3,
                bgcolor:
                  theme.palette.mode === "dark"
                    ? "background.paper"
                    : "#F8FAFC",
                border: `1px solid ${theme.palette.divider}`,
                display: "flex",
                flexDirection: "column",
                maxHeight: "calc(100vh - 280px)",
              }}
            >
              {/* Stage Header */}
              <Box
                sx={{
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottom: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: stage.color,
                    }}
                  />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {isArabic ? stage.titleAr : stage.titleEn}
                  </Typography>
                </Box>
                <Chip
                  label={stageApps.length}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    height: 22,
                    fontSize: "0.75rem",
                    bgcolor: `${stage.color}15`,
                    color: stage.color,
                  }}
                />
              </Box>

              {/* Stage Cards Container */}
              <Box
                sx={{
                  p: 1.5,
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                  flexGrow: 1,
                }}
              >
                <AnimatePresence>
                  {stageApps.map((app) => {
                    const initials = app.candidateName
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase();

                    return (
                      <motion.div
                        key={app.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        drag={perms.canManageApplications}
                        dragSnapToOrigin
                        dragElastic={0.15}
                        whileDrag={{ scale: 1.03, zIndex: 10, cursor: "grabbing" }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card
                          elevation={1}
                          onClick={() => onSelectApplication(app)}
                          sx={{
                            p: 2,
                            borderRadius: 2.5,
                            border: `1px solid ${theme.palette.divider}`,
                            cursor: "pointer",
                            transition: "border-color 0.2s, box-shadow 0.2s",
                            "&:hover": {
                              borderColor: theme.palette.primary.main,
                              boxShadow: theme.shadows[2],
                            },
                          }}
                        >
                          {/* Card Top: Candidate Avatar & Actions */}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              mb: 1.5,
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                              <Avatar
                                sx={{
                                  width: 34,
                                  height: 34,
                                  fontSize: "0.8rem",
                                  fontWeight: 700,
                                  bgcolor: `${stage.color}25`,
                                  color: stage.color,
                                }}
                              >
                                {initials}
                              </Avatar>
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 700, lineHeight: 1.2 }}
                                >
                                  {app.candidateName}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "text.secondary", fontSize: "0.7rem" }}
                                >
                                  {isArabic ? app.positionTitleAr : app.positionTitleEn}
                                </Typography>
                              </Box>
                            </Box>

                            {perms.canManageApplications && (
                              <IconButton
                                size="small"
                                onPointerDown={(e) => e.stopPropagation()}
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={(e) => handleCardMenuOpen(e, app)}
                                sx={{ p: 0.5 }}
                              >
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Box>

                          {/* Evaluation Score if available */}
                          {app.averageEvaluationScore && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
                              <Rating
                                value={app.averageEvaluationScore}
                                max={5}
                                precision={0.5}
                                size="small"
                                readOnly
                              />
                              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                {app.averageEvaluationScore}
                              </Typography>
                            </Box>
                          )}

                          {/* Quick details chips */}
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8, mt: 1 }}>
                            {app.expectedSalary && (
                              <Chip
                                label={`${app.expectedSalary.toLocaleString()} ${app.expectedSalaryCurrencyCode ?? ""}`}
                                size="small"
                                sx={{ height: 20, fontSize: "0.68rem", fontWeight: 600 }}
                              />
                            )}
                            {app.interviewsCount > 0 && (
                              <Chip
                                icon={<EventIcon style={{ fontSize: 12 }} />}
                                label={`${app.interviewsCount} ${t("recruitment.interviews.countBadge", "مقابلات / Interviews")}`}
                                size="small"
                                color="warning"
                                variant="outlined"
                                sx={{ height: 20, fontSize: "0.68rem", fontWeight: 600 }}
                              />
                            )}
                          </Box>

                          {/* Action Bar based on Stage */}
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "flex-end",
                              gap: 1,
                              mt: 1.5,
                              pt: 1,
                              borderTop: `1px dashed ${theme.palette.divider}`,
                            }}
                            onPointerDown={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                          >
                            {app.status === ApplicationStatus.Shortlisted &&
                              (perms.canEvaluateInterviews || perms.canManageApplications) && (
                              <Button
                                size="small"
                                variant="outlined"
                                color="warning"
                                onClick={() => onScheduleInterview(app.id)}
                                sx={{ fontSize: "0.72rem", py: 0.2, px: 1, height: 24 }}
                              >
                                {t("recruitment.actions.scheduleInterview", "مقابلة / Interview")}
                              </Button>
                            )}
                            {(app.status === ApplicationStatus.InterviewScheduled ||
                              app.status === ApplicationStatus.Interviewed) &&
                              perms.canEvaluateInterviews && (
                              <Button
                                size="small"
                                variant="outlined"
                                color="secondary"
                                onClick={() => onEvaluateInterview?.(app)}
                                sx={{ fontSize: "0.72rem", py: 0.2, px: 1, height: 24 }}
                              >
                                {t("recruitment.actions.evaluate", "تقييم / Evaluate")}
                              </Button>
                            )}
                            {app.status === ApplicationStatus.Interviewed &&
                              perms.canManageOffers && (
                              <Button
                                size="small"
                                variant="outlined"
                                color="info"
                                onClick={() => onMakeOffer(app.id)}
                                sx={{ fontSize: "0.72rem", py: 0.2, px: 1, height: 24 }}
                              >
                                {t("recruitment.actions.makeOffer", "عرض عمل / Offer")}
                              </Button>
                            )}
                            {(app.status === ApplicationStatus.OfferIssued ||
                              app.status === ApplicationStatus.OfferAccepted) &&
                              perms.canHire && (
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                startIcon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                                onClick={() => onHire(app.id)}
                                sx={{ fontSize: "0.72rem", py: 0.2, px: 1, height: 24 }}
                              >
                                {t("recruitment.actions.hire", "تعيين / Hire")}
                              </Button>
                            )}
                          </Box>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {stageApps.length === 0 && (
                  <Box
                    sx={{
                      p: 3,
                      textAlign: "center",
                      color: "text.disabled",
                      fontSize: "0.8rem",
                    }}
                  >
                    {t("recruitment.pipeline.emptyStage", "لا يوجد متقدمين في هذه المرحلة")}
                  </Box>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Accessible Stage Move Menu */}
      <Menu anchorEl={cardMenu?.el} open={Boolean(cardMenu)} onClose={handleCardMenuClose}>
        <MenuItem onClick={() => handleMoveStage(ApplicationStatus.UnderReview)}>
          <ArrowForwardIcon fontSize="small" sx={{ mr: 1 }} />
          {t("recruitment.stages.underReview", "نقل إلى المراجعة / Under Review")}
        </MenuItem>
        <MenuItem onClick={() => handleMoveStage(ApplicationStatus.Shortlisted)}>
          <ArrowForwardIcon fontSize="small" sx={{ mr: 1 }} />
          {t("recruitment.stages.shortlist", "نقل إلى القائمة المختصرة / Shortlist")}
        </MenuItem>
        <MenuItem onClick={() => handleMoveStage(ApplicationStatus.InterviewScheduled)}>
          <ArrowForwardIcon fontSize="small" sx={{ mr: 1 }} />
          {t("recruitment.stages.interview", "نقل إلى المقابلات / Interview Stage")}
        </MenuItem>
        <MenuItem onClick={() => handleMoveStage(ApplicationStatus.OfferIssued)}>
          <ArrowForwardIcon fontSize="small" sx={{ mr: 1 }} />
          {t("recruitment.stages.offer", "نقل إلى عرض العمل / Job Offer")}
        </MenuItem>
        <MenuItem onClick={handleReject} sx={{ color: "error.main" }}>
          <CancelOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
          {t("recruitment.actions.reject", "رفض الطلب / Reject Application")}
        </MenuItem>
      </Menu>
    </Box>
  );
}
