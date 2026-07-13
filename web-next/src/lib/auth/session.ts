export type SessionClaims = {
  userId: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
  expiresAt: number;
};

export function isSessionClaims(value: unknown): value is SessionClaims {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<SessionClaims>;

  return (
    // Critical fields must be non-empty strings
    typeof candidate.userId === "string" &&
    candidate.userId.length > 0 &&
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
    // Expiration must be a valid future timestamp.
    typeof candidate.expiresAt === "number" &&
    !Number.isNaN(candidate.expiresAt) &&
    Number.isFinite(candidate.expiresAt) &&
    candidate.expiresAt > Date.now()
  );
}
