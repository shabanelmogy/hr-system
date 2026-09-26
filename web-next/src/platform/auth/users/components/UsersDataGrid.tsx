import {
  ArchiveOutlined,
  Edit,
  LockOpen,
  Person,
  PersonOff,
  RemoveCircle,
  Restore,
  Visibility
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Checkbox,
  Chip,
  FormControlLabel,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  GridActionsCellItem,
  type GridActionsCellItemProps,
  type GridApi,
  type GridColDef,
  type GridPaginationModel,
  type GridRenderCellParams,
  type GridRowParams,
  type GridSortModel,
} from "@mui/x-data-grid";
import { useCallback, useMemo, type ReactElement, type RefObject } from "react";
import { useTranslation } from "react-i18next";

import { MyDataGrid } from "@/shared/components/data-grid";
import type { Translator, User } from "../../types";
import {
  renderDisabledStatus,
  renderLockedStatus,
} from "./UserStatusCellRenderers";
import useUserStore from "../store/useUserStore";
import { useSession } from "@/lib/auth/SessionContext";
import { ResetButton } from "@/shared/components/lists/card-view/header-controls/ResetButton";

interface UsersDataGridProps {
  users: User[];
  loading: boolean;
  apiRef: RefObject<GridApi | null>;
  onEdit: (user: User) => void;
  onView: (user: User) => void;
  onAdd?: () => void;
  onToggle: (user: User) => void;
  onUnlock: (user: User) => void;
  onRevoke: (user: User) => void;
  onArchive: (user: User) => void;
  onRestore: (user: User) => void;
  t: Translator;
  lastAddedId?: string | number | null;
  lastEditedId?: string | number | null;
  canCreate: boolean;
  canEdit: boolean;
  canArchive: boolean;
  canRestore: boolean;
  canSetStatus: boolean;
  canUnlock: boolean;
  canRevoke: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  searchValue: string;
  sortColumn: "name" | "userName" | "email";
  sortDirection: "ASC" | "DESC";
  includeArchived: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSearchChange: (value: string) => void;
  onSortChange: (column: "name" | "userName" | "email", direction: "ASC" | "DESC") => void;
  onIncludeArchivedChange: (includeArchived: boolean) => void;
  onResetList: () => void;
}

