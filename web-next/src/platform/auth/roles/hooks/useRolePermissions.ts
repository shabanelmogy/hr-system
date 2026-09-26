import useNotifications from "@/shared/hooks/useNotifications";
import { applyApiFieldErrors } from "@/shared/utils/formErrors";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
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

function splitPermission(value: string): { module: string; action: string } | null {
  const separator = value.indexOf(":");
  if (separator <= 0 || separator === value.length - 1) return null;
  return { module: value.slice(0, separator), action: value.slice(separator + 1) };
}

export function useRolePermissions(roleId: string) {
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
        form.reset({ id: nextRole.id, name: nextRole.name, roleClaims: nextRole.roleClaims });
      })
      .catch((error) => {
        if (!active) return;
        showError((error as Error)?.message || "Failed to load role claims");
        setRole(null);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [form, getRoleWithClaims, roleId, showError]);

  const replaceClaims = (roleClaims: RoleClaimsFormData["roleClaims"]) => {
    if (!role || role.isSystem || !canEdit) return;
    setRole({ ...role, roleClaims });
    form.setValue("roleClaims", roleClaims, { shouldDirty: true, shouldValidate: true });
  };

  const selectAll = (type: string, isSelected: boolean) => {
    if (!role || role.isSystem || !canEdit) return;
    replaceClaims(
      role.roleClaims.map((claim) =>
        claim.displayValue.toLowerCase().endsWith(`:${type.toLowerCase()}`)
          ? { ...claim, isSelected }
          : claim,
      ),
    );
  };

  const areAllSelected = (type: string) => {
    if (!role) return false;
    const claims = role.roleClaims.filter((claim) =>
      claim.displayValue.toLowerCase().endsWith(`:${type.toLowerCase()}`),
    );
    return claims.length > 0 && claims.every((claim) => claim.isSelected);
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

  const permissionActions = useMemo(() => Array.from(new Set(
    (role?.roleClaims ?? [])
      .map((claim) => splitPermission(claim.displayValue)?.action)
      .filter((action): action is string => Boolean(action)),
  )).sort((left, right) => left.localeCompare(right)), [role]);

  const filteredModules = useMemo(() => {
    let modules = availableModules.filter(
      (module) => !selectedModule || module.toLowerCase() === selectedModule.toLowerCase(),
    );

    if (searchTerm) {
      modules = modules.filter((module) =>
        module.toLowerCase().includes(searchTerm.toLowerCase()),
      );
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
  }, [availableModules, role, searchTerm, selectedModule, showOnlySelected]);

  const paginatedModules = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredModules.slice(start, start + rowsPerPage);
  }, [filteredModules, page, rowsPerPage]);

  const statistics = useMemo(() => {
    const total = role?.roleClaims.length ?? 0;
    const selected = role?.roleClaims.filter((claim) => claim.isSelected).length ?? 0;
    return { total, selected, percentage: total > 0 ? (selected / total) * 100 : 0 };
  }, [role]);

  const updateRole = async (data: RoleClaimsFormData) => {
    if (!role || role.isSystem || !canEdit) return;
    setIsSaving(true);
    try {
      await updateRoleClaims(data);
      showSuccess("Role permissions updated successfully");
      form.reset(data);
      router.push(appRoutes.platform.administration.roles);
    } catch (error) {
      applyApiFieldErrors(error, form.setError, { Name: "name" });
      showError(
        (error as Error)?.message || "Failed to update role permissions",
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
    areAllSelected,
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
    selectAll,
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
    showOnlySelected,
    statistics,
    submit: form.handleSubmit(updateRole),
    toggleClaim,
  };
}
