import type { FieldErrors } from "react-hook-form";
import type { TenantFormState } from "./tenantValidation";

export type TenantFormTab = "identity" | "subscription" | "contact" | "entitlements" | "notes";

const fieldsByTab: Record<TenantFormTab, readonly (keyof TenantFormState)[]> = {
  identity: ["identifier", "name", "isActive"],
  subscription: [
    "planName",
    "subscriptionStatus",
    "subscriptionStartedOn",
    "subscriptionEndsOn",
    "maxAdmins",
    "maxUsers",
  ],
  contact: ["billingEmail", "contactName", "contactPhone"],
  entitlements: ["entitlements"],
  notes: ["notes"],
};

export function getFirstTenantErrorTab(
  errors: FieldErrors<TenantFormState>,
): TenantFormTab {
  return getFirstTenantErrorField(errors)
    ? (Object.entries(fieldsByTab).find(([, fields]) =>
      fields.some((field) => Boolean(errors[field])),
    )?.[0] as TenantFormTab | undefined) ?? "identity"
    : "identity";
}

export function getFirstTenantErrorField(
  errors: FieldErrors<TenantFormState>,
): keyof TenantFormState | null {
  for (const tab of Object.keys(fieldsByTab) as TenantFormTab[]) {
    const field = fieldsByTab[tab].find((name) => Boolean(errors[name]));
    if (field) return field;
  }
  return null;
}