const UsersDataGrid = ({
  users,
  loading,
  apiRef,
  onEdit,
  onView,
  onAdd,
  onToggle, // Single function for enable/disable
  onUnlock,
  onRevoke, // Revoke function
  onArchive,
  onRestore,
  t,
  lastAddedId,
  lastEditedId,
  canCreate,
  canEdit,
  canArchive,
  canRestore,
  canSetStatus,
  canUnlock,
  canRevoke,
  page,
  pageSize,
  totalCount,
  searchValue,
  sortColumn,
  sortDirection,
  includeArchived,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onSortChange,
  onIncludeArchivedChange,
  onResetList,
}: UsersDataGridProps) => {
  const { i18n } = useTranslation();
  const { user: currentUser } = useSession();
  const companyOptions = useUserStore((state) => state.companyOptions);
  const companyNames = useMemo(
    () => new Map(companyOptions.map((company) => [
      company.id,
      i18n.language.startsWith("ar") ? company.nameAr : company.nameEn,
    ])),
    [companyOptions, i18n.language],
  );
  // Custom renderers
  const renderUserName = useCallback(
    (params: GridRenderCellParams<User, string>) => (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Avatar src={params.row.profilePicture ?? undefined} sx={{ width: 32, height: 32 }}>
          {params.row.firstName?.charAt(0) || params.row.userName?.charAt(0)}
        </Avatar>
        <span>{params.value}</span>
      </div>
    ),
    []
  );

  const renderRoles = useCallback(
    (params: GridRenderCellParams<User, string[]>) => (
      <div
        style={{
          display: "flex",
          height: "100%",
          alignItems: "center",
          gap: 4,
          flexWrap: "wrap",
        }}
      >
        {params.value?.map((role) => (
          <Chip
            key={role}
            label={role}
            size="small"
            color={role === "admin" ? "error" : "primary"}
            variant="outlined"
          />
        ))}
      </div>
    ),
    []
  );

  const renderCompanies = useCallback(
    (params: GridRenderCellParams<User, number[]>) => {
      const companyIds = params.value ?? [];
      const defaultCompanyName = params.row.defaultCompanyId
        ? companyNames.get(params.row.defaultCompanyId)
        : null;
      const allCompanyNames = companyIds
        .map((companyId) => companyNames.get(companyId))
        .filter((name): name is string => Boolean(name));

      return (
        <Tooltip title={allCompanyNames.join(", ")} arrow disableHoverListener={allCompanyNames.length === 0}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75, width: "100%" }}>
            <Typography variant="body2" noWrap sx={{ maxWidth: 130 }}>
              {defaultCompanyName ?? t("users.noDefaultCompany")}
            </Typography>
            {companyIds.length > 1 ? (
              <Chip label={`+${companyIds.length - 1}`} size="small" variant="outlined" color="info" />
            ) : null}
          </Box>
        </Tooltip>
      );
    },
    [companyNames, t],
  );

  // Memoized action buttons
  const getActions = useCallback(
    (params: GridRowParams<User>): ReactElement<GridActionsCellItemProps>[] => {
      const { isDisabled, isLocked } = params.row;
      const isOwnUser = params.row.id === currentUser?.userId;
      const isArchived = params.row.lifecycleStatus === "archived";

      const actions = [
        // View button - always available
        <Tooltip title={t("actions.view")} key={`view-${params.row.id}`} arrow>
          <GridActionsCellItem
            icon={<Visibility sx={{ fontSize: 20, color: "info.main" }} />}
            label={t("actions.view")}
            onClick={() => onView(params.row)}
          />
        </Tooltip>,

      ];

      if (isArchived) {
        if (canRestore && !isOwnUser) {
          actions.push(
            <Tooltip title={t("actions.restore")} key={`restore-${params.row.id}`} arrow>
              <GridActionsCellItem
                icon={<Restore sx={{ fontSize: 20, color: "success.main" }} />}
                label={t("actions.restore")}
                onClick={() => onRestore(params.row)}
              />
            </Tooltip>,
          );
        }
        return actions;
      }

      if (canArchive && !isOwnUser) {
        actions.push(
          <Tooltip title={t("actions.archive")} key={`archive-${params.row.id}`} arrow>
            <GridActionsCellItem
              icon={<ArchiveOutlined sx={{ fontSize: 20, color: "error.main" }} />}
              label={t("actions.archive")}
              onClick={() => onArchive(params.row)}
            />
          </Tooltip>,
        );
      }

      if (!canEdit || isOwnUser) return actions;

      actions.push(
        <Tooltip title={t("actions.edit")} key={`edit-${params.row.id}`} arrow>
          <GridActionsCellItem
            icon={<Edit sx={{ fontSize: 20 }} />}
            label={t("actions.edit")}
            color="primary"
            onClick={() => onEdit(params.row)}
          />
        </Tooltip>,
      );

      // Enable/Disable toggle button - changes based on current status
      if (canSetStatus && isDisabled) {
        actions.push(
          <Tooltip
            title={t("actions.enable")}
            key={`enable-${params.row.id}`}
            arrow
          >
            <GridActionsCellItem
              icon={<Person sx={{ fontSize: 20, color: "success.main" }} />}
              label={t("actions.enable")}
              onClick={() => {
                onToggle(params.row);
              }}
            />
          </Tooltip>
        );
      } else if (canSetStatus) {
        actions.push(
          <Tooltip
            title={t("actions.disable")}
            key={`disable-${params.row.id}`}
            arrow
          >
            <GridActionsCellItem
              icon={<PersonOff sx={{ fontSize: 20, color: "warning.main" }} />}
              label={t("actions.disable")}
              onClick={() => {
                onToggle(params.row);
              }}
            />
          </Tooltip>
        );
      }

      // Unlock button - only show if user is locked AND not disabled
      if (canUnlock && isLocked && !isDisabled) {
        actions.push(
          <Tooltip
            title={t("actions.unlock")}
            key={`unlock-${params.row.id}`}
            arrow
          >
            <GridActionsCellItem
              icon={<LockOpen sx={{ fontSize: 20 }} />}
              label={t("actions.unlock")}
              onClick={() => {
                onUnlock(params.row);
              }}
            />
          </Tooltip>
        );
      }

      // Revoke button - always available (you can add conditions if needed)
      if (canRevoke) actions.push(
        <Tooltip
          title={t("users.revoked")}
          key={`revoke-${params.row.id}`}
          arrow
        >
          <GridActionsCellItem
            icon={<RemoveCircle sx={{ fontSize: 20 }} />}
            label={t("users.revoked")}
            onClick={() => {
              onRevoke(params.row);
            }}
          />
        </Tooltip>
      );

      return actions;
    },
    [
      canArchive,
      canRestore,
      canSetStatus,
      canUnlock,
      canRevoke,
      canEdit,
      currentUser?.userId,
      onArchive,
      onEdit,
      onRestore,
      onRevoke,
      onToggle,
      onUnlock,
      onView,
      t,
    ]
  );

  // Memoized columns with separate status renderers
  const columns = useMemo<GridColDef<User>[]>(
    () => [
      {
        field: "firstName",
        headerName: t("users.firstName"),
        flex: 1,
        align: "center",
        headerAlign: "center",
        renderCell: renderUserName,
      },
      {
        field: "lastName",
        headerName: t("users.lastName"),
        flex: 1,
        align: "center",
        headerAlign: "center",
      },
      {
        field: "userName",
        headerName: t("users.userName"),
        flex: 1.2,
        align: "center",
        headerAlign: "center",
      },
      {
        field: "email",
        headerName: t("users.email"),
        flex: 1.5,
        align: "center",
        headerAlign: "center",
      },
      {
        field: "lifecycleStatus",
        headerName: t("users.lifecycleStatus"),
        flex: 0.8,
        minWidth: 110,
        sortable: false,
        align: "center",
        headerAlign: "center",
        renderCell: ({ value }) => (
          <Chip
            size="small"
            color={value === "archived" ? "default" : "success"}
            variant="outlined"
            label={value === "archived" ? t("users.archivedStatus") : t("users.activeStatus")}
          />
        ),
      },
      {
        field: "roles",
        headerName: t("users.roles"),
        flex: 1.2,
        sortable: false,
        align: "center",
        headerAlign: "center",
        renderCell: renderRoles,
      },
      {
        field: "companyIds",
        headerName: t("users.companies"),
        flex: 1.2,
        minWidth: 170,
        sortable: false,
        align: "center",
        headerAlign: "center",
        renderCell: renderCompanies,
      },

      // OPTION 1: Separate columns for disabled and locked status
      {
        field: "isDisabled",
        headerName: t("users.disabledStatus"),
        flex: 0.8,
        sortable: false,
        align: "center",
        headerAlign: "center",
        renderCell: renderDisabledStatus(t),
      },
      {
        field: "isLocked",
        headerName: t("users.lockedStatus"),
        flex: 0.8,
        sortable: false,
        align: "center",
        headerAlign: "center",
        renderCell: renderLockedStatus(t),
      },
      {
        field: "actions",
        type: "actions",
        headerName: t("actions.buttons"),
        flex: 1.8, // Increased flex to accommodate the new revoke button
        align: "center",
        headerAlign: "center",
        getActions,
      },
    ],
    [
      t,
      getActions,
      renderUserName,
      renderRoles,
      renderCompanies,
    ]
  );

  const sortField = sortColumn === "name" ? "firstName" : sortColumn;
  const handlePaginationChange = useCallback((model: GridPaginationModel) => {
    if (model.pageSize !== pageSize) onPageSizeChange(model.pageSize);
    else onPageChange(model.page);
  }, [onPageChange, onPageSizeChange, pageSize]);
  const handleSortChange = useCallback((model: GridSortModel) => {
    const entry = model[0];
    if (!entry?.sort) return;
    const column = entry.field === "email"
      ? "email"
      : entry.field === "userName"
        ? "userName"
        : "name";
    onSortChange(column, entry.sort.toUpperCase() as "ASC" | "DESC");
  }, [onSortChange]);

  return (
    <MyDataGrid
      rows={users}
      columns={columns}
      loading={loading}
      apiRef={apiRef}
      filterMode="server"
      sortingMode="server"
      sortModel={[{ field: sortField, sort: sortDirection.toLowerCase() as "asc" | "desc" }]}
      onSortModelChange={handleSortChange}
      onToolbarAdd={canCreate ? onAdd : undefined}
      pagination
      paginationMode="server"
      paginationModel={{ page, pageSize }}
      onPaginationModelChange={handlePaginationChange}
      rowCount={totalCount}
      pageSizeOptions={[5, 10, 25, 50]}
      showToolbar
      showGridOptions
      toolbarSearch={{
        value: searchValue,
        placeholder: t("users.searchPlaceholder"),
        onChange: onSearchChange,
        onClear: () => onSearchChange(""),
      }}
      toolbarContent={(
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FormControlLabel
            control={(
              <Checkbox
                checked={includeArchived}
                onChange={(_, checked) => onIncludeArchivedChange(checked)}
              />
            )}
            label={t("users.includeArchived")}
          />
          <ResetButton onReset={onResetList} fullWidth={false} height={40} />
        </Box>
      )}
      lastAddedId={lastAddedId}
      lastEditedId={lastEditedId}
    />
  );
};

export default UsersDataGrid;
