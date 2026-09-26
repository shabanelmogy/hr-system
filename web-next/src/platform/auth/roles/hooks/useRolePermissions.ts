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
import { countChangedClaims, sortPermissionActions } from "../utils/permissionPresentation";

function splitPermission(value: string): { module: string; action: string } | null {
  const separator = value.indexOf(":");
  if (separator <= 0 || separator === value.length - 1) return null;
  return { module: value.slice(0, separator), action: value.slice(separator + 1) };
}

export function useRolePermissions(roleId: string) {
  const { i18n, t } = useTranslation();
  const router = useRouter();
  const { requestDiscard } = useUnsavedChanges();
  const { hasPermission, isReadOnly } = usePermissions();
  const { showError, showSuccess, SnackbarComponent } = useNotifications();
  const { getRoleWithClaims, updateRoleClaims } = useRoleStore();
  const [role, setRole] = useState<RoleWithClaims | null>(null);
  const [selectedModule, setSelectedModule] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
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

  const selectModule = (module: string, isSelected: boolean) => {
    if (!role || role.isSystem || !canEdit) return;
    replaceClaims(
      role.roleClaims.map((claim) => {
        const parsed = splitPermission(claim.displayValue);
        return parsed?.module.toLowerCase() === module.toLowerCase()
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

  const availableModules = useMemo(() => Array.from(new Set(
    (role?.roleClaims ?? [])
      .map((claim) => splitPermission(claim.displayValue)?.module)
      .filter((module): module is string => Boolean(module)),
  )).sort((left, right) => left.localeCompare(right)), [role]);

  const permissionActions = useMemo(() => sortPermissionActions(Array.from(new Set(
    (role?.roleClaims ?? [])
      .map((claim) => splitPermission(claim.displayValue)?.action)
      .filter((action): action is string => Boolean(action)),
  ))), [role]);

  const filteredModules = useMemo(() => {
    let modules = availableModules.filter(
      (module) => !selectedModule || module.toLowerCase() === selectedModule.toLowerCase(),
    );

    if (searchTerm.trim()) {
      const query = searchTerm.trim().toLocaleLowerCase(i18n.language);
      modules = modules.filter((module) => {
        const searchableValues = [
          module,
          getPermissionResourceLabel(module, t),
          ...(role?.roleClaims ?? [])
            .map((claim) => splitPermission(claim.displayValue))
            .filter((claim) => claim?.module.toLowerCase() === module.toLowerCase())
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
      modules = modules.filter((module) =>
        role.roleClaims.some((claim) => {
          const parsed = splitPermission(claim.displayValue);
          return claim.isSelected && parsed?.module.toLowerCase() === module.toLowerCase();
        }),
      );
    }

    return modules;
  }, [availableModules, i18n.language, role, searchTerm, selectedModule, showOnlySelected, t]);

  const paginatedModules = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredModules.slice(start, start + rowsPerPage);
  }, [filteredModules, page, rowsPerPage]);

  const selectFiltered = (isSelected: boolean) => {
    if (!role || role.isSystem || !canEdit) return;
    const filteredModuleNames = new Set(filteredModules.map((module) => module.toLowerCase()));
    replaceClaims(
      role.roleClaims.map((claim) => {
        const parsed = splitPermission(claim.displayValue);
        return parsed && filteredModuleNames.has(parsed.module.toLowerCase())
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
    availableModules,
    canEdit,
    filteredModules,
    goBack,
    goDashboard: async () => {
      if (!(await requestDiscard())) return;
      router.push(appRoutes.shell.home);
    },
    isLoading,
    isSaving,
    notifications: { SnackbarComponent },
    page,
    paginatedModules,
    permissionActions,
    role,
    rowsPerPage,
    searchTerm,
    selectFiltered,
    selectModule,
    selectedModule,
    setPage,
    setRowsPerPage,
    setSearchTerm: (value: string) => {
      setSearchTerm(value);
      setPage(0);
    },
    setSelectedModule: (value: string) => {
      setSelectedModule(value);
      setPage(0);
    },
    setShowOnlySelected: (value: boolean) => {
      setShowOnlySelected(value);
      setPage(0);
    },
    resetFilters: () => {
      setSearchTerm("");
      setSelectedModule("");
      setShowOnlySelected(false);
      setPage(0);
    },
    showOnlySelected,
    statistics,
    submit: form.handleSubmit(updateRole),
    toggleClaim,
  };
}
