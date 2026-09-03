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
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

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
          {isAr ? "مجالات العمل والواجبات المهيكلة (Duty Sections & Items)" : "Duty Sections & Structured Duties"}
        </Typography>
        {!disabled && (
          <Button size="small" startIcon={<AddRoundedIcon />} onClick={handleAddSection} variant="outlined">
            {isAr ? "إضافة قسم واجبات" : "Add Duty Section"}
          </Button>
        )}
      </Box>

      {sections.length === 0 ? (
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {isAr
            ? "لم يتم إضافة أقسام مهام بعد. يمكنك تقسيم الوصف إلى مجالات (مثل: المهام الإدارية، المسؤوليات الفنية) مع أوزانها النسبية."
            : "No duty sections added yet. You can categorize duties (e.g. Administrative, Technical) with weight percentages."}
        </Typography>
      ) : (
        <Stack spacing={2}>
          {sections.map((sec, sIdx) => (
            <Paper key={sIdx} variant="outlined" sx={{ p: 2, backgroundColor: "background.neutral" }}>
              <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", mb: 1.5 }}>
                <TextField
                  size="small"
                  label={isAr ? "عنوان المجال بالعربية" : "Section Title (Ar)"}
                  value={sec.sectionTitleAr}
                  disabled={disabled}
                  onChange={(e) => handleUpdateSection(sIdx, { sectionTitleAr: e.target.value })}
                  sx={{ flex: 2 }}
                />
                <TextField
                  size="small"
                  label={isAr ? "عنوان المجال بالإنجليزية" : "Section Title (En)"}
                  value={sec.sectionTitleEn}
                  disabled={disabled}
                  onChange={(e) => handleUpdateSection(sIdx, { sectionTitleEn: e.target.value })}
                  sx={{ flex: 2 }}
                />
                <TextField
                  size="small"
                  type="number"
                  label={isAr ? "الوزن %" : "Weight %"}
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
                {isAr ? `بنود الواجبات والمسؤوليات (${sec.items.length})` : `Duty Items (${sec.items.length})`}
              </Typography>

              <Stack spacing={1}>
                {sec.items.map((it, iIdx) => (
                  <Box key={iIdx} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <Typography variant="caption" sx={{ width: 20, textAlign: "center" }}>
                      {iIdx + 1}.
                    </Typography>
                    <TextField
                      size="small"
                      placeholder={isAr ? "البند بالعربية..." : "Duty text in Arabic..."}
                      value={it.textAr}
                      disabled={disabled}
                      onChange={(e) => handleUpdateItem(sIdx, iIdx, { textAr: e.target.value })}
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      size="small"
                      placeholder={isAr ? "البند بالإنجليزية..." : "Duty text in English..."}
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
                    {isAr ? "إضافة بند مسؤولية" : "Add Duty Item"}
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
