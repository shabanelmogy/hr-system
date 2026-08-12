import type {
  Role,
  RoleClaim,
  RoleWithClaims,
  User,
  UserCompanyOption,
} from "../types";

type UnknownRecord = Record<string, unknown>;

export function parseUsersResponse(response: unknown): User[] {
  return parseArray(response, parseUser, "users");
}

export function parseUserResponse(response: unknown): User {
  return parseUser(unwrapApiValue(response));
}

export function parseUserCompanyOptionsResponse(response: unknown): UserCompanyOption[] {
  return parseArray(response, parseUserCompanyOption, "user company options");
}

export function parseRolesResponse(response: unknown): Role[] {
  return parseArray(response, parseRole, "roles");
}

export function parseRoleResponse(response: unknown): Role {
  return parseRole(unwrapApiValue(response));
}

export function parseRoleWithClaimsResponse(response: unknown): RoleWithClaims {
  const role = parseRoleResponse(response);
  return { ...role, roleClaims: role.roleClaims ?? [] };
}

function parseArray<T>(
  response: unknown,
  parser: (value: unknown) => T,
  label: string,
): T[] {
  const value = unwrapApiValue(response);
  if (!Array.isArray(value)) {
    throw new Error(`Invalid ${label} response: expected an array.`);
  }
  return value.map((item) => parser(unwrapApiValue(item)));
}

function parseUser(value: unknown): User {
  const record = requireRecord(value, "user");
  return {
    id: requireString(record.id, "user.id"),
    firstName: requireString(record.firstName, "user.firstName"),
    lastName: requireString(record.lastName, "user.lastName"),
    userName: requireString(record.userName, "user.userName"),
    email: requireString(record.email, "user.email"),
    isDisabled: requireBoolean(record.isDisabled, "user.isDisabled"),
    isLocked: requireBoolean(record.isLocked, "user.isLocked"),
    profilePicture: optionalString(record.profilePicture),
    roles: parseStringArray(record.roles, "user.roles"),
    companyIds: parseNumberArray(record.companyIds, "user.companyIds"),
    defaultCompanyId: optionalNumber(record.defaultCompanyId, "user.defaultCompanyId"),
  };
}

function parseUserCompanyOption(value: unknown): UserCompanyOption {
  const record = requireRecord(value, "user company option");
  return {
    id: requireNumber(record.id, "userCompanyOption.id"),
    nameAr: requireString(record.nameAr, "userCompanyOption.nameAr"),
    nameEn: requireString(record.nameEn, "userCompanyOption.nameEn"),
    isActive: requireBoolean(record.isActive, "userCompanyOption.isActive"),
  };
}

function parseRole(value: unknown): Role {
  const record = requireRecord(value, "role");
  return {
    id: requireString(record.id, "role.id"),
    name: requireString(record.name, "role.name"),
    isDeleted: requireBoolean(record.isDeleted, "role.isDeleted"),
    roleClaims: record.roleClaims == null
      ? null
      : parseRoleClaims(record.roleClaims),
  };
}

function parseRoleClaims(value: unknown): RoleClaim[] {
  if (!Array.isArray(value)) {
    throw new Error("Invalid role.roleClaims response: expected an array.");
  }
  return value.map((claim) => {
    const record = requireRecord(claim, "role claim");
    return {
      displayValue: requireString(record.displayValue, "roleClaim.displayValue"),
      isSelected: requireBoolean(record.isSelected, "roleClaim.isSelected"),
    };
  });
}

function unwrapApiValue(response: unknown): unknown {
  const record = asRecord(response);
  if (!record) return response;
  if (record.isSuccess === true && "value" in record) return record.value;
  if ("data" in record) return record.data;
  return response;
}

function requireRecord(value: unknown, label: string): UnknownRecord {
  const record = asRecord(value);
  if (!record) throw new Error(`Invalid ${label} response: expected an object.`);
  return record;
}

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as UnknownRecord
    : null;
}

function requireString(value: unknown, label: string): string {
  if (typeof value !== "string") {
    throw new Error(`Invalid ${label} response: expected a string.`);
  }
  return value;
}

function optionalString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function requireBoolean(value: unknown, label: string): boolean {
  if (typeof value !== "boolean") {
    throw new Error(`Invalid ${label} response: expected a boolean.`);
  }
  return value;
}

function requireNumber(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    throw new Error(`Invalid ${label}: expected a positive integer.`);
  }
  return value;
}

function optionalNumber(value: unknown, label: string): number | null {
  return value == null ? null : requireNumber(value, label);
}

function parseNumberArray(value: unknown, label: string): number[] {
  if (!Array.isArray(value)) {
    throw new Error(`Invalid ${label}: expected a number array.`);
  }
  return value.map((item, index) => requireNumber(item, `${label}[${index}]`));
}

function parseStringArray(value: unknown, label: string): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error(`Invalid ${label} response: expected a string array.`);
  }
  return value;
}
