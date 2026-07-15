import useNotifications from "@/shared/hooks/useNotifications";
import { applyApiFieldErrors } from "@/shared/utils/formErrors";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { ROLE_MODULES, PERMISSION_TYPES } from "../components/role-permissions/constants";
import useRoleStore from "../store/useRoleStore";
import {
  getRoleClaimsValidationSchema,
  type RoleClaimsFormData,
} from "../utils/validation";

export function useRolePermissions(roleId: string) {
  const router = useRouter();
  const { showError, showSuccess, SnackbarComponent } = useNotifications();
  const { getRoleWithClaims, updateRoleClaims } = useRoleStore();
  const [role, setRole] = useState<RoleClaimsFormData | null>(null);
  const [selectedModule, setSelectedModule] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showOnlySelected, setShowOnlySelected] = useState(false);

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

        const nextRole: RoleClaimsFormData = {
          id: result.id || roleId,
          name: result.name || "",
          roleClaims: result.roleClaims || [],
        };
        setRole(nextRole);
        form.reset(nextRole);
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
    if (!role) return;
    setRole({ ...role, roleClaims });
    form.setValue("roleClaims", roleClaims, { shouldDirty: true, shouldValidate: true });
  };

  const selectAll = (type: string, isSelected: boolean) => {
    if (!role) return;
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
    if (!role || claimIndex < 0) return;
    replaceClaims(
      role.roleClaims.map((claim, index) =>
        index === claimIndex ? { ...claim, isSelected: !claim.isSelected } : claim,
      ),
    );
  };

  const filteredModules = useMemo(() => {
    let modules = ROLE_MODULES.filter(
      (module) => !selectedModule || module.toLowerCase() === selectedModule.toLowerCase(),
    );

    if (searchTerm) {
      modules = modules.filter((module) =>
        module.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (showOnlySelected && role) {
      modules = modules.filter((module) =>
        PERMISSION_TYPES.some((type) =>
          role.roleClaims.some(
            (claim) =>
              claim.isSelected &&
              claim.displayValue.toLowerCase().startsWith(module.toLowerCase()) &&
              claim.displayValue.toLowerCase().endsWith(`:${type.toLowerCase()}`),
          ),
        ),
      );
    }

    return modules;
  }, [role, searchTerm, selectedModule, showOnlySelected]);

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
    setIsSaving(true);
    try {
      await updateRoleClaims(data);
      showSuccess("Role permissions updated successfully");
      router.push("/administration/roles");
    } catch (error) {
      applyApiFieldErrors(error, form.setError, { Name: "name" });
      showError(
        (error as Error)?.message || "Failed to update role permissions",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const goBack = () => {
    if (form.formState.isDirty) setDiscardDialogOpen(true);
    else router.push("/administration/roles");
  };

  const confirmBack = () => {
    setDiscardDialogOpen(false);
    router.push("/administration/roles");
  };

  return {
    ...form,
    areAllSelected,
    confirmBack,
    discardDialogOpen,
    filteredModules,
    goBack,
    goDashboard: () => router.push("/"),
    isLoading,
    isSaving,
    notifications: { SnackbarComponent },
    page,
    paginatedModules,
    role,
    rowsPerPage,
    searchTerm,
    selectAll,
    selectedModule,
    setDiscardDialogOpen,
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
