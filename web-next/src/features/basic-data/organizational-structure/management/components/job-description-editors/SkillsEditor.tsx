"use client";

import { Box, Button, Checkbox, FormControlLabel, IconButton, MenuItem, Paper, Select, Stack, TextField, Typography } from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { useTranslation } from "react-i18next";
import type { JobSkillItem } from "../../types/OrganizationalStructure";

interface Props {
  skills: JobSkillItem[];
  onChange: (skills: JobSkillItem[]) => void;
  disabled?: boolean;
}

const proficiencyLevels = [
  { value: "Beginner", labelAr: "مبتدئ", labelEn: "Beginner" },
  { value: "Intermediate", labelAr: "متوسط", labelEn: "Intermediate" },
  { value: "Advanced", labelAr: "متقدم", labelEn: "Advanced" },
  { value: "Expert", labelAr: "خبير", labelEn: "Expert" },
];

export function SkillsEditor({ skills = [], onChange, disabled = false }: Props) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const handleAdd = () => {
    onChange([...skills, { skillName: "", proficiencyLevel: "Intermediate", isMandatory: false }]);
  };

  const handleRemove = (index: number) => {
    onChange(skills.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, updated: Partial<JobSkillItem>) => {
    onChange(skills.map((item, i) => (i === index ? { ...item, ...updated } : item)));
  };

  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {isAr ? "المهارات المطلوبة ومستويات الإتقان" : "Required Skills & Proficiency Levels"}
        </Typography>
        {!disabled && (
          <Button size="small" startIcon={<AddRoundedIcon />} onClick={handleAdd} variant="outlined">
            {isAr ? "إضافة مهارة" : "Add Skill"}
          </Button>
        )}
      </Box>

      {skills.length === 0 ? (
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {isAr ? "لم تتم إضافة مهارات بعد. اضغط 'إضافة مهارة' للبدء." : "No skills added yet. Click 'Add Skill' to begin."}
        </Typography>
      ) : (
        <Stack spacing={1}>
          {skills.map((skill, index) => (
            <Paper key={index} variant="outlined" sx={{ p: 1.5, display: "flex", gap: 1.5, alignItems: "center" }}>
              <TextField
                size="small"
                label={isAr ? "اسم المهارة" : "Skill Name"}
                value={skill.skillName}
                disabled={disabled}
                onChange={(e) => handleUpdate(index, { skillName: e.target.value })}
                sx={{ flex: 2 }}
              />
              <Select
                size="small"
                value={skill.proficiencyLevel || "Intermediate"}
                disabled={disabled}
                onChange={(e) => handleUpdate(index, { proficiencyLevel: String(e.target.value) })}
                sx={{ flex: 1.2 }}
              >
                {proficiencyLevels.map((lvl) => (
                  <MenuItem key={lvl.value} value={lvl.value}>
                    {isAr ? lvl.labelAr : lvl.labelEn}
                  </MenuItem>
                ))}
              </Select>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={skill.isMandatory}
                    disabled={disabled}
                    onChange={(e) => handleUpdate(index, { isMandatory: e.target.checked })}
                    size="small"
                  />
                }
                label={<Typography variant="caption">{isAr ? "إلزامية" : "Mandatory"}</Typography>}
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
