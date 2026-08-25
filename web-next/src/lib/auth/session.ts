export type CompanyOption = {
  id: number;
  companyCode: string;
  nameAr: string;
  nameEn: string;
};

export type SessionClaims = {
  userId: string;
  tenantId: string;
  tenantName: string;
  tenantPlanName: string;
  companyId: number;
  companyCode: string;
  companyNameAr: string;
  companyNameEn: string;
  companies: CompanyOption[];
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
  tenantSubscriptionStatus: string;
  tenantSubscriptionEndsOn: string | null;
  tenantReadOnly: boolean;
  expiresAt: number;
};

export function isSessionClaims(value: unknown): value is SessionClaims {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<SessionClaims>;

  return (
    // Critical fields must be non-empty strings
    typeof candidate.userId === "string" &&
    candidate.userId.length > 0 &&
    typeof candidate.tenantId === "string" &&
    candidate.tenantId.length > 0 &&
    typeof candidate.tenantName === "string" &&
    candidate.tenantName.length > 0 &&
    typeof candidate.tenantPlanName === "string" &&
    candidate.tenantPlanName.length > 0 &&
    typeof candidate.companyId === "number" &&
    Number.isInteger(candidate.companyId) &&
    candidate.companyId > 0 &&
    typeof candidate.companyCode === "string" &&
    candidate.companyCode.trim().length > 0 &&
    typeof candidate.companyNameAr === "string" &&
    typeof candidate.companyNameEn === "string" &&
    isCompanyOptions(candidate.companies, candidate.companyId) &&
    typeof candidate.userName === "string" &&
    candidate.userName.length > 0 &&
    typeof candidate.email === "string" &&
    candidate.email.length > 0 &&
    // Name fields can be empty in some systems
    typeof candidate.firstName === "string" &&
    typeof candidate.lastName === "string" &&
    // Roles array with non-empty strings
    Array.isArray(candidate.roles) &&
    candidate.roles.every((role) => typeof role === "string" && role.length > 0) &&
    // Permissions array with non-empty strings
    Array.isArray(candidate.permissions) &&
    candidate.permissions.every((permission) => typeof permission === "string" && permission.length > 0) &&
    typeof candidate.tenantSubscriptionStatus === "string" &&
    candidate.tenantSubscriptionStatus.length > 0 &&
    (candidate.tenantSubscriptionEndsOn === null ||
      (typeof candidate.tenantSubscriptionEndsOn === "string" &&
        Number.isFinite(Date.parse(candidate.tenantSubscriptionEndsOn)))) &&
    typeof candidate.tenantReadOnly === "boolean" &&
    // Expiration must be a valid future timestamp.
    typeof candidate.expiresAt === "number" &&
    !Number.isNaN(candidate.expiresAt) &&
    Number.isFinite(candidate.expiresAt) &&
    candidate.expiresAt > Date.now()
  );
}

function isCompanyOptions(
  value: unknown,
  currentCompanyId: number | undefined,
): value is CompanyOption[] {
  if (!Array.isArray(value) || value.length === 0) return false;

  const ids = new Set<number>();
  for (const company of value) {
    if (!company || typeof company !== "object") return false;
    const candidate = company as Partial<CompanyOption>;
    if (
      typeof candidate.id !== "number" ||
      !Number.isInteger(candidate.id) ||
      candidate.id <= 0 ||
      typeof candidate.companyCode !== "string" ||
      candidate.companyCode.trim().length === 0 ||
      typeof candidate.nameAr !== "string" ||
      typeof candidate.nameEn !== "string" ||
      ids.has(candidate.id)
    ) {
      return false;
    }
    ids.add(candidate.id);
  }

  return typeof currentCompanyId === "number" && ids.has(currentCompanyId);
}
