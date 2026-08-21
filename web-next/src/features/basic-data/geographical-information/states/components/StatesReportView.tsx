import { ContentWrapper } from "@/shared/components/layout";
import { Box, Chip, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { StateListItem } from "../types/State";

interface StatesReportViewProps { states: StateListItem[]; totalCount: number; }

export default function StatesReportView({ states, totalCount }: StatesReportViewProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.resolvedLanguage?.toLowerCase().startsWith("ar");
  return (
    <ContentWrapper>
      <Box sx={{ p: { xs: 1.5, md: 2 }, overflowX: "auto" }} role="region" aria-label={t("states.reportAriaLabel")}>
        <Typography variant="h6">{t("states.report.title")}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{t("states.report.scope", { count: states.length, total: totalCount })}</Typography>
        <Table size="small" aria-label={t("states.reportAriaLabel")}>
          <TableHead><TableRow><TableCell>{t("states.name")}</TableCell><TableCell>{t("states.code")}</TableCell><TableCell>{t("states.country")}</TableCell><TableCell align="center">{t("states.districts")}</TableCell><TableCell>{t("states.status.label")}</TableCell></TableRow></TableHead>
          <TableBody>{states.map((state) => <TableRow key={state.id}><TableCell>{isArabic ? state.nameAr : state.nameEn}</TableCell><TableCell>{state.code}</TableCell><TableCell>{isArabic ? state.country.nameAr : state.country.nameEn}</TableCell><TableCell align="center">{state.districtsCount}</TableCell><TableCell><Chip size="small" label={state.isDeleted ? t("states.status.archived") : t("states.status.active")} color={state.isDeleted ? "error" : "success"} /></TableCell></TableRow>)}</TableBody>
        </Table>
      </Box>
    </ContentWrapper>
  );
}
