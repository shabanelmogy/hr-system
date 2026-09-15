"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Chip,
  Button,
  Avatar,
  Grid,
  Rating,
  TextField,
  useTheme,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import WorkIcon from "@mui/icons-material/Work";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DescriptionIcon from "@mui/icons-material/Description";
import TimelineIcon from "@mui/icons-material/Timeline";
import { useTranslation } from "react-i18next";
import { showToast } from "@/shared/components/feedback/transient/showToast";
import { EmploymentApplicationDto, ApplicationStatus } from "../types";
import { useHireApplication, useRejectApplication } from "../hooks/useRecruitment";
import { useRecruitmentPermissions } from "@/shared/hooks/usePermissions";

interface CandidateDetailDialogProps {
  open: boolean;
  application: EmploymentApplicationDto | null;
  onClose: () => void;
  onScheduleInterview?: (applicationId: number) => void;
  onEvaluateInterview?: (application: EmploymentApplicationDto) => void;
  onMakeOffer?: (applicationId: number) => void;
}

export default function CandidateDetailDialog({
  open,
  application,
  onClose,
  onScheduleInterview,
  onEvaluateInterview,
  onMakeOffer,
}: CandidateDetailDialogProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const perms = useRecruitmentPermissions();
  const isArabic = i18n.language === "ar";

  const employeeNumberKey = application?.id ?? 0;
  const [hiringState, setHiringState] = useState({ key: 0, value: false });
  const isHiring = hiringState.key === employeeNumberKey ? hiringState.value : false;
  const defaultEmployeeNumber = `EMP-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(employeeNumberKey || 1).padStart(3, "0")}`;
  const [employeeNumberState, setEmployeeNumberState] = useState({ key: 0, value: "" });
  const employeeNumber = employeeNumberState.key === employeeNumberKey
    ? employeeNumberState.value
    : defaultEmployeeNumber;
  const hireIdempotencyKey = useRef<string>(`hire-${application?.id ?? 0}-${crypto.randomUUID()}`);
  useEffect(() => {
    hireIdempotencyKey.current = `hire-${application?.id ?? 0}-${crypto.randomUUID()}`;
  }, [application?.id]);

  const hireMutation = useHireApplication();
  const rejectMutation = useRejectApplication();

  if (!application) return null;

  const handleHireSubmit = async () => {
    try {
      await hireMutation.mutateAsync({
        id: application.id,
        data: {
          employeeNumber,
          hireDate: new Date().toISOString().split("T")[0],
          idempotencyKey: hireIdempotencyKey.current,
        },
      });
      showToast.success(t("recruitment.pipeline.hireSuccess", "تم تعيين المرشح بنجاح وإغلاق مسار التوظيف"));
      setHiringState({ key: employeeNumberKey, value: false });
      hireIdempotencyKey.current = `hire-${application.id}-${crypto.randomUUID()}`;
      onClose();
    } catch (err: unknown) {
      showToast.error(err, t("common.error", "حدث خطأ أثناء التعيين"));
    }
  };

  const handleRejectSubmit = async () => {
    try {
      await rejectMutation.mutateAsync({
        id: application.id,
        reason: "Application rejected by hiring manager",
      });
      showToast.success(t("recruitment.pipeline.rejectSuccess", "تم استبعاد الطلب بنجاح"));
      onClose();
    } catch (err: unknown) {
      showToast.error(err, t("common.error", "حدث خطأ أثناء استبعاد الطلب"));
    }
  };

  const initials = application.candidateName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      {/* Dialog Header */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: "primary.main",
              fontWeight: 700,
              fontSize: "1.1rem",
            }}
          >
            {initials}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {application.candidateName}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {isArabic ? application.positionTitleAr : application.positionTitleEn} • {application.openingNumber}
            </Typography>
          </Box>
        </Box>

        <Chip
          label={ApplicationStatus[application.status]}
          color={
            application.status === ApplicationStatus.Hired
              ? "success"
              : application.status === ApplicationStatus.Rejected
              ? "error"
              : "primary"
          }
          sx={{ fontWeight: 600 }}
        />
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Left Column: Contact & Application Details */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: "primary.main" }}>
              {t("recruitment.candidate.contactInfo", "معلومات الاتصال / Contact Information")}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2, mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <EmailIcon fontSize="small" sx={{ color: "text.secondary" }} />
                <Typography variant="body2">{application.candidateEmail}</Typography>
              </Box>
              {application.candidatePhone && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PhoneIcon fontSize="small" sx={{ color: "text.secondary" }} />
                  <Typography variant="body2">{application.candidatePhone}</Typography>
                </Box>
              )}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <WorkIcon fontSize="small" sx={{ color: "text.secondary" }} />
                <Typography variant="body2">
                  {isArabic ? application.departmentNameAr : application.departmentNameEn} •{" "}
                  {isArabic ? application.branchNameAr : application.branchNameEn}
                </Typography>
              </Box>
            </Box>

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: "primary.main" }}>
              {t("recruitment.candidate.jobPreferences", "تفضيلات الوظيفة / Job Preferences")}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 3 }}>
              {application.expectedSalary && (
                <Typography variant="body2">
                  <strong>{t("recruitment.candidate.salary", "الراتب المتوقع / Expected Salary")}:</strong>{" "}
                  {application.expectedSalary.toLocaleString()} {application.expectedSalaryCurrencyCode ?? ""}
                </Typography>
              )}
              {application.availableFrom && (
                <Typography variant="body2">
                  <strong>{t("recruitment.candidate.availableFrom", "متاح للعمل من / Available From")}:</strong>{" "}
                  {application.availableFrom}
                </Typography>
              )}
              {application.coverLetter && (
                <Box sx={{ mt: 1, p: 1.5, bgcolor: "action.hover", borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.5 }}>
                    {t("recruitment.candidate.coverLetter", "خطاب التقديم / Cover Letter")}:
                  </Typography>
                  <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                    &quot;{application.coverLetter}&quot;
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Resume File */}
            {application.resumeFileId && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: "background.paper",
                }}
              >
                <DescriptionIcon color="primary" />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {t("recruitment.candidate.resumeFile", "السيرة الذاتية / Candidate Resume")}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {t("recruitment.candidate.attachedFile", "ملف مرفق / Attached Document")}
                  </Typography>
                </Box>
                <Button size="small" variant="outlined">
                  {t("recruitment.candidate.download", "تحميل / Download")}
                </Button>
              </Box>
            )}
          </Grid>

          {/* Right Column: Scorecard & Timeline */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: "primary.main" }}>
              {t("recruitment.candidate.evaluations", "تقييم المقابلات / Interview Scorecard")}
            </Typography>

            <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2.5, border: `1px solid ${theme.palette.divider}`, mb: 3 }}>
              {application.averageEvaluationScore ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Rating
                    value={application.averageEvaluationScore}
                    precision={0.5}
                    readOnly
                  />
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {application.averageEvaluationScore} / 5.0
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {t("recruitment.candidate.noEvaluations", "لم يتم تسجيل تقييمات للمقابلات بعد / No evaluations yet")}
                </Typography>
              )}

              <Box sx={{ mt: 1.5, display: "flex", justifyContent: "flex-end" }}>
                <Button
                  size="small"
                  variant="outlined"
                  color="secondary"
                  onClick={() => onEvaluateInterview?.(application)}
                >
                  {t("recruitment.candidate.openScorecard", "بطاقة التقييم / Scorecard")}
                </Button>
              </Box>
            </Box>

            {/* Pipeline Status History Timeline */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: "primary.main" }}>
              {t("recruitment.candidate.statusTimeline", "سجل مراحل الطلب / Stage Timeline")}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {application.statusHistory.map((hist, idx) => (
                <Box
                  key={hist.id || idx}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.5,
                    position: "relative",
                  }}
                >
                  <TimelineIcon fontSize="small" sx={{ color: "primary.main", mt: 0.2 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {ApplicationStatus[hist.toStatus]}
                    </Typography>
                    {hist.reason && (
                      <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                        {hist.reason}
                      </Typography>
                    )}
                    <Typography variant="caption" sx={{ color: "text.disabled" }}>
                      {new Date(hist.changedOn).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>

        {/* Inline One-Click Hire Section */}
        {isHiring && perms.canHire && (
          <Box
            sx={{
              mt: 3,
              p: 2.5,
              borderRadius: 2.5,
              bgcolor: `${theme.palette.success.main}10`,
              border: `1px solid ${theme.palette.success.main}`,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "success.main", mb: 1.5 }}>
              {t("recruitment.hire.confirmTitle", "تأكيد تعيين المرشح / Confirm Hiring")}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {t("recruitment.hire.confirmHelp", "سيتم إنشاء ملف موظف جديد وربطه تلقائياً وتحديث الشواغر في الوظيفة.")}
            </Typography>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <TextField
                size="small"
                label={t("recruitment.hire.employeeNumber", "رقم الموظف / Employee Number")}
                value={employeeNumber}
                onChange={(e) => setEmployeeNumberState({ key: employeeNumberKey, value: e.target.value })}
                sx={{ width: 260 }}
              />
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={handleHireSubmit}
                disabled={hireMutation.isPending}
              >
                {hireMutation.isPending
                  ? t("common.processing", "جار المعالجة...")
                  : t("recruitment.hire.execute", "إتمام التعيين الآن / Complete Hire")}
              </Button>
              <Button variant="text" onClick={() => setHiringState({ key: employeeNumberKey, value: false })}>
                {t("common.cancel", "إلغاء")}
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${theme.palette.divider}` }}>
        {perms.canManageApplications && (
          <Button
            color="error"
            onClick={handleRejectSubmit}
            disabled={application.status === ApplicationStatus.Rejected}
          >
            {t("recruitment.actions.reject", "رفض الطلب / Reject")}
          </Button>
        )}

        <Box sx={{ flexGrow: 1 }} />

        {onScheduleInterview &&
          application.status === ApplicationStatus.Shortlisted &&
          perms.canManageApplications && (
          <Button
            variant="outlined"
            color="warning"
            onClick={() => {
              onClose();
              onScheduleInterview(application.id);
            }}
          >
            {t("recruitment.actions.scheduleInterview", "جدولة مقابلة / Schedule Interview")}
          </Button>
        )}

        {onMakeOffer &&
          application.status === ApplicationStatus.Interviewed &&
          perms.canManageOffers && (
          <Button
            variant="outlined"
            color="info"
            onClick={() => {
              onClose();
              onMakeOffer(application.id);
            }}
          >
            {t("recruitment.actions.makeOffer", "إصدار عرض عمل / Make Offer")}
          </Button>
        )}

        {application.status !== ApplicationStatus.OfferAccepted && application.status !== ApplicationStatus.Hired && perms.canHire && (
          <Typography variant="caption" color="text.secondary">{t("recruitment.hire.acceptedOfferRequired", "Hiring is available only after the candidate accepts an offer.")}</Typography>
        )}
        {application.status === ApplicationStatus.OfferAccepted && !isHiring && perms.canHire && (
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
            onClick={() => setHiringState({ key: employeeNumberKey, value: true })}
          >
            {t("recruitment.actions.hire", "تعيين المرشح / Hire Candidate")}
          </Button>
        )}

        <Button variant="outlined" onClick={onClose}>
          {t("common.close", "إغلاق / Close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
