"use client";

import { Box, Button, Chip, Grid, LinearProgress, Stack, Typography } from "@mui/material";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { BarChart, COLOR_PALETTES } from "@/shared/components/charts";
import { EntityCard } from "@/shared/components/cards";
import { EmptyState } from "@/shared/components/feedback/states";
import { CardViewPagination } from "@/shared/components/lists/card-view";
import { PageHeader } from "@/shared/components/navigation/header";
import OrganizationalStructureCardViewHeader from "./card-view/OrganizationalStructureCardViewHeader";
import OrganizationalStructureDataGrid from "./grid-view/OrganizationalStructureDataGrid";
import OrganizationalStructureReport from "./report-view/OrganizationalStructureReport";
import OrganizationalStructureImport from "./import-view/OrganizationalStructureImport";
import {
  type OrganizationalResource,
  type OrganizationalSearchField,
  type OrganizationalSearchOperator,
  type OrganizationalStatus,
  type OrganizationalStructureItem,
  type OrganizationalView,
} from "../types/OrganizationalStructure";

interface PermissionSet { canCreate: boolean; canEdit: boolean; canDelete: boolean; canApprove: boolean }
interface Props {
  resource: OrganizationalResource;
  items: OrganizationalStructureItem[];
  loading: boolean;
  isFetching: boolean;
  totalCount: number;
  page: number;
  pageSize: number;
  search: string;
  status: OrganizationalStatus;
  sortBy: "nameEn" | "nameAr" | "code" | "parent" | "createdOn";
  sortDirection: "asc" | "desc";
  permissions: PermissionSet;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSearchChange: (search: string) => void;
  searchField: OrganizationalSearchField;
  searchOperator: OrganizationalSearchOperator;
  onSearchFieldChange: (field: OrganizationalSearchField) => void;
  onSearchOperatorChange: (operator: OrganizationalSearchOperator) => void;
  onStatusChange: (status: OrganizationalStatus) => void;
  onSortChange: (sortBy: Props["sortBy"], direction: Props["sortDirection"]) => void;
  onAdd: () => void;
  onView: (item: OrganizationalStructureItem) => void;
  onEdit: (item: OrganizationalStructureItem) => void;
  onLifecycle: (item: OrganizationalStructureItem) => void;
  onApprove: (item: OrganizationalStructureItem) => void;
  onReject: (item: OrganizationalStructureItem) => void;
  onRefresh: () => void;
  onReset: () => void;
}

