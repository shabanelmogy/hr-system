"use client";

import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  LinearProgress,
  Paper,
  Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import GavelRoundedIcon from "@mui/icons-material/GavelRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import { useTranslation } from "react-i18next";
import type { OrganizationalStructureItem } from "../types/OrganizationalStructure";

interface Props {
  open: boolean;
  item: OrganizationalStructureItem | null;
  canEdit?: boolean;
  canApprove?: boolean;
  onClose: () => void;
  onEdit?: (item: OrganizationalStructureItem) => void;
  onApprove?: (item: OrganizationalStructureItem) => void;
  onReject?: (item: OrganizationalStructureItem) => void;
}

export default function JobDescriptionDetailsDialog({
  open,
  item,
  canEdit = false,
  canApprove = false,
  onClose,
  onEdit,
  onApprove,
  onReject,
}: Props) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");

  if (!item) return null;

  const statusKey = typeof item.jobDescriptionStatus === "number"
    ? ({ 1: "draft", 2: "approved", 3: "rejected", 4: "expired" } as const)[item.jobDescriptionStatus]
    : (item.jobDescriptionStatus?.toLowerCase() as "draft" | "approved" | "rejected" | "expired" | undefined) ?? "draft";

  const statusColorMap = {
    draft: "warning",
    approved: "success",
    rejected: "error",
    expired: "default",
  } as const;

  const proficiencyColorMap: Record<string, "info" | "primary" | "secondary" | "success"> = {
    Beginner: "info",
    Intermediate: "primary",
    Advanced: "secondary",
    Expert: "success",
  };

  const isDraft = statusKey === "draft";
  const handlePrint = () => {
    window.print();
  };

  const duties = item.dutySections ?? [];
  const skills = item.skills ?? [];
  const education = item.educationRequirements ?? [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="job-description-details-title"
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: 2.5,
          p: { xs: 1, sm: 2 },
          maxHeight: "90vh",
        },
      }}
    >
      {/* Official Header */}
      <DialogTitle id="job-description-details-title" sx={{ p: 1.5, pb: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 1.2 }}>
                {t("organizationalStructure.jobDescriptionDetails.profileTitle")}
              </Typography>
              <Chip
                label={`v${item.version ?? item.code}`}
                size="small"
                variant="outlined"
                color="primary"
                sx={{ fontWeight: 600, height: 22 }}
              />
              <Chip
                label={t(`organizationalStructure.jobDescriptionStatus.${statusKey}`)}
                size="small"
                color={statusColorMap[statusKey] ?? "default"}
                sx={{ fontWeight: 600, height: 22 }}
              />
            </Box>

            <Typography variant="h5" color="text.primary" sx={{ fontWeight: 700 }}>
              {isAr ? item.nameAr : item.nameEn}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 0.2 }}>
              {isAr ? item.nameEn : item.nameAr}
            </Typography>

            {/* Position & Org Path */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1, flexWrap: "wrap" }}>
              <Chip
                icon={<BusinessRoundedIcon fontSize="small" />}
                label={item.positionCode ? `${item.positionCode} (${item.branchNameAr || item.branchNameEn || t("organizationalStructure.currentCompany")})` : t("organizationalStructure.currentCompany")}
                size="small"
                variant="filled"
                sx={{ bgcolor: "action.hover" }}
              />
              {item.departmentNameAr && (
                <Chip
                  label={`${item.departmentNameAr} / ${item.departmentNameEn}`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Button
              size="small"
              startIcon={<PrintRoundedIcon />}
              onClick={handlePrint}
              variant="outlined"
              color="inherit"
              sx={{ display: { xs: "none", sm: "inline-flex" } }}
            >
              {t("organizationalStructure.jobDescriptionDetails.print")}
            </Button>
            <IconButton onClick={onClose} size="small" aria-label="close">
              <CloseRoundedIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <Divider />

      {/* Document Content */}
      <DialogContent sx={{ p: { xs: 1.5, sm: 2.5 }, display: "flex", flexDirection: "column", gap: 2.5 }}>
        {/* 1. Job Purpose & Overview */}
        {(item.purposeAr || item.purposeEn) && (
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: "background.paper" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <WorkOutlineRoundedIcon color="primary" fontSize="small" />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {t("organizationalStructure.jobDescriptionDetails.overview")}
              </Typography>
            </Box>
            {item.purposeAr && (
              <Typography variant="body2" sx={{ mb: item.purposeEn ? 1 : 0, lineHeight: 1.7 }}>
                {item.purposeAr}
              </Typography>
            )}
            {item.purposeEn && (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", lineHeight: 1.7 }}>
                {item.purposeEn}
              </Typography>
            )}
          </Paper>
        )}

        {/* 2. Key Result Areas & Structured Duties */}
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <WorkOutlineRoundedIcon color="primary" fontSize="small" />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {t("organizationalStructure.jobDescriptionDetails.duties")}
              </Typography>
            </Box>
            {duties.length > 0 && (
              <Chip
                label={`${duties.length} ${isAr ? "مجالات" : "Sections"}`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>

          {duties.length === 0 ? (
            <Box>
              {(item.responsibilitiesAr || item.responsibilitiesEn) ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {item.responsibilitiesAr && (
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
                      {item.responsibilitiesAr}
                    </Typography>
                  )}
                  {item.responsibilitiesEn && (
                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-wrap", fontStyle: "italic", lineHeight: 1.7 }}>
                      {item.responsibilitiesEn}
                    </Typography>
                  )}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {t("organizationalStructure.jobDescriptionDetails.emptyDuties")}
                </Typography>
              )}
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {duties.map((sec, idx) => (
                <Paper
                  key={idx}
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 1.5,
                    bgcolor: "action.hover",
                    borderLeft: (theme) => `4px solid ${theme.palette.primary.main}`,
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1, flexWrap: "wrap", gap: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {idx + 1}. {isAr ? sec.sectionTitleAr || sec.sectionTitleEn : sec.sectionTitleEn || sec.sectionTitleAr}
                      {sec.sectionTitleEn && sec.sectionTitleAr && (
                        <Typography component="span" variant="caption" color="text.secondary" sx={{ mx: 1 }}>
                          ({isAr ? sec.sectionTitleEn : sec.sectionTitleAr})
                        </Typography>
                      )}
                    </Typography>

                    {sec.weightPercentage != null && (
                      <Box sx={{ minWidth: 120, display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600 }}>
                          {sec.weightPercentage}% {t("organizationalStructure.jobDescriptionDetails.weight")}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(sec.weightPercentage, 100)}
                          sx={{ height: 6, borderRadius: 3, flex: 1 }}
                        />
                      </Box>
                    )}
                  </Box>

                  {sec.items && sec.items.length > 0 && (
                    <Box component="ul" sx={{ m: 0, pl: 2.5, pr: isAr ? 2.5 : 0 }}>
                      {sec.items.map((it, itIdx) => (
                        <Box component="li" key={itIdx} sx={{ mb: 0.6, fontSize: "0.875rem", lineHeight: 1.6 }}>
                          <Typography variant="body2" component="span">
                            {isAr ? it.textAr || it.textEn : it.textEn || it.textAr}
                          </Typography>
                          {it.textEn && it.textAr && (
                            <Typography variant="caption" component="span" color="text.secondary" sx={{ display: "block", fontStyle: "italic" }}>
                              {isAr ? it.textEn : it.textAr}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  )}
                </Paper>
              ))}
            </Box>
          )}
        </Paper>

        {/* 3. Skills & Competencies */}
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <PsychologyRoundedIcon color="primary" fontSize="small" />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {t("organizationalStructure.jobDescriptionDetails.skills")}
            </Typography>
          </Box>

          {skills.length === 0 ? (
            item.requiredSkills ? (
              <Typography variant="body2">{item.requiredSkills}</Typography>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {t("organizationalStructure.jobDescriptionDetails.emptySkills")}
              </Typography>
            )
          ) : (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.2 }}>
              {skills.map((s, idx) => {
                const color = proficiencyColorMap[s.proficiencyLevel] ?? "primary";
                return (
                  <Paper
                    key={idx}
                    variant="outlined"
                    sx={{
                      p: 1,
                      px: 1.5,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      bgcolor: s.isMandatory ? "background.paper" : "action.hover",
                      borderColor: s.isMandatory ? "primary.light" : "divider",
                    }}
                  >
                    {s.isMandatory && <StarRoundedIcon color="warning" fontSize="small" />}
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {s.skillName}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 0.5, mt: 0.2 }}>
                        <Chip
                          label={s.proficiencyLevel}
                          size="small"
                          color={color}
                          variant="filled"
                          sx={{ height: 18, fontSize: "0.68rem" }}
                        />
                        <Chip
                          label={s.isMandatory ? t("organizationalStructure.jobDescriptionDetails.mandatory") : t("organizationalStructure.jobDescriptionDetails.optional")}
                          size="small"
                          color={s.isMandatory ? "error" : "default"}
                          variant="outlined"
                          sx={{ height: 18, fontSize: "0.68rem" }}
                        />
                      </Box>
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          )}
        </Paper>

        {/* 4. Education & Qualifications */}
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <SchoolRoundedIcon color="primary" fontSize="small" />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {t("organizationalStructure.jobDescriptionDetails.qualifications")}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {/* Experience */}
            {item.minExperienceYears != null && item.minExperienceYears > 0 && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {t("organizationalStructure.jobDescriptionDetails.minExperience")}:
                </Typography>
                <Chip
                  label={`${item.minExperienceYears} ${t("organizationalStructure.jobDescriptionDetails.years")}`}
                  color="info"
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            )}

            {/* Structured Education */}
            {education.length > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {education.map((req, idx) => (
                  <Paper
                    key={idx}
                    variant="outlined"
                    sx={{ p: 1.2, px: 1.5, borderRadius: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {req.degreeLevel}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {req.fieldOfStudy}
                      </Typography>
                    </Box>
                    <Chip
                      label={req.isRequired ? t("organizationalStructure.jobDescriptionDetails.mandatory") : t("organizationalStructure.jobDescriptionDetails.optional")}
                      size="small"
                      color={req.isRequired ? "primary" : "default"}
                      variant="outlined"
                      sx={{ height: 20 }}
                    />
                  </Paper>
                ))}
              </Box>
            ) : (
              item.requiredEducation && (
                <Typography variant="body2">{item.requiredEducation}</Typography>
              )
            )}

            {/* Preferred Qualifications */}
            {(item.preferredQualificationsAr || item.preferredQualificationsEn) && (
              <Box sx={{ mt: 1, pt: 1, borderTop: 1, borderColor: "divider" }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5, fontWeight: 700 }}>
                  {t("organizationalStructure.jobDescriptionDetails.preferredQualifications")}:
                </Typography>
                {item.preferredQualificationsAr && (
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    {item.preferredQualificationsAr}
                  </Typography>
                )}
                {item.preferredQualificationsEn && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                    {item.preferredQualificationsEn}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </Paper>

        {/* 5. Governance & Audit */}
        {(item.effectiveDate || item.expiryDate || item.decisionReason || item.revisionNotes) && (
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: "action.hover" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <GavelRoundedIcon color="primary" fontSize="small" />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {t("organizationalStructure.jobDescriptionDetails.governance")}
              </Typography>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
              {item.effectiveDate && (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    {t("organizationalStructure.jobDescriptionDetails.effectiveDate")}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {item.effectiveDate.slice(0, 10)}
                  </Typography>
                </Box>
              )}
              {item.expiryDate && (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    {t("organizationalStructure.jobDescriptionDetails.expiryDate")}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {item.expiryDate.slice(0, 10)}
                  </Typography>
                </Box>
              )}
              {item.decisionReason && (
                <Box sx={{ gridColumn: { sm: "1 / -1" } }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    {t("organizationalStructure.jobDescriptionDetails.decisionReason")}
                  </Typography>
                  <Typography variant="body2">
                    {item.decisionReason}
                  </Typography>
                </Box>
              )}
              {item.revisionNotes && (
                <Box sx={{ gridColumn: { sm: "1 / -1" } }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    {t("organizationalStructure.jobDescriptionDetails.revisionNotes")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.revisionNotes}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        )}
      </DialogContent>

      <Divider />

      {/* Footer Actions */}
      <DialogActions sx={{ p: 2, justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
        <Box sx={{ display: "flex", gap: 1 }}>
          {canApprove && isDraft && onApprove && (
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleRoundedIcon />}
              onClick={() => onApprove(item)}
            >
              {t("organizationalStructure.decision.approve")}
            </Button>
          )}
          {canApprove && isDraft && onReject && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelRoundedIcon />}
              onClick={() => onReject(item)}
            >
              {t("organizationalStructure.decision.reject")}
            </Button>
          )}
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          {canEdit && onEdit && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<EditRoundedIcon />}
              onClick={() => onEdit(item)}
            >
              {t("actions.edit")}
            </Button>
          )}
          <Button onClick={onClose} variant="text" color="inherit">
            {t("actions.close", { defaultValue: t("common.close", { defaultValue: "إغلاق" }) })}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
