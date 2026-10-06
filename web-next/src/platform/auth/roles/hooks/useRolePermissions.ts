import useNotifications from "@/shared/hooks/useNotifications";
import { applyApiFieldErrors } from "@/shared/utils/formErrors";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useUnsavedChanges } from "@/shared/contexts/UnsavedChangesContext";
import useRoleStore from "../store/useRoleStore";
import type { RoleWithClaims } from "../../types";
import {
  getRoleClaimsValidationSchema,
  type RoleClaimsFormData,
} from "../utils/validation";
import { permissions } from "@/lib/auth/permissions";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { appRoutes } from "@/config/routes";
import { getPermissionActionLabel, getPermissionResourceLabel } from "../utils/permissionLabels";
import {
  countChangedClaims,
  sortPermissionActions,
  splitPermission,
  summarizePermissionBusinessModules,
} from "../utils/permissionPresentation";

export function useRolePermissions(roleId: string) {
  const { i18n, t } = useTranslation();
  const router = useRouter();
  const { requestDiscard } = useUnsavedChanges();
  const { hasPermission, isReadOnly } = usePermissions();
  const { showError, showSuccess, SnackbarComponent } = useNotifications();
  const { getRoleWithClaims, updateRoleClaims } = useRoleStore();
  const [role, setRole] = useState<RoleWithClaims | null>(null);
  const [requestedBusinessModule, setRequestedBusinessModule] = useState("");
  const [selectedScreen, setSelectedScreen] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [baselineClaims, setBaselineClaims] = useState<RoleClaimsFormData["roleClaims"]>([]);
  const canEdit = !isReadOnly && hasPermission(permissions.EditRolePermissions);

  const form = useForm<RoleClaimsFormData>({
    resolver: zodResolver(getRoleClaimsValidationSchema()),
    defaultValues: { id: roleId, name: "", roleClaims: [] },
    mode: "onChange",
  });

  useEffect(() => {
    if (!roleId) return;

    let active = true;
    void getRoleWithClaims(roleId)
      .then((result) => {
        if (!active) return;
        if (!result) {
          setRole(null);
          return;
        }

        const nextRole: RoleWithClaims = {
          ...result,
          id: result.id || roleId,
          name: result.name || "",
          roleClaims: result.roleClaims || [],
        };
        setRole(nextRole);
        setBaselineClaims(nextRole.roleClaims.map((claim) => ({ ...claim })));
        form.reset({ id: nextRole.id, name: nextRole.name, roleClaims: nextRole.roleClaims });
      })
      .catch((error) => {
        if (!active) return;
        showError((error as Error)?.message || t("roles.permissionsLoadFailed"));
        setRole(null);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [form, getRoleWithClaims, roleId, showError, t]);

  const replaceClaims = (roleClaims: RoleClaimsFormData["roleClaims"]) => {
    if (!role || role.isSystem || !canEdit) return;
    setRole({ ...role, roleClaims });
    form.setValue("roleClaims", roleClaims, { shouldDirty: true, shouldValidate: true });
  };

  const selectScreen = (screen: string, isSelected: boolean) => {
    if (!role || role.isSystem || !canEdit) return;
    replaceClaims(
      role.roleClaims.map((claim) => {
        const parsed = splitPermission(claim.displayValue);
        return claim.moduleCode.toLowerCase() === selectedBusinessModule.toLowerCase() &&
          parsed?.resource.toLowerCase() === screen.toLowerCase()
          ? { ...claim, isSelected }
          : claim;
      }),
    );
  };

  const toggleClaim = (claimIndex: number) => {
    if (!role || role.isSystem || !canEdit || claimIndex < 0) return;
    replaceClaims(
      role.roleClaims.map((claim, index) =>
        index === claimIndex ? { ...claim, isSelected: !claim.isSelected } : claim,
      ),
    );
  };

  const businessModules = useMemo(
    () => summarizePermissionBusinessModules(role?.roleClaims ?? []),
    [role],
  );

  const selectedBusinessModule = businessModules.find(
    (module) => module.code.toLowerCase() === requestedBusinessModule.toLowerCase(),
  )?.code ?? businessModules[0]?.code ?? "";

  const availableScreens = useMemo(() => Array.from(new Set(
    (role?.roleClaims ?? [])
      .filter((claim) => claim.moduleCode.toLowerCase() === selectedBusinessModule.toLowerCase())
      .map((claim) => splitPermission(claim.displayValue)?.resource)
      .filter((screen): screen is string => Boolean(screen)),
  )).sort((left, right) => left.localeCompare(right)), [role, selectedBusinessModule]);

  const permissionActions = useMemo(() => sortPermissionActions(Array.from(new Set(
    (role?.roleClaims ?? [])
      .map((claim) => splitPermission(claim.displayValue)?.action)
      .filter((action): action is string => Boolean(action)),
  ))), [role]);

  const filteredScreens = useMemo(() => {
    let screens = availableScreens.filter(
      (screen) => !selectedScreen || screen.toLowerCase() === selectedScreen.toLowerCase(),
    );

    if (searchTerm.trim()) {
      const query = searchTerm.trim().toLocaleLowerCase(i18n.language);
      screens = screens.filter((screen) => {
        const searchableValues = [
          screen,
          getPermissionResourceLabel(screen, t),
          ...(role?.roleClaims ?? [])
            .map((claim) => splitPermission(claim.displayValue))
            .filter((claim) => claim?.resource.toLowerCase() === screen.toLowerCase())
            .flatMap((claim) => claim
              ? [claim.action, getPermissionActionLabel(claim.action, t)]
              : []),
        ];
        return searchableValues.some((value) =>
          value.toLocaleLowerCase(i18n.language).includes(query),
        );
      });
    }

    if (showOnlySelected && role) {
      screens = screens.filter((screen) =>
        role.roleClaims.some((claim) => {
          const parsed = splitPermission(claim.displayValue);
          return claim.moduleCode.toLowerCase() === selectedBusinessModule.toLowerCase() &&
            claim.isSelected && parsed?.resource.toLowerCase() === screen.toLowerCase();
        }),
      );
    }

    return screens;
  }, [
    availableScreens,
    i18n.language,
    role,
    searchTerm,
    selectedBusinessModule,
    selectedScreen,
    showOnlySelected,
    t,
  ]);

  const paginatedScreens = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredScreens.slice(start, start + rowsPerPage);
  }, [filteredScreens, page, rowsPerPage]);

  const selectFiltered = (isSelected: boolean) => {
    if (!role || role.isSystem || !canEdit) return;
    const filteredScreenNames = new Set(filteredScreens.map((screen) => screen.toLowerCase()));
    replaceClaims(
      role.roleClaims.map((claim) => {
        const parsed = splitPermission(claim.displayValue);
        return claim.moduleCode.toLowerCase() === selectedBusinessModule.toLowerCase() &&
          parsed && filteredScreenNames.has(parsed.resource.toLowerCase())
          ? { ...claim, isSelected }
          : claim;
      }),
    );
  };

  const statistics = useMemo(() => {
    const total = role?.roleClaims.length ?? 0;
    const selected = role?.roleClaims.filter((claim) => claim.isSelected).length ?? 0;
    const changed = countChangedClaims(role?.roleClaims ?? [], baselineClaims);
    return { total, selected, changed, percentage: total > 0 ? (selected / total) * 100 : 0 };
  }, [baselineClaims, role]);

  const updateRole = async (data: RoleClaimsFormData) => {
    if (!role || role.isSystem || !canEdit) return;
    setIsSaving(true);
    try {
      await updateRoleClaims(data);
      setBaselineClaims(data.roleClaims.map((claim) => ({ ...claim })));
      showSuccess(t("roles.permissionsUpdatedSuccessfully"));
      form.reset(data);
      router.push(appRoutes.platform.administration.roles);
    } catch (error) {
      applyApiFieldErrors(error, form.setError, { Name: "name" });
      showError(
        (error as Error)?.message || t("roles.permissionsSaveFailed"),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const goBack = async () => {
    if (!(await requestDiscard())) return;
    router.push(appRoutes.platform.administration.roles);
  };

  return {
    ...form,
    availableScreens,
    businessModules,
    canEdit,
    filteredScreens,
    goBack,
    goDashboard: async () => {
      if (!(await requestDiscard())) return;
      router.push(appRoutes.shell.home);
    },
    isLoading,
    isSaving,
    notifications: { SnackbarComponent },
    page,
    paginatedScreens,
    permissionActions,
    role,
    rowsPerPage,
    searchTerm,
    selectFiltered,
    selectScreen,
    selectedBusinessModule,
    selectedScreen,
    setPage,
    setRowsPerPage,
    setSearchTerm: (value: string) => {
      setSearchTerm(value);
      setPage(0);
    },
    setSelectedBusinessModule: (value: string) => {
      setRequestedBusinessModule(value);
      setSelectedScreen("");
      setSearchTerm("");
      setPage(0);
    },
    setSelectedScreen: (value: string) => {
      setSelectedScreen(value);
      setPage(0);
    },
    setShowOnlySelected: (value: boolean) => {
      setShowOnlySelected(value);
      setPage(0);
    },
    resetFilters: () => {
      setSearchTerm("");
      setSelectedScreen("");
      setShowOnlySelected(false);
      setPage(0);
    },
    showOnlySelected,
    statistics,
    submit: form.handleSubmit(updateRole),
    toggleClaim,
  };
}
