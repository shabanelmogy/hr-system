"use client";

import { Box, Button, Divider, IconButton, Paper, Stack, TextField, Typography } from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { useTranslation } from "react-i18next";
import type { JobDutyItem, JobDutySection } from "../../types/OrganizationalStructure";

interface Props {
  sections: JobDutySection[];
  onChange: (sections: JobDutySection[]) => void;
  disabled?: boolean;
}

export function DutySectionsEditor({ sections = [], onChange, disabled = false }: Props) {
  const { t } = useTranslation();

  const handleAddSection = () => {
    onChange([
      ...sections,
      {
        sectionTitleAr: "",
        sectionTitleEn: "",
        weightPercentage: undefined,
        items: [{ textAr: "", textEn: "", order: 1 }],
      },
    ]);
  };

  const handleRemoveSection = (sectionIndex: number) => {
    onChange(sections.filter((_, i) => i !== sectionIndex));
  };

  const handleUpdateSection = (sectionIndex: number, updated: Partial<JobDutySection>) => {
    onChange(sections.map((sec, i) => (i === sectionIndex ? { ...sec, ...updated } : sec)));
  };

  const handleAddItem = (sectionIndex: number) => {
    const sec = sections[sectionIndex];
    const newItems: JobDutyItem[] = [
      ...sec.items,
      { textAr: "", textEn: "", order: sec.items.length + 1 },
    ];
    handleUpdateSection(sectionIndex, { items: newItems });
  };

  const handleRemoveItem = (sectionIndex: number, itemIndex: number) => {
    const sec = sections[sectionIndex];
    const newItems = sec.items.filter((_, i) => i !== itemIndex);
    handleUpdateSection(sectionIndex, { items: newItems });
  };

  const handleUpdateItem = (sectionIndex: number, itemIndex: number, updated: Partial<JobDutyItem>) => {
    const sec = sections[sectionIndex];
    const newItems = sec.items.map((it, i) => (i === itemIndex ? { ...it, ...updated } : it));
    handleUpdateSection(sectionIndex, { items: newItems });
  };

  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {t("organizationalStructure.dutyEditor.dutySectionsAndStructuredDuties")}
        </Typography>
        {!disabled && (
          <Button size="small" startIcon={<AddRoundedIcon />} onClick={handleAddSection} variant="outlined">
            {t("organizationalStructure.dutyEditor.addDutySection")}
          </Button>
        )}
      </Box>

      {sections.length === 0 ? (
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {t("organizationalStructure.dutyEditor.emptyDescription")}
        </Typography>
      ) : (
        <Stack spacing={2}>
          {sections.map((sec, sIdx) => (
            <Paper key={sIdx} variant="outlined" sx={{ p: 2, backgroundColor: "background.neutral" }}>
              <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", mb: 1.5 }}>
                <TextField
                  size="small"
                  label={t("organizationalStructure.dutyEditor.sectionTitleArabic")}
                  value={sec.sectionTitleAr}
                  disabled={disabled}
                  onChange={(e) => handleUpdateSection(sIdx, { sectionTitleAr: e.target.value })}
                  sx={{ flex: 2 }}
                />
                <TextField
                  size="small"
                  label={t("organizationalStructure.dutyEditor.sectionTitleEnglish")}
                  value={sec.sectionTitleEn}
                  disabled={disabled}
                  onChange={(e) => handleUpdateSection(sIdx, { sectionTitleEn: e.target.value })}
                  sx={{ flex: 2 }}
                />
                <TextField
                  size="small"
                  type="number"
                  label={t("organizationalStructure.dutyEditor.weight")}
                  value={sec.weightPercentage ?? ""}
                  disabled={disabled}
                  onChange={(e) => handleUpdateSection(sIdx, { weightPercentage: e.target.value ? Number(e.target.value) : undefined })}
                  sx={{ width: 100 }}
                />
                {!disabled && (
                  <IconButton color="error" size="small" onClick={() => handleRemoveSection(sIdx)}>
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>

              <Divider sx={{ my: 1 }} />

              <Typography variant="caption" sx={{ display: "block", mb: 1, fontWeight: 600, color: "text.secondary" }}>
                {t("organizationalStructure.dutyEditor.dutyItemsCount", { count: sec.items.length })}
              </Typography>

              <Stack spacing={1}>
                {sec.items.map((it, iIdx) => (
                  <Box key={iIdx} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <Typography variant="caption" sx={{ width: 20, textAlign: "center" }}>
                      {iIdx + 1}.
                    </Typography>
                    <TextField
                      size="small"
                      placeholder={t("organizationalStructure.dutyEditor.dutyTextInArabic")}
                      value={it.textAr}
                      disabled={disabled}
                      onChange={(e) => handleUpdateItem(sIdx, iIdx, { textAr: e.target.value })}
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      size="small"
                      placeholder={t("organizationalStructure.dutyEditor.dutyTextInEnglish")}
                      value={it.textEn}
                      disabled={disabled}
                      onChange={(e) => handleUpdateItem(sIdx, iIdx, { textEn: e.target.value })}
                      sx={{ flex: 1 }}
                    />
                    {!disabled && (
                      <IconButton size="small" color="default" onClick={() => handleRemoveItem(sIdx, iIdx)}>
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                ))}
                {!disabled && (
                  <Button
                    size="small"
                    startIcon={<AddRoundedIcon />}
                    onClick={() => handleAddItem(sIdx)}
                    sx={{ alignSelf: "flex-start", mt: 0.5 }}
                  >
                    {t("organizationalStructure.dutyEditor.addDutyItem")}
                  </Button>
                )}
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
}