export default function OrganizationalStructureMultiView(props: Props) {
  const { t, i18n } = useTranslation();
  const [view, setView] = useState<OrganizationalView>("grid");
  const [isFilterBarVisible, setIsFilterBarVisible] = useState(true);
  const visibleView = view === "import" && !props.permissions.canCreate ? "grid" : view;
  const supportsFilterBar = visibleView !== "import";
  const language = i18n.resolvedLanguage?.startsWith("ar") ? "ar" : "en";
  const name = useCallback((item: OrganizationalStructureItem) => language === "ar" ? item.nameAr : item.nameEn, [language]);
  const parentName = useCallback((item: OrganizationalStructureItem) => {
    const values = language === "ar"
      ? [item.positionCode, item.divisionNameAr, item.departmentNameAr, item.branchNameAr]
      : [item.positionCode, item.divisionNameEn, item.departmentNameEn, item.branchNameEn];
    return values.find(Boolean) ?? t("organizationalStructure.currentCompany");
  }, [language, t]);
  const jobDescriptionStatus = useCallback((item: OrganizationalStructureItem) => {
    const status = typeof item.jobDescriptionStatus === "number"
      ? ({ 1: "draft", 2: "approved", 3: "rejected", 4: "expired" } as const)[item.jobDescriptionStatus]
      : item.jobDescriptionStatus?.toLowerCase();
    return status ? t(`organizationalStructure.jobDescriptionStatus.${status}`) : null;
  }, [t]);
  const canDecide = useCallback((item: OrganizationalStructureItem) => props.resource === "job-descriptions" && props.permissions.canApprove && !item.isDeleted && (item.jobDescriptionStatus === 1 || String(item.jobDescriptionStatus).toLowerCase() === "draft"), [props.permissions.canApprove, props.resource]);

  const handleViewChange = (value: string) => {
    if (value === "grid" || value === "cards" || value === "chart" || value === "report" || value === "import") {
      if (value !== "import" || props.permissions.canCreate) {
        if (value === "chart" && props.page !== 0) props.onPageChange(0);
        setView(value);
      }
    }
  };
  const chartData = props.items.map((item) => ({
    name: name(item),
    value: props.resource === "positions" ? item.targetHeadcount ?? 0 : 1,
  }));

  return (
    <Box sx={{ display: "flex", flex: 1, flexDirection: "column", height: "100%", minHeight: 0, minWidth: 0, overflow: "hidden", width: "100%" }}>
      <PageHeader
        variant="multi-view" title={t(`organizationalStructure.resources.${props.resource}`)}
        storageKey={`organizational-structure-${props.resource}-view`} defaultView="grid"
        availableViews={["grid", "cards", "chart", "report", ...(props.permissions.canCreate ? ["import" as const] : [])]}
        viewLabels={{ grid: t("views.grid"), cards: t("views.cards"), chart: t("views.chart"), report: t("views.report"), import: t("views.import") }}
        dataCount={props.totalCount} totalLabel={t(`organizationalStructure.resources.${props.resource}`)}
        onAdd={props.permissions.canCreate ? props.onAdd : undefined} onRefresh={props.onRefresh}
        onViewTypeChange={handleViewChange}
        onFilter={supportsFilterBar ? () => setIsFilterBarVisible((visible) => !visible) : undefined}
        isFilterBarVisible={isFilterBarVisible}
        showActions={{ add: props.permissions.canCreate, refresh: true, export: false, filter: supportsFilterBar }}
      />

      {isFilterBarVisible && (visibleView === "cards" || visibleView === "chart") ? <OrganizationalStructureCardViewHeader
        resource={props.resource} search={props.search} searchField={props.searchField} searchOperator={props.searchOperator}
        sortBy={props.sortBy} sortDirection={props.sortDirection} status={props.status} totalCount={props.totalCount} page={props.page}
        onSearchChange={props.onSearchChange} onSearchFieldChange={props.onSearchFieldChange} onSearchOperatorChange={props.onSearchOperatorChange}
        onSortChange={props.onSortChange} onStatusChange={props.onStatusChange} onReset={props.onReset}
      /> : null}

      <Box sx={{
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        overflowX: visibleView === "cards" || visibleView === "chart" || visibleView === "report" || visibleView === "import" ? "hidden" : "auto",
        overflowY: visibleView === "cards" || visibleView === "chart" || visibleView === "report" || visibleView === "import" ? "hidden" : "auto",
        position: "relative",
        width: "100%",
      }}>
        {props.isFetching && !props.loading ? <LinearProgress sx={{ position: "absolute", top: 0, insetInline: 0, zIndex: 3 }} /> : null}
        {visibleView === "grid" && <OrganizationalStructureDataGrid
          resource={props.resource} items={props.items} loading={props.loading} totalCount={props.totalCount}
          page={props.page} pageSize={props.pageSize} search={props.search} status={props.status}
          sortBy={props.sortBy} sortDirection={props.sortDirection} searchField={props.searchField} searchOperator={props.searchOperator}
          permissions={props.permissions} language={language} showFilterBar={isFilterBarVisible}
          onPageChange={props.onPageChange} onPageSizeChange={props.onPageSizeChange} onSearchChange={props.onSearchChange}
          onSearchFieldChange={props.onSearchFieldChange} onSearchOperatorChange={props.onSearchOperatorChange} onStatusChange={props.onStatusChange}
          onSortChange={props.onSortChange} onReset={props.onReset} onView={props.onView} onEdit={props.onEdit} onLifecycle={props.onLifecycle}
          onApprove={props.onApprove} onReject={props.onReject}
        />}

        {visibleView === "cards" && <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, minWidth: 0, width: "100%" }}>
          <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, overflowX: "hidden", overflowY: "auto", p: { xs: 1, md: 1.5 }, scrollbarGutter: "stable" }}>
            {props.items.length === 0 && !props.loading ? <EmptyState title={t("organizationalStructure.empty")}
              actionText={props.permissions.canCreate ? t("actions.add") : undefined} onAction={props.onAdd} /> : null}
            <Grid container spacing={3}>{props.items.map((item, index) => <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }} sx={{ minWidth: 0 }}>
              <EntityCard index={index} height={280} title={name(item)} subtitle={item.code}
                endBadge={<Chip size="small" color={item.isDeleted ? "default" : "success"} label={t(item.isDeleted ? "organizationalStructure.status.archived" : "organizationalStructure.status.active")} />}
                content={<Stack spacing={1} sx={{ minWidth: 0 }}><Typography variant="body2" color="text.secondary">{t("organizationalStructure.fields.parent")}</Typography><Typography>{parentName(item)}</Typography>
                  {item.targetHeadcount != null ? <Typography>{t("organizationalStructure.fields.targetHeadcount")}: {item.targetHeadcount}</Typography> : null}
                  {jobDescriptionStatus(item) ? <Chip size="small" label={jobDescriptionStatus(item)} /> : null}</Stack>}
                footer={<Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: "wrap", justifyContent: "flex-end", rowGap: 0.5 }}><Button size="small" onClick={() => props.onView(item)}>{t("actions.view")}</Button>
                  {props.permissions.canEdit && !item.isDeleted ? <Button size="small" onClick={() => props.onEdit(item)}>{t("actions.edit")}</Button> : null}
                  {props.permissions.canDelete ? <Button size="small" color={item.isDeleted ? "success" : "warning"} onClick={() => props.onLifecycle(item)}>{t(item.isDeleted ? "actions.restore" : "actions.archive")}</Button> : null}
                  {canDecide(item) ? <><Button size="small" color="success" onClick={() => props.onApprove(item)}>{t("organizationalStructure.decision.approve")}</Button><Button size="small" color="error" onClick={() => props.onReject(item)}>{t("organizationalStructure.decision.reject")}</Button></> : null}
                </Stack>} />
            </Grid>)}</Grid>
          </Box>
          <CardViewPagination page={props.page} rowsPerPage={props.pageSize} totalItems={props.totalCount}
            itemsPerPageOptions={[5, 10, 25, 50]} pinned onPageChange={props.onPageChange} onRowsPerPageChange={props.onPageSizeChange} />
        </Box>}

        {visibleView === "chart" && <Box sx={{ boxSizing: "border-box", display: "flex", flexDirection: "column", height: "100%", minHeight: 0, minWidth: 0, overflow: "hidden", p: { xs: 0.5, md: 1 }, width: "100%" }}>
          <BarChart data={chartData} title={t("organizationalStructure.chart.title")}
            subtitle={t("organizationalStructure.chart.pageScope")} xKey="name" yKey="value" fullHeight compact
            colors={COLOR_PALETTES.primary} loading={props.loading} formatValue={(value) => String(value)} height={280} />
        </Box>}
        {visibleView === "report" && <Box sx={{ height: "100%", minHeight: 0, minWidth: 0, overflowX: "hidden", overflowY: "auto", p: { xs: 0.5, md: 1 }, width: "100%" }}><OrganizationalStructureReport resource={props.resource} showFilterBar={isFilterBarVisible} /></Box>}
        {visibleView === "import" && props.permissions.canCreate && <Box sx={{ height: "100%", minHeight: 0, minWidth: 0, overflowX: "hidden", overflowY: "auto", width: "100%" }}><OrganizationalStructureImport resource={props.resource} /></Box>}
      </Box>
    </Box>
  );
}
