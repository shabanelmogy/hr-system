import React from "react";
import { Button, Typography } from "@mui/material";
import { Visibility } from "@mui/icons-material";
import { AppChip } from "@/shared/components/cards";
import { renderCode, renderDate } from "@/shared/components/data-grid";
import type { GridActionsCellItemProps, GridColDef } from "@mui/x-data-grid";
import type { OrganizationalResource, OrganizationalStructureItem } from "../../types/OrganizationalStructure";

interface ColumnsFactoryProps {
  t: (key: string) => string;
  resource: OrganizationalResource;
  language: "ar" | "en";
  getActions: (params: { row: OrganizationalStructureItem }) => React.ReactElement<GridActionsCellItemProps>[];
  onView?: (item: OrganizationalStructureItem) => void;
}

function getJobDescriptionStatus(item: OrganizationalStructureItem): "draft" | "approved" | "rejected" | "expired" | "" {
  if (typeof item.jobDescriptionStatus === "number") {
    return ({ 1: "draft", 2: "approved", 3: "rejected", 4: "expired" } as const)[item.jobDescriptionStatus] ?? "";
  }
  const value = item.jobDescriptionStatus?.toLowerCase();
  return value === "draft" || value === "approved" || value === "rejected" || value === "expired" ? value : "";
}

