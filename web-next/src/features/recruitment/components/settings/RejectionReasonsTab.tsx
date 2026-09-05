"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  Chip,
  IconButton,
  Tooltip,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import BlockIcon from "@mui/icons-material/Block";
import { useTranslation } from "react-i18next";
import type { RejectionReasonConfig } from "../../types/recruitmentSettingsTypes";
import RejectionReasonDialog from "./RejectionReasonDialog";

interface RejectionReasonsTabProps {
  reasons: RejectionReasonConfig[];
  onAddReason: (data: Omit<RejectionReasonConfig, "id">) => void;
  onUpdateReason: (id: string, updates: Partial<RejectionReasonConfig>) => void;
  onDeleteReason: (id: string) => void;
}

export default function RejectionReasonsTab({
  reasons,
  onAddReason,
  onUpdateReason,
  onDeleteReason,
}: RejectionReasonsTabProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<RejectionReasonConfig | null>(null);

  const handleOpenAdd = () => {
    setSelectedReason(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (reason: RejectionReasonConfig) => {
    setSelectedReason(reason);
    setDialogOpen(true);
  };

  const handleSave = (data: Omit<RejectionReasonConfig, "id">) => {
    if (selectedReason) {
      onUpdateReason(selectedReason.id, data);
    } else {
      onAddReason(data);
    }
  };

  const getCategoryChip = (cat: RejectionReasonConfig["category"]) => {
    switch (cat) {
      case "salary":
        return <Chip label={t("recruitment.settings.catSalary", "الراتب والميزانية")} size="small" color="warning" variant="outlined" />;
      case "qualifications":
        return <Chip label={t("recruitment.settings.catQuals", "المؤهلات والخبرات")} size="small" color="primary" variant="outlined" />;
      case "behavioral":
        return <Chip label={t("recruitment.settings.catBehavioral", "السلوك والثقافة")} size="small" color="secondary" variant="outlined" />;
      case "candidate_withdrew":
        return <Chip label={t("recruitment.settings.catWithdrew", "انسحاب المرشح")} size="small" color="default" variant="outlined" />;
      default:
        return <Chip label={t("recruitment.settings.catOther", "أخرى")} size="small" variant="outlined" />;
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
            {t("recruitment.settings.reasonsTitle", "أسباب الرفض والاستبعاد (Refuse / Rejection Reasons)")}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {t(
              "recruitment.settings.reasonsSubtitle",
              "توثيق أسباب استبعاد المرشحين بدقة لمنع التقدير العشوائي، مع إمكانية إرسال إيميل اعتذار مهني تلقائي مثل أودو"
            )}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          sx={{ fontWeight: 600 }}
        >
          {t("recruitment.settings.newReasonBtn", "إضافة سبب رفض")}
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        {t(
          "recruitment.settings.reasonsHint",
          "عند استبعاد أي مرشح من لوحة التوظيف، يطلب النظام تحديد سبب الاستبعاد لتوليد تحليلات التوظيف (لماذا نخسر المرشحين؟)، وتفعيل التواصل الاحترافي معهم."
        )}
      </Alert>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {reasons.map((r) => (
          <Card
            key={r.id}
            variant="outlined"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
              borderRadius: 2,
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <BlockIcon sx={{ color: "error.light" }} />
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {isArabic ? r.reasonAr : r.reasonEn}
                  </Typography>
                  {getCategoryChip(r.category)}
                </Box>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {isArabic ? r.reasonEn : r.reasonAr}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              {r.sendAutoEmail && (
                <Tooltip title={r.emailBodyAr || t("recruitment.settings.autoEmailActive", "إيميل اعتذار مهني مفعل")}>
                  <Chip
                    icon={<MarkEmailReadOutlinedIcon />}
                    label={t("recruitment.settings.autoEmailActive", "اعتذار آلي")}
                    size="small"
                    color="success"
                    variant="outlined"
                    sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                  />
                </Tooltip>
              )}

              <IconButton
                size="small"
                onClick={() => handleOpenEdit(r)}
                sx={{ color: "primary.main" }}
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>

              <IconButton
                size="small"
                onClick={() => onDeleteReason(r.id)}
                sx={{ color: "error.main" }}
              >
                <DeleteOutlineRoundedIcon fontSize="small" />
              </IconButton>
            </Box>
          </Card>
        ))}
      </Box>

      {/* Reason Dialog */}
      <RejectionReasonDialog
        open={dialogOpen}
        reason={selectedReason}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
      />
    </Box>
  );
}
