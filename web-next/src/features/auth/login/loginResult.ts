import { z } from "zod";
import type {
  AuthenticatedLoginResponse,
  CompanySelectionResponse,
  TenantSelectionResponse,
} from "./types";

const authenticatedLoginSchema = z.object({
  isAuthenticated: z.literal(true),
  companyId: z.number().int().positive(),
});

const tenantSelectionSchema = z.object({
  isAuthenticated: z.literal(false),
  requiresTenantSelection: z.literal(true),
  tenantSelectionToken: z.string().trim().min(1),
  tenantSelectionTokenExpiration: z.string().refine((value) => !Number.isNaN(Date.parse(value))),
  tenants: z.array(z.object({
    id: z.string().trim().min(1),
    identifier: z.string().trim().min(1),
    name: z.string().trim().min(1),
  })).min(2),
});

const companySchema = z.object({
  id: z.number().int().positive(),
  companyCode: z.string().trim().min(1),
  nameAr: z.string(),
  nameEn: z.string(),
});

const companySelectionSchema = z.object({
  isAuthenticated: z.literal(false),
  requiresCompanySelection: z.literal(true),
  companySelectionToken: z.string().trim().min(1),
  companySelectionTokenExpiration: z.string().refine(
    (value) => !Number.isNaN(Date.parse(value)),
    "Invalid company-selection token expiration",
  ),
  companies: z.array(companySchema).min(2),
}).superRefine((value, context) => {
  const companyIds = new Set(value.companies.map((company) => company.id));
  if (companyIds.size !== value.companies.length) {
    context.addIssue({
      code: "custom",
      path: ["companies"],
      message: "Company identifiers must be unique",
    });
  }
});

export type LoginResult =
  | { kind: "authenticated"; response: AuthenticatedLoginResponse }
  | { kind: "company-selection"; response: CompanySelectionResponse }
  | { kind: "tenant-selection"; response: TenantSelectionResponse };

export function parseLoginResult(value: unknown): LoginResult | null {
  const authenticated = authenticatedLoginSchema.safeParse(value);
  if (authenticated.success) {
    return { kind: "authenticated", response: authenticated.data };
  }

  const tenantSelection = tenantSelectionSchema.safeParse(value);
  if (tenantSelection.success) {
    return { kind: "tenant-selection", response: tenantSelection.data };
  }

  const companySelection = companySelectionSchema.safeParse(value);
  if (companySelection.success) {
    return { kind: "company-selection", response: companySelection.data };
  }

  return null;
}
