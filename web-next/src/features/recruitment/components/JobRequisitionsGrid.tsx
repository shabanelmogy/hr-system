"use client";

import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  Button,
  TextField,
  InputAdornment,
  useTheme,
  Skeleton,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CancelIcon from "@mui/icons-material/Cancel";
import BusinessIcon from "@mui/icons-material/Business";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import SendIcon from "@mui/icons-material/Send";
import { useTranslation } from "react-i18next";
import {
  useJobRequisitions,
  useApproveJobRequisition,
  useRejectJobRequisition,
  useSubmitJobRequisition,
} from "../hooks/useRecruitment";
import { JobRequisitionDto, JobRequisitionStatus, EmploymentType, WorkArrangement, RequisitionType } from "../types";
import { useRecruitmentPermissions } from "@/shared/hooks/usePermissions";
import { showToast } from "@/shared/components/feedback/transient/showToast";

interface JobRequisitionsGridProps {
  onCreateRequisition: () => void;
  onOpenJobOpeningFromRequisition: (requisition: JobRequisitionDto) => void;
}

export default function JobRequisitionsGrid({
  onCreateRequisition,
  onOpenJobOpeningFromRequisition,
}: JobRequisitionsGridProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const perms = useRecruitmentPermissions();
  const isArabic = i18n.language === "ar";
  const [search, setSearch] = useState("");
  const [rejectDialogId, setRejectDialogId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const approveMutation = useApproveJobRequisition();
  const rejectMutation = useRejectJobRequisition();
  const submitMutation = useSubmitJobRequisition();

  const handleApprove = async (id: number) => {
    try {
      await approveMutation.mutateAsync(id);
      showToast.success(t("recruitment.requisitions.approvedSuccess", "تم اعتماد طلب الاحتياج بنجاح"));
    } catch (err: any) {
      showToast.error(err, t("common.error", "حدث خطأ أثناء الاعتماد"));
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectDialogId || !rejectReason.trim()) return;
    try {
      await rejectMutation.mutateAsync({ id: rejectDialogId, reason: rejectReason.trim() });
      showToast.success(t("recruitment.requisitions.rejectedSuccess", "تم رفض طلب الاحتياج"));
      setRejectDialogId(null);
      setRejectReason("");
    } catch (err: any) {
      showToast.error(err, t("common.error", "حدث خطأ أثناء الرفض"));
    }
  };

  const handleSubmit = async (id: number) => {
    try {
      await submitMutation.mutateAsync(id);
      showToast.success(t("recruitment.requisitions.submittedSuccess", "تم تقديم طلب الاحتياج للاعتماد"));
    } catch (err: any) {
      showToast.error(err, t("common.error", "حدث خطأ أثناء التقديم"));
    }
  };

  const { data: requisitionsData, isLoading } = useJobRequisitions({
    search: search.trim() || undefined,
    pageSize: 50,
  });

  const requisitions = requisitionsData?.items ?? [];

  const getStatusChip = (status: JobRequisitionStatus) => {
    switch (status) {
      case JobRequisitionStatus.Approved:
        return (
          <Chip
            icon={<CheckCircleIcon sx={{ fontSize: "16px !important" }} />}
            label={t("recruitment.requisitionStatus.approved", "معتمد / Approved")}
            color="success"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        );
      case JobRequisitionStatus.PendingApproval:
        return (
          <Chip
            icon={<HourglassEmptyIcon sx={{ fontSize: "16px !important" }} />}
            label={t("recruitment.requisitionStatus.pending", "بانتظار الاعتماد / Pending")}
            color="warning"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        );
      case JobRequisitionStatus.Rejected:
        return (
          <Chip
            icon={<CancelIcon sx={{ fontSize: "16px !important" }} />}
            label={t("recruitment.requisitionStatus.rejected", "مرفوض / Rejected")}
            color="error"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        );
      default:
        return (
          <Chip
            label={t("recruitment.requisitionStatus.draft", "مسودة / Draft")}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        );
    }
  };

  const getEmploymentTypeName = (type: EmploymentType) => {
    switch (type) {
      case EmploymentType.FullTime:
        return t("recruitment.types.fullTime", "دوام كامل / Full Time");
      case EmploymentType.PartTime:
        return t("recruitment.types.partTime", "دوام جزئي / Part Time");
      case EmploymentType.Contract:
        return t("recruitment.types.contract", "عقد / Contract");
      case EmploymentType.Internship:
        return t("recruitment.types.internship", "تدريب / Internship");
      default:
        return "";
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      {/* Header & Search Toolbar */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
          mb: 2.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {t("recruitment.requisitions.title", "طلبات الاحتياج الوظيفي / Job Requisitions")}
          </Typography>
          <Chip
            label={`${requisitions.length} ${t("recruitment.requisitions.countLabel", "طلب احتياج")}`}
            size="small"
            color="secondary"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <TextField
            size="small"
            placeholder={t("recruitment.requisitions.searchPlaceholder", "بحث في طلبات الاحتياج...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ width: { xs: "100%", sm: 260 } }}
          />
          {perms.canManageRequisitions && (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={onCreateRequisition}
              sx={{ fontWeight: 600, whiteSpace: "nowrap" }}
            >
              {t("recruitment.requisitions.newRequisition", "طلب احتياج جديد / New Requisition")}
            </Button>
          )}
        </Box>
      </Box>

      {/* Grid of Requisition Cards */}
      <Grid container spacing={2.5}>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
              <Card sx={{ p: 2.5, borderRadius: 3 }}>
                <Skeleton variant="text" width="60%" height={32} />
                <Skeleton variant="text" width="40%" height={20} sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
              </Card>
            </Grid>
          ))
        ) : requisitions.length === 0 ? (
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                p: 5,
                textAlign: "center",
                borderRadius: 3,
                border: `1px dashed ${theme.palette.divider}`,
                bgcolor: theme.palette.background.paper,
              }}
            >
              <AssignmentIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                {t("recruitment.requisitions.noRequisitions", "لا توجد طلبات احتياج وظيفي مسجلة")}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                {t(
                  "recruitment.requisitions.noRequisitionsHelp",
                  "يمكن للإدارات المختلفة رفع طلبات احتياج لطلب كوادر جديدة واعتمادها لفتح شواغر"
                )}
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<AddIcon />}
                onClick={onCreateRequisition}
              >
                {t("recruitment.requisitions.newRequisition", "رفع طلب احتياج جديد")}
              </Button>
            </Box>
          </Grid>
        ) : (
          requisitions.map((req) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={req.id}>
              <Card
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                  },
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  {/* Requisition Number and Status */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 1.5,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        px: 1,
                        py: 0.4,
                        bgcolor: theme.palette.action.hover,
                        borderRadius: 1.5,
                        fontFamily: "monospace",
                      }}
                    >
                      {req.requisitionNumber}
                    </Typography>
                    {getStatusChip(req.status)}
                  </Box>

                  {/* Position Title */}
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: "text.primary",
                      mb: 1,
                    }}
                  >
                    {isArabic ? req.positionTitleAr || req.positionTitleEn : req.positionTitleEn || req.positionTitleAr}
                  </Typography>

                  {/* Department & Branch */}
                  <Stack spacing={0.8} sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <BusinessIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        {isArabic ? req.departmentNameAr || req.departmentNameEn : req.departmentNameEn || req.departmentNameAr}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <LocationOnIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        {isArabic ? req.branchNameAr || req.branchNameEn : req.branchNameEn || req.branchNameAr}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Requested Positions & Type Badges */}
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1.5 }}>
                    <Chip
                      icon={<PeopleAltIcon sx={{ fontSize: "14px !important" }} />}
                      label={`${req.requestedPositions} ${t("recruitment.openings.positions", "مقاعد مطلوبة")}`}
                      size="small"
                      color="primary"
                      variant="filled"
                      sx={{ fontWeight: 600 }}
                    />
                    <Chip
                      label={getEmploymentTypeName(req.employmentType)}
                      size="small"
                      variant="outlined"
                    />
                    {req.type === RequisitionType.Replacement ? (
                      <Chip
                        label={
                          req.replacementEmployeeName
                            ? `${t("recruitment.requisitions.replacementFor", "إحلال:")} ${req.replacementEmployeeName}`
                            : t("recruitment.requisitions.typeReplacement", "إحلال / Replacement")
                        }
                        size="small"
                        color="info"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    ) : (
                      <Chip
                        label={t("recruitment.requisitions.typeNewPosition", "وظيفة جديدة")}
                        size="small"
                        variant="outlined"
                      />
                    )}
                    {req.isBudgeted ? (
                      <Chip
                        label={t("recruitment.requisitions.budgeted", "مدرج بالموازنة")}
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    ) : (
                      <Chip
                        label={t("recruitment.requisitions.unbudgeted", "غير مدرج بالموازنة")}
                        size="small"
                        color="warning"
                        variant="filled"
                        sx={{ fontWeight: 700 }}
                      />
                    )}
                  </Box>

                  {/* Business Reason and Budget Justification */}
                  {req.businessReason && (
                    <Box
                      sx={{
                        p: 1.5,
                        bgcolor: theme.palette.action.hover,
                        borderRadius: 2,
                        mb: 1.5,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        <strong>{t("recruitment.requisitions.businessReasonShort", "المبرر:")} </strong>
                        {req.businessReason}
                      </Typography>
                    </Box>
                  )}

                  {!req.isBudgeted && req.budgetJustification && (
                    <Box
                      sx={{
                        p: 1.2,
                        bgcolor: (t) => (t.palette.mode === "dark" ? "warning.dark" : "warning.light"),
                        color: "warning.contrastText",
                        borderRadius: 2,
                        mb: 2,
                        border: 1,
                        borderColor: "warning.main",
                      }}
                    >
                      <Typography variant="caption" sx={{ display: "block", fontWeight: 700 }}>
                        {t("recruitment.requisitions.budgetJustificationShort", "مبرر الموازنة:")} {req.budgetJustification}
                      </Typography>
                    </Box>
                  )}

                  <Divider sx={{ mb: 2 }} />

                  {/* Actions */}
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {new Date(req.createdOn).toLocaleDateString(isArabic ? "ar-EG" : "en-US")}
                    </Typography>

                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      {req.status === JobRequisitionStatus.Draft && perms.canManageRequisitions && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          startIcon={<SendIcon />}
                          onClick={() => handleSubmit(req.id)}
                          disabled={submitMutation.isPending}
                          sx={{ fontWeight: 600, fontSize: "0.78rem" }}
                        >
                          {t("recruitment.requisitions.submitBtn", "تقديم للاعتماد / Submit")}
                        </Button>
                      )}

                      {req.status === JobRequisitionStatus.PendingApproval && perms.canApproveRequisitions && (
                        <>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircleIcon />}
                            onClick={() => handleApprove(req.id)}
                            disabled={approveMutation.isPending}
                            sx={{ fontWeight: 600, fontSize: "0.78rem" }}
                          >
                            {t("recruitment.requisitions.approveBtn", "اعتماد / Approve")}
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<CancelIcon />}
                            onClick={() => {
                              setRejectDialogId(req.id);
                              setRejectReason("");
                            }}
                            disabled={rejectMutation.isPending}
                            sx={{ fontWeight: 600, fontSize: "0.78rem" }}
                          >
                            {t("recruitment.requisitions.rejectBtn", "رفض / Reject")}
                          </Button>
                        </>
                      )}

                      {req.status === JobRequisitionStatus.Approved && perms.canManageOpenings && (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<WorkOutlineRoundedIcon />}
                          onClick={() => onOpenJobOpeningFromRequisition(req)}
                          sx={{ fontWeight: 600, fontSize: "0.78rem" }}
                        >
                          {t("recruitment.requisitions.openOpeningBtn", "فتح شاغر وظيفي")}
                        </Button>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Rejection Dialog */}
      <Dialog
        open={Boolean(rejectDialogId)}
        onClose={() => setRejectDialogId(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {t("recruitment.requisitions.rejectDialogTitle", "رفض طلب الاحتياج الوظيفي")}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            {t("recruitment.requisitions.rejectDialogHelp", "يرجى توضيح سبب رفض طلب الاحتياج لإعلام صاحب الطلب.")}
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            label={t("recruitment.requisitions.rejectReasonLabel", "سبب الرفض / Rejection Reason")}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="text" onClick={() => setRejectDialogId(null)}>
            {t("common.cancel", "إلغاء / Cancel")}
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={!rejectReason.trim() || rejectMutation.isPending}
            onClick={handleRejectConfirm}
          >
            {rejectMutation.isPending ? t("common.processing", "جار المعالجة...") : t("common.reject", "تأكيد الرفض / Confirm Reject")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
