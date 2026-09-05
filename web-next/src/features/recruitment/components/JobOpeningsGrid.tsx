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
  IconButton,
  Menu,
  MenuItem,
  LinearProgress,
  TextField,
  InputAdornment,
  useTheme,
  Skeleton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useTranslation } from "react-i18next";
import {
  useJobOpenings,
  useOpenJobOpening,
  usePauseJobOpening,
  useCloseJobOpening,
} from "../hooks/useRecruitment";
import { JobOpeningDto, JobOpeningStatus } from "../types";
import { useRecruitmentPermissions } from "@/shared/hooks/usePermissions";

interface JobOpeningsGridProps {
  selectedOpeningId: number | null;
  onSelectOpening: (id: number | null) => void;
  onNewApplication: (openingId: number) => void;
  onCreateOpening: () => void;
}

export default function JobOpeningsGrid({
  selectedOpeningId,
  onSelectOpening,
  onNewApplication,
  onCreateOpening,
}: JobOpeningsGridProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const perms = useRecruitmentPermissions();
  const isArabic = i18n.language === "ar";
  const [search, setSearch] = useState("");
  const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement; opening: JobOpeningDto } | null>(null);

  const { data: openingsData, isLoading } = useJobOpenings({
    search: search.trim() || undefined,
    pageSize: 50,
  });

  const openMutation = useOpenJobOpening();
  const pauseMutation = usePauseJobOpening();
  const closeMutation = useCloseJobOpening();

  const openings = openingsData?.items ?? [];

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, opening: JobOpeningDto) => {
    e.stopPropagation();
    setMenuAnchor({ el: e.currentTarget, opening });
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleStatusChange = async (action: "open" | "pause" | "close") => {
    if (!menuAnchor) return;
    const { id } = menuAnchor.opening;
    handleMenuClose();

    if (action === "open") {
      await openMutation.mutateAsync(id);
    } else if (action === "pause") {
      await pauseMutation.mutateAsync({ id, reason: "Paused by HR manager" });
    } else if (action === "close") {
      await closeMutation.mutateAsync({ id, reason: "Closed by HR manager" });
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      {/* Header & Filter Toolbar */}
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
            {t("recruitment.openings.title", "الوظائف والفرص المتاحة / Job Positions")}
          </Typography>
          <Chip
            label={`${openings.length} ${t("recruitment.openings.positions", "وظيفة / Positions")}`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <TextField
            size="small"
            placeholder={t("recruitment.openings.searchPlaceholder", "بحث عن وظيفة... / Search position...")}
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
          {perms.canManageOpenings && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onCreateOpening}
              sx={{ fontWeight: 600, whiteSpace: "nowrap" }}
            >
              {t("recruitment.openings.create", "وظيفة جديدة / New Position")}
            </Button>
          )}
        </Box>
      </Box>

      {/* Grid of Position Cards */}
      <Grid container spacing={2.5}>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
              <Card sx={{ p: 2, borderRadius: 3 }}>
                <Skeleton variant="text" width="80%" height={32} />
                <Skeleton variant="text" width="50%" height={20} sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 2 }} />
              </Card>
            </Grid>
          ))
        ) : openings.length === 0 ? (
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
              <PersonSearchIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                {t("recruitment.openings.noPositions", "لا توجد وظائف معلنة حالياً / No Job Positions Found")}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                {t("recruitment.openings.noPositionsHelp", "ابدأ بإنشاء وظيفة جديدة لنشرها واستقبال طلبات التوظيف")}
              </Typography>
              {perms.canManageOpenings && (
                <Button variant="contained" startIcon={<AddIcon />} onClick={onCreateOpening}>
                  {t("recruitment.openings.create", "وظيفة جديدة / New Position")}
                </Button>
              )}
            </Box>
          </Grid>
        ) : (
          openings.map((opening) => {
            const isSelected = selectedOpeningId === opening.id;
            const progress =
              opening.positionCount > 0
                ? Math.round((opening.hiredCount / opening.positionCount) * 100)
                : 0;

            const isStatusOpen = opening.status === JobOpeningStatus.Open;

            return (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={opening.id}>
                <Card
                  elevation={isSelected ? 4 : 0}
                  onClick={() => onSelectOpening(isSelected ? null : opening.id)}
                  sx={{
                    borderRadius: 3,
                    border: `1.5px solid ${
                      isSelected ? theme.palette.primary.main : theme.palette.divider
                    }`,
                    bgcolor: isSelected
                      ? `${theme.palette.primary.main}08`
                      : theme.palette.background.paper,
                    cursor: "pointer",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      borderColor: theme.palette.primary.main,
                      transform: "translateY(-3px)",
                      boxShadow: theme.shadows[3],
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    {/* Top Row: Department & Actions */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 1.5,
                      }}
                    >
                      <Chip
                        label={isArabic ? opening.departmentNameAr : opening.departmentNameEn}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          bgcolor: `${theme.palette.primary.main}15`,
                          color: theme.palette.primary.main,
                        }}
                      />

                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Chip
                          label={
                            opening.status === JobOpeningStatus.Open
                              ? t("recruitment.status.open", "مفتوح / Open")
                              : opening.status === JobOpeningStatus.Paused
                              ? t("recruitment.status.paused", "معلق / Paused")
                              : t("recruitment.status.closed", "مغلق / Closed")
                          }
                          size="small"
                          color={
                            opening.status === JobOpeningStatus.Open
                              ? "success"
                              : opening.status === JobOpeningStatus.Paused
                              ? "warning"
                              : "default"
                          }
                          sx={{ fontWeight: 600, height: 22 }}
                        />
                        {perms.canManageOpenings && (
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, opening)}
                            sx={{ p: 0.5 }}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </Box>

                    {/* Job Title */}
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 700,
                        lineHeight: 1.3,
                        mb: 1,
                        color: "text.primary",
                      }}
                    >
                      {isArabic ? opening.positionTitleAr : opening.positionTitleEn}
                    </Typography>

                    {/* Opening Code & Branch */}
                    <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>
                      {opening.openingNumber} • {isArabic ? opening.branchNameAr : opening.branchNameEn}
                    </Typography>

                    {/* Hiring Progress */}
                    <Box sx={{ mb: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 0.5,
                        }}
                      >
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
                          {t("recruitment.openings.hiredProgress", "تم تعيين:")} {opening.hiredCount} /{" "}
                          {opening.positionCount}
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: "primary.main" }}>
                          {progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>

                    {/* Action buttons */}
                    <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                      <Button
                        size="small"
                        fullWidth
                        variant={isSelected ? "contained" : "outlined"}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectOpening(isSelected ? null : opening.id);
                        }}
                        sx={{ fontWeight: 600, fontSize: "0.8rem", borderRadius: 2 }}
                      >
                        {opening.activeApplicationsCount}{" "}
                        {t("recruitment.openings.applicationsCount", "متقدم / Applications")}
                      </Button>
                      {(perms.canManageCandidates || perms.canManageApplications) && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNewApplication(opening.id);
                          }}
                          title={t("recruitment.openings.addApplicant", "إضافة متقدم / Add Applicant")}
                          sx={{ minWidth: 36, px: 1, borderRadius: 2 }}
                        >
                          <AddIcon fontSize="small" />
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })
        )}
      </Grid>

      {/* Position Context Menu */}
      <Menu anchorEl={menuAnchor?.el} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        {menuAnchor?.opening.status !== JobOpeningStatus.Open && (
          <MenuItem onClick={() => handleStatusChange("open")}>
            <PlayCircleIcon fontSize="small" sx={{ mr: 1, color: "success.main" }} />
            {t("recruitment.actions.openOpening", "تنشيط الوظيفة / Open Opening")}
          </MenuItem>
        )}
        {menuAnchor?.opening.status === JobOpeningStatus.Open && (
          <MenuItem onClick={() => handleStatusChange("pause")}>
            <PauseCircleIcon fontSize="small" sx={{ mr: 1, color: "warning.main" }} />
            {t("recruitment.actions.pauseOpening", "إيقاف مؤقت / Pause Opening")}
          </MenuItem>
        )}
        {menuAnchor?.opening.status !== JobOpeningStatus.Closed && (
          <MenuItem onClick={() => handleStatusChange("close")}>
            <CheckCircleIcon fontSize="small" sx={{ mr: 1, color: "error.main" }} />
            {t("recruitment.actions.closeOpening", "إغلاق الوظيفة / Close Opening")}
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
}
