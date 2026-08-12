import {
  Edit,
  LockOpen,
  Person,
  PersonOff,
  RemoveCircle,
  Visibility
} from "@mui/icons-material";
import { Avatar, Box, Chip, Tooltip, Typography } from "@mui/material";
import {
  GridActionsCellItem,
  type GridActionsCellItemProps,
  type GridApi,
  type GridColDef,
  type GridRenderCellParams,
  type GridRowParams,
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

interface UsersDataGridProps {
  users: User[];
  loading: boolean;
  apiRef: RefObject<GridApi | null>;
  onEdit: (user: User) => void;
  onView: (user: User) => void;
  onAdd: () => void;
  onToggle: (user: User) => void;
  onUnlock: (user: User) => void;
  onRevoke: (user: User) => void;
  t: Translator;
  lastAddedId?: string | number | null;
  lastEditedId?: string | number | null;
  canCreate: boolean;
  canEdit: boolean;
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
  t,
  lastAddedId,
  lastEditedId,
  canCreate,
  canEdit,
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

      if (!canEdit || params.row.id === currentUser?.userId) return actions;

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
      if (isDisabled) {
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
      } else {
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
      if (isLocked && !isDisabled) {
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
      actions.push(
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
    [canEdit, currentUser?.userId, t, onEdit, onView, onToggle, onUnlock, onRevoke]
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
        field: "roles",
        headerName: t("users.roles"),
        flex: 1.2,
        align: "center",
        headerAlign: "center",
        renderCell: renderRoles,
      },
      {
        field: "companyIds",
        headerName: t("users.companies"),
        flex: 1.2,
        minWidth: 170,
        align: "center",
        headerAlign: "center",
        renderCell: renderCompanies,
      },

      // OPTION 1: Separate columns for disabled and locked status
      {
        field: "isDisabled",
        headerName: t("users.disabledStatus"),
        flex: 0.8,
        align: "center",
        headerAlign: "center",
        renderCell: renderDisabledStatus(t),
      },
      {
        field: "isLocked",
        headerName: t("users.lockedStatus"),
        flex: 0.8,
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

  return (
    <MyDataGrid
      rows={users}
      columns={columns}
      loading={loading}
      apiRef={apiRef}
      filterMode="client"
      initialSortModel={[{ field: "id", sort: "asc" }]}
      onToolbarAdd={canCreate ? onAdd : undefined}
      pagination
      pageSizeOptions={[5, 10, 25]}
      lastAddedId={lastAddedId}
      lastEditedId={lastEditedId}
    />
  );
};

export default UsersDataGrid;
