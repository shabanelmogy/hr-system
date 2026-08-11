import { z } from "zod";
import type {
  AuthenticatedLoginResponse,
  CompanySelectionResponse,
} from "./types";

const authenticatedLoginSchema = z.object({
  isAuthenticated: z.literal(true),
  companyId: z.number().int().positive(),
});

const companySchema = z.object({
  id: z.number().int().positive(),
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
  | { kind: "company-selection"; response: CompanySelectionResponse };

export function parseLoginResult(value: unknown): LoginResult | null {
  const authenticated = authenticatedLoginSchema.safeParse(value);
  if (authenticated.success) {
    return { kind: "authenticated", response: authenticated.data };
  }

  const companySelection = companySelectionSchema.safeParse(value);
  if (companySelection.success) {
    return { kind: "company-selection", response: companySelection.data };
  }

  return null;
}