export const useOrganizationalStructureColumns = ({ t, resource, language, getActions, onView }: ColumnsFactoryProps): GridColDef<OrganizationalStructureItem>[] => {
  const isAr = language === "ar";
  const columns: GridColDef<OrganizationalStructureItem>[] = [
    { field: "id", headerName: t("general.id"), flex: 0.4, minWidth: 60, align: "center", headerAlign: "center", sortable: false },
    { field: "nameAr", headerName: t("general.nameAr"), flex: 1.1, minWidth: 140, align: "center", headerAlign: "center" },
    { field: "nameEn", headerName: t("general.nameEn"), flex: 1.1, minWidth: 140, align: "center", headerAlign: "center" },
    { field: "code", headerName: t("organizationalStructure.fields.code"), flex: 0.75, minWidth: 110, align: "center", headerAlign: "center", renderCell: renderCode },
  ];

  if (resource === "branches") {
    columns.push(
      {
        field: "isHeadquarters",
        headerName: t("organizationalStructure.fields.headquarters"),
        flex: 0.85,
        minWidth: 120,
        align: "center",
        headerAlign: "center",
        sortable: false,
        renderCell: ({ value }) => (
          <AppChip
            label={value ? t("organizationalStructure.yes") : t("organizationalStructure.no")}
            colorKey={value ? "success" : "secondary"}
            variant="outlined"
            size="small"
          />
        ),
      },
      {
        field: "timeZoneId",
        headerName: t("organizationalStructure.fields.timeZone"),
        flex: 0.9,
        minWidth: 130,
        align: "center",
        headerAlign: "center",
        sortable: false,
        renderCell: ({ value }) => value ? <AppChip label={String(value)} colorKey="secondary" variant="soft" size="small" /> : "-",
      },
      {
        field: "openedOn",
        headerName: t("organizationalStructure.fields.openedOn"),
        flex: 0.85,
        minWidth: 120,
        align: "center",
        headerAlign: "center",
        valueFormatter: renderDate,
      },
    );
  } else if (resource === "departments") {
    columns.push(
      {
        field: "isCentralized",
        headerName: t("organizationalStructure.fields.isCentralized"),
        flex: 0.9,
        minWidth: 130,
        align: "center",
        headerAlign: "center",
        sortable: false,
        renderCell: ({ row }) => (
          <AppChip
            label={row.isCentralized || !row.branchId ? (isAr ? "مركزية (عامة)" : "Centralized") : (isAr ? "فرعية" : "Branch-scoped")}
            colorKey={row.isCentralized || !row.branchId ? "secondary" : "info"}
            variant="soft"
            size="small"
          />
        ),
      },
      {
        field: "branchName",
        headerName: t("organizationalStructure.fields.branch"),
        flex: 1,
        minWidth: 140,
        align: "center",
        headerAlign: "center",
        sortable: true,
        renderCell: ({ row }) => {
          const branch = isAr ? row.branchNameAr : row.branchNameEn;
          return branch ? (
            <AppChip label={branch} colorKey="primary" variant="outlined" size="small" />
          ) : (
            <Typography variant="caption" color="text.secondary">
              {isAr ? "كافة الفروع" : "All branches"}
            </Typography>
          );
        },
      },
      {
        field: "parentDepartment",
        headerName: t("organizationalStructure.fields.parentDepartment"),
        flex: 1.1,
        minWidth: 150,
        align: "center",
        headerAlign: "center",
        sortable: true,
        renderCell: ({ row }) => {
          const parent = isAr ? row.parentNameAr : row.parentNameEn;
          return parent ? (
            <AppChip label={parent} colorKey="secondary" variant="outlined" size="small" />
          ) : (
            <Typography variant="caption" color="text.secondary">
              {isAr ? "إدارة رئيسية (مستوى 1)" : "Top-level"}
            </Typography>
          );
        },
      },
      {
        field: "costCenterCode",
        headerName: t("organizationalStructure.fields.costCenter"),
        flex: 0.85,
        minWidth: 110,
        align: "center",
        headerAlign: "center",
        renderCell: renderCode,
      },
    );
  } else if (resource === "divisions") {
    columns.push(
      {
        field: "departmentName",
        headerName: t("organizationalStructure.fields.department"),
        flex: 1.1,
        minWidth: 140,
        align: "center",
        headerAlign: "center",
        sortable: true,
        renderCell: ({ row }) => {
          const dept = isAr ? row.departmentNameAr : row.departmentNameEn;
          return dept ? <AppChip label={dept} colorKey="primary" variant="outlined" size="small" /> : "-";
        },
      },
      {
        field: "branchName",
        headerName: t("organizationalStructure.fields.branch"),
        flex: 1,
        minWidth: 130,
        align: "center",
        headerAlign: "center",
        renderCell: ({ row }) => {
          const branch = isAr ? row.branchNameAr : row.branchNameEn;
          return branch ? <AppChip label={branch} colorKey="secondary" variant="soft" size="small" /> : (
            <Typography variant="caption" color="text.secondary">
              {isAr ? "مركزي" : "Central"}
            </Typography>
          );
        },
      },
      {
        field: "costCenterCode",
        headerName: t("organizationalStructure.fields.costCenter"),
        flex: 0.85,
        minWidth: 110,
        align: "center",
        headerAlign: "center",
        renderCell: renderCode,
      },
    );
  } else if (resource === "job-levels") {
    columns.push(
      {
        field: "levelOrder",
        headerName: t("organizationalStructure.fields.levelOrder"),
        flex: 0.7,
        minWidth: 100,
        align: "center",
        headerAlign: "center",
        sortable: true,
        renderCell: ({ value }) => <AppChip label={String(value ?? "")} colorKey="secondary" variant="outlined" size="small" />,
      },
      {
        field: "salaryRange",
        headerName: t("organizationalStructure.fields.salaryRange"),
        flex: 1.1,
        minWidth: 150,
        align: "center",
        headerAlign: "center",
        sortable: false,
        renderCell: ({ row }) => (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {row.minSalary != null && row.maxSalary != null
              ? `${row.minSalary.toLocaleString()} - ${row.maxSalary.toLocaleString()} ${row.currencyCode ?? ""}`
              : "-"}
          </Typography>
        ),
      },
      {
        field: "isManagementLevel",
        headerName: t("organizationalStructure.fields.managementLevel"),
        flex: 0.85,
        minWidth: 110,
        align: "center",
        headerAlign: "center",
        sortable: false,
        renderCell: ({ value }) => (
          <AppChip
            label={value ? t("organizationalStructure.yes") : t("organizationalStructure.no")}
            colorKey={value ? "primary" : "secondary"}
            variant="soft"
            size="small"
          />
        ),
      },
      {
        field: "canManageOthers",
        headerName: t("organizationalStructure.fields.canManageOthers"),
        flex: 0.85,
        minWidth: 120,
        align: "center",
        headerAlign: "center",
        sortable: false,
        renderCell: ({ value }) => (
          <AppChip
            label={value ? t("organizationalStructure.yes") : t("organizationalStructure.no")}
            colorKey={value ? "info" : "secondary"}
            variant="soft"
            size="small"
          />
        ),
      },
    );
  } else if (resource === "positions") {
    columns.push(
      {
        field: "jobTitleName",
        headerName: t("organizationalStructure.fields.jobTitle"),
        flex: 1.1,
        minWidth: 140,
        align: "center",
        headerAlign: "center",
        sortable: true,
        renderCell: ({ row }) => {
          const title = isAr ? row.jobTitleNameAr : row.jobTitleNameEn;
          return title ? <Typography variant="body2" sx={{ fontWeight: 600 }}>{title}</Typography> : "-";
        },
      },
      {
        field: "jobLevelName",
        headerName: t("organizationalStructure.fields.jobLevel"),
        flex: 0.9,
        minWidth: 120,
        align: "center",
        headerAlign: "center",
        sortable: true,
        renderCell: ({ row }) => {
          const lvl = isAr ? row.jobLevelNameAr : row.jobLevelNameEn;
          return lvl ? <AppChip label={lvl} colorKey="secondary" variant="outlined" size="small" /> : "-";
        },
      },
      {
        field: "divisionName",
        headerName: t("organizationalStructure.fields.division"),
        flex: 1,
        minWidth: 130,
        align: "center",
        headerAlign: "center",
        renderCell: ({ row }) => {
          const div = isAr ? row.divisionNameAr : row.divisionNameEn;
          return div ? <AppChip label={div} colorKey="secondary" variant="soft" size="small" /> : "-";
        },
      },
      {
        field: "departmentName",
        headerName: t("organizationalStructure.fields.department"),
        flex: 1,
        minWidth: 130,
        align: "center",
        headerAlign: "center",
        renderCell: ({ row }) => {
          const dept = isAr ? row.departmentNameAr : row.departmentNameEn;
          return dept ? <AppChip label={dept} colorKey="primary" variant="outlined" size="small" /> : "-";
        },
      },
      {
        field: "targetHeadcount",
        headerName: t("organizationalStructure.fields.targetHeadcount"),
        flex: 0.85,
        minWidth: 110,
        align: "center",
        headerAlign: "center",
        sortable: false,
        renderCell: ({ value }) => <AppChip label={String(value ?? 0)} colorKey={Number(value) > 0 ? "success" : "secondary"} variant="outlined" size="small" />,
      },
    );
  } else if (resource === "job-descriptions") {
    columns.push(
      { field: "version", headerName: t("organizationalStructure.fields.version"), flex: 0.75, minWidth: 90, align: "center", headerAlign: "center", renderCell: renderCode },
      {
        field: "positionCode",
        headerName: t("organizationalStructure.fields.code"),
        flex: 0.85,
        minWidth: 110,
        align: "center",
        headerAlign: "center",
        renderCell: renderCode,
      },
      {
        field: "minExperienceYears",
        headerName: t("organizationalStructure.fields.experienceYears"),
        flex: 0.85,
        minWidth: 120,
        align: "center",
        headerAlign: "center",
        renderCell: ({ value }) => value != null ? (
          <AppChip label={`${value} ${isAr ? "سنوات" : "yrs"}`} colorKey="secondary" variant="soft" size="small" />
        ) : "-",
      },
      {
        field: "effectiveDate",
        headerName: t("organizationalStructure.fields.effectiveDate"),
        flex: 0.85,
        minWidth: 120,
        align: "center",
        headerAlign: "center",
        valueFormatter: renderDate,
      },
      {
        field: "jobDescriptionStatus",
        headerName: t("organizationalStructure.fields.approvalStatus"),
        flex: 0.95,
        minWidth: 120,
        align: "center",
        headerAlign: "center",
        sortable: false,
        renderCell: ({ row }) => {
          const status = getJobDescriptionStatus(row);
          return status ? <AppChip label={t(`organizationalStructure.jobDescriptionStatus.${status}`)} colorKey={status === "approved" ? "success" : status === "rejected" ? "error" : status === "expired" ? "warning" : "info"} variant="soft" size="small" /> : null;
        },
      },
    );

    if (onView) {
      columns.push({
        field: "viewProfileButton",
        headerName: t("organizationalStructure.jobDescriptionDetails.profileTitle"),
        flex: 1.1,
        minWidth: 150,
        align: "center",
        headerAlign: "center",
        sortable: false,
        renderCell: ({ row }) => (
          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<Visibility />}
            onClick={(e) => {
              e.stopPropagation();
              onView(row);
            }}
            sx={{
              fontWeight: 700,
              textTransform: "none",
              borderRadius: 1.5,
              px: 1.5,
              py: 0.5,
              boxShadow: 1,
            }}
          >
            {t("actions.view")}
          </Button>
        ),
      });
    }
  } else if (resource === "cost-centers") {
    columns.push({
      field: "parentCostCenter",
      headerName: t("organizationalStructure.fields.parentCostCenter"),
      flex: 1,
      minWidth: 140,
      align: "center",
      headerAlign: "center",
      renderCell: ({ row }) => {
        const parent = isAr ? row.parentNameAr : row.parentNameEn;
        return parent ? <AppChip label={parent} colorKey="primary" variant="outlined" size="small" /> : "-";
      },
    });
  } else if (resource === "currencies") {
    columns.push(
      {
        field: "symbol",
        headerName: t("organizationalStructure.fields.symbol"),
        flex: 0.6,
        minWidth: 80,
        align: "center",
        headerAlign: "center",
        sortable: false,
        renderCell: ({ value }) => <Typography variant="body2" sx={{ fontWeight: 700 }}>{value ?? "-"}</Typography>,
      },
      {
        field: "exchangeRateToDefault",
        headerName: t("organizationalStructure.fields.exchangeRate"),
        flex: 0.9,
        minWidth: 120,
        align: "center",
        headerAlign: "center",
        sortable: false,
        renderCell: ({ value }) => <AppChip label={String(value ?? 1)} colorKey="secondary" variant="outlined" size="small" />,
      },
      {
        field: "isDefault",
        headerName: t("organizationalStructure.fields.defaultCurrency"),
        flex: 0.8,
        minWidth: 100,
        align: "center",
        headerAlign: "center",
        sortable: false,
        renderCell: ({ value }) => (
          <AppChip
            label={value ? t("organizationalStructure.yes") : t("organizationalStructure.no")}
            colorKey={value ? "success" : "secondary"}
            variant={value ? "filled" : "outlined"}
            size="small"
          />
        ),
      },
    );
  }

  columns.push(
    { field: "createdOn", headerName: t("general.createdOn"), flex: 0.9, minWidth: 120, align: "center", headerAlign: "center", valueFormatter: renderDate },
    { field: "updatedOn", headerName: t("general.updatedOn"), flex: 0.9, minWidth: 120, align: "center", headerAlign: "center", sortable: false, valueFormatter: renderDate },
    {
      field: "isDeleted",
      headerName: t("organizationalStructure.fields.status"),
      flex: 0.8,
      minWidth: 100,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: ({ value }) => <AppChip label={value ? t("organizationalStructure.status.archived") : t("organizationalStructure.status.active")} colorKey={value ? "error" : "success"} variant="soft" size="small" />,
    },
    {
      field: "actions",
      type: "actions",
      headerName: t("actions.buttons"),
      flex: resource === "job-descriptions" ? 1.4 : 0.9,
      minWidth: resource === "job-descriptions" ? 220 : 130,
      align: "center",
      headerAlign: "center",
      sortable: false,
      getActions,
    },
  );
  return columns;
};
