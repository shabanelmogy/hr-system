"use client";

import { Box, Button, Checkbox, FormControlLabel, IconButton, Paper, Stack, TextField, Typography } from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { useTranslation } from "react-i18next";
import type { JobEducationRequirement } from "../../types/OrganizationalStructure";

interface Props {
  requirements: JobEducationRequirement[];
  onChange: (requirements: JobEducationRequirement[]) => void;
  disabled?: boolean;
}

export function EducationRequirementsEditor({ requirements = [], onChange, disabled = false }: Props) {
  const { t } = useTranslation();

  const handleAdd = () => {
    onChange([...requirements, { degreeLevel: "", fieldOfStudy: "", isRequired: true }]);
  };

  const handleRemove = (index: number) => {
    onChange(requirements.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, updated: Partial<JobEducationRequirement>) => {
    onChange(requirements.map((item, i) => (i === index ? { ...item, ...updated } : item)));
  };

  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {t("organizationalStructure.educationEditor.educationAndDegreeRequirements")}
        </Typography>
        {!disabled && (
          <Button size="small" startIcon={<AddRoundedIcon />} onClick={handleAdd} variant="outlined">
            {t("organizationalStructure.educationEditor.addEducation")}
          </Button>
        )}
      </Box>

      {requirements.length === 0 ? (
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {t("organizationalStructure.educationEditor.emptyDescription")}
        </Typography>
      ) : (
        <Stack spacing={1}>
          {requirements.map((req, index) => (
            <Paper key={index} variant="outlined" sx={{ p: 1.5, display: "flex", gap: 1.5, alignItems: "center" }}>
              <TextField
                size="small"
                label={t("organizationalStructure.educationEditor.degreeLevelLabel")}
                value={req.degreeLevel}
                disabled={disabled}
                onChange={(e) => handleUpdate(index, { degreeLevel: e.target.value })}
                sx={{ flex: 1.5 }}
              />
              <TextField
                size="small"
                label={t("organizationalStructure.educationEditor.fieldOfStudy")}
                value={req.fieldOfStudy}
                disabled={disabled}
                onChange={(e) => handleUpdate(index, { fieldOfStudy: e.target.value })}
                sx={{ flex: 2 }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={req.isRequired}
                    disabled={disabled}
                    onChange={(e) => handleUpdate(index, { isRequired: e.target.checked })}
                    size="small"
                  />
                }
                label={<Typography variant="caption">{t("organizationalStructure.educationEditor.required")}</Typography>}
                sx={{ m: 0 }}
              />
              {!disabled && (
                <IconButton size="small" color="error" onClick={() => handleRemove(index)}>
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              )}
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
}
