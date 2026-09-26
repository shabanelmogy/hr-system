import http from "node:http";

const portFlag = process.argv.indexOf("--port");
const port = portFlag >= 0 ? Number(process.argv[portFlag + 1]) : 3199;
const host = "127.0.0.1";

const companies = [
  { id: 1, companyCode: "ONE", nameAr: "الشركة الأولى", nameEn: "Company One" },
  { id: 2, companyCode: "TWO", nameAr: "الشركة الثانية", nameEn: "Company Two" },
];

const permissions = {
  user: [
    "FiscalYears:View",
    "FiscalYears:Create",
    "FiscalYears:Edit",
    "Appointments:View",
  ],
  admin: [
    "FiscalYears:View",
    "Appointments:View",
    "OrganizationalStructure:View",
    "Roles:View",
    "RolePermissions:View",
    "RolePermissions:Edit",
    "Users:View",
  ],
  superadmin: ["Countries:View", "Countries:Create", "Countries:Edit", "Countries:Delete"],
};

const state = {
  sessions: new Map(),
  refreshTokens: new Map(),
  countries: [],
  fiscalYears: {},
  sessionMode: "ok",
  countriesMode: "ok",
  role: null,
};

resetState();

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? `${host}:${port}`}`);

  if (request.method === "GET" && url.pathname === "/__e2e/health") {
    return json(response, 200, { ok: true });
  }
  if (request.method === "POST" && url.pathname === "/__e2e/reset") {
    resetState();
    return json(response, 204);
  }
  if (request.method === "POST" && url.pathname === "/__e2e/session-mode") {
    const body = await readJson(request);
    state.sessionMode = body?.mode === "unavailable" ? "unavailable" : "ok";
    return json(response, 204);
  }
  if (request.method === "POST" && url.pathname === "/__e2e/invalidate-sessions") {
    state.sessions.clear();
    state.refreshTokens.clear();
    return json(response, 204);
  }
  if (request.method === "POST" && url.pathname === "/__e2e/invalidate-access") {
    state.sessions.clear();
    return json(response, 204);
  }
  if (request.method === "POST" && url.pathname === "/__e2e/countries-mode") {
    const body = await readJson(request);
    state.countriesMode = body?.mode === "fail" ? "fail" : "ok";
    return json(response, 204);
  }

  if (request.method === "POST" && url.pathname === "/api/v1/auth/login") {
    const body = await readJson(request);
    if (body?.username === "user" && body?.password === "P@ssword123") {
      return json(response, 200, {
        isAuthenticated: false,
        requiresTenantSelection: true,
        tenantSelectionToken: "tenant-selection-user",
        tenantSelectionTokenExpiration: futureIso(),
        tenants: [
          { id: "tenant-a", identifier: "TEN-A", name: "Tenant Alpha" },
          { id: "tenant-b", identifier: "TEN-B", name: "Tenant Beta" },
        ],
      });
    }
    if (body?.username === "admin" && body?.password === "P@ssword123") {
      return json(response, 200, issueAuth("admin", 1, "tenant-a"));
    }
    if (body?.username === "superadmin" && body?.password === "P@ssword123") {
      return json(response, 200, issueAuth("superadmin", 1, "platform"));
    }
    return problem(response, 401, "Invalid credentials");
  }

  if (request.method === "POST" && url.pathname === "/api/v1/auth/selectTenant") {
    const body = await readJson(request);
    if (body?.tenantSelectionToken !== "tenant-selection-user" || !["tenant-a", "tenant-b"].includes(body?.tenantId)) {
      return problem(response, 400, "Invalid tenant selection");
    }
    return json(response, 200, {
      isAuthenticated: false,
      requiresCompanySelection: true,
      companySelectionToken: `company-selection:${body.tenantId}`,
      companySelectionTokenExpiration: futureIso(),
      companies,
    });
  }

  if (request.method === "POST" && url.pathname === "/api/v1/auth/selectCompany") {
    const body = await readJson(request);
    const match = /^company-selection:(tenant-a|tenant-b)$/.exec(body?.companySelectionToken ?? "");
    if (!match || !companies.some((company) => company.id === body?.companyId)) {
      return problem(response, 400, "Invalid company selection");
    }
    return json(response, 200, issueAuth("user", body.companyId, match[1]));
  }

  if (request.method === "GET" && url.pathname === "/api/v1/auth/session") {
    if (state.sessionMode === "unavailable") return problem(response, 503, "Authentication service unavailable");
    const session = sessionFromAuthorization(request);
    return session ? json(response, 200, session) : problem(response, 401, "Unauthorized");
  }

  if (request.method === "POST" && url.pathname === "/api/v1/auth/switchCompany") {
    const current = sessionFromAuthorization(request);
    const body = await readJson(request);
    if (!current || !companies.some((company) => company.id === body?.companyId)) {
      return problem(response, 401, "Unauthorized");
    }
    const kind = current.roles.includes("admin") ? "admin" : "user";
    return json(response, 200, issueAuth(kind, body.companyId, current.tenantId));
  }

  if (request.method === "POST" && url.pathname === "/api/v1/auth/refreshToken") {
    const body = await readJson(request);
    const refresh = state.refreshTokens.get(body?.refreshToken);
    return refresh
      ? json(response, 200, issueAuth(refresh.kind, refresh.companyId, refresh.tenantId))
      : problem(response, 401, "Unauthorized");
  }

  if (request.method === "POST" && url.pathname === "/api/v1/auth/logOut") {
    return json(response, 204);
  }

  if (request.method === "GET" && url.pathname === "/api/v1/auth/realtimeToken") {
    return sessionFromAuthorization(request)
      ? json(response, 200, { token: "e2e-realtime-token" })
      : problem(response, 401, "Unauthorized");
  }

  if (request.method === "GET" && url.pathname === "/api/v1/modules/accessible") {
    const session = sessionFromAuthorization(request);
    if (!session) return problem(response, 401, "Unauthorized");
    return json(response, 200, modulesFor(session));
  }

  if (request.method === "GET" && url.pathname === "/api/v1/roles/getRoleClaims") {
    const session = sessionFromAuthorization(request);
    if (!session) return problem(response, 401, "Unauthorized");
    return url.searchParams.get("roleId") === state.role.id
      ? json(response, 200, state.role)
      : problem(response, 404, "Role not found");
  }

  if (request.method === "PUT" && url.pathname === "/api/v1/roles/updateRoleClaims") {
    const session = sessionFromAuthorization(request);
    if (!session) return problem(response, 401, "Unauthorized");
    const body = await readJson(request);
    if (body?.id !== state.role.id || !Array.isArray(body?.roleClaims)) {
      return problem(response, 400, "Invalid role permissions payload");
    }
    state.role = { ...state.role, roleClaims: body.roleClaims };
    return json(response, 204);
  }

  if (request.method === "GET" && url.pathname === "/api/v1/fiscal-years") {
    const session = sessionFromAuthorization(request);
    if (!session) return problem(response, 401, "Unauthorized");
    const search = (url.searchParams.get("search") ?? "").trim().toLowerCase();
    const items = fiscalYearsFor(session.companyId)
      .filter((item) => !search || `${item.code} ${item.nameEn} ${item.nameAr}`.toLowerCase().includes(search))
      .map(toFiscalYearListItem);
    return json(response, 200, page(items));
  }

  if (request.method === "POST" && url.pathname === "/api/v1/fiscal-years") {
    const session = sessionFromAuthorization(request);
    if (!session) return problem(response, 401, "Unauthorized");
    const body = await readJson(request);
    const items = fiscalYearsFor(session.companyId);
    const id = Math.max(0, ...items.map((item) => item.id)) + 1;
    const fiscalYear = makeFiscalYear({
      id,
      code: body?.code ?? "",
      nameAr: body?.nameAr ?? "",
      nameEn: body?.nameEn ?? "",
      startDate: body?.startDate ?? "",
      endDate: body?.endDate ?? "",
      periodFrequency: body?.periodFrequency === 2 ? 2 : 1,
      rowVersion: `rv-${session.companyId}-${id}-1`,
    });
    items.push(fiscalYear);
    return json(response, 201, fiscalYear);
  }

  const fiscalYearMatch = /^\/api\/v1\/fiscal-years\/(\d+)$/.exec(url.pathname);
  if (fiscalYearMatch && request.method === "GET") {
    const session = sessionFromAuthorization(request);
    if (!session) return problem(response, 401, "Unauthorized");
    const fiscalYear = fiscalYearsFor(session.companyId)
      .find((item) => item.id === Number(fiscalYearMatch[1]));
    return fiscalYear
      ? json(response, 200, fiscalYear)
      : problem(response, 404, "Fiscal year not found");
  }

  if (fiscalYearMatch && request.method === "PUT") {
    const session = sessionFromAuthorization(request);
    if (!session) return problem(response, 401, "Unauthorized");
    const items = fiscalYearsFor(session.companyId);
    const index = items.findIndex((item) => item.id === Number(fiscalYearMatch[1]));
    if (index < 0) return problem(response, 404, "Fiscal year not found");
    const body = await readJson(request);
    items[index] = makeFiscalYear({
      ...items[index],
      code: body?.code ?? items[index].code,
      nameAr: body?.nameAr ?? items[index].nameAr,
      nameEn: body?.nameEn ?? items[index].nameEn,
      startDate: body?.startDate ?? items[index].startDate,
      endDate: body?.endDate ?? items[index].endDate,
      periodFrequency: body?.periodFrequency === 2 ? 2 : 1,
      updatedOn: new Date().toISOString(),
      rowVersion: `rv-${session.companyId}-${items[index].id}-${Date.now()}`,
    });
    return json(response, 200, items[index]);
  }

  if (request.method === "GET" && url.pathname === "/api/v1/Appointments/GetAll") {
    return sessionFromAuthorization(request)
      ? json(response, 200, [])
      : problem(response, 401, "Unauthorized");
  }

  if (request.method === "GET" && url.pathname === "/api/v1/organizational-structure/branches") {
    if (!sessionFromAuthorization(request)) return problem(response, 401, "Unauthorized");
    return json(response, 200, page([{
      id: 1,
      resource: "branches",
      code: "HQ",
      nameEn: "Head Office",
      nameAr: "المقر الرئيسي",
      isHeadquarters: true,
      isDeleted: false,
      createdOn: "2026-01-01T00:00:00.000Z",
      isOperationallyActive: true,
    }]));
  }

  if (request.method === "GET" && url.pathname === "/api/v1/countries") {
    if (!sessionFromAuthorization(request)) return problem(response, 401, "Unauthorized");
    if (state.countriesMode === "fail") return problem(response, 500, "Countries fixture failure");
    const search = (url.searchParams.get("search") ?? "").trim().toLowerCase();
    const recordStatus = (url.searchParams.get("recordStatus") ?? url.searchParams.get("status") ?? "active").toLowerCase();
    const items = state.countries.filter((country) => {
      const statusMatch =
        recordStatus === "all" ||
        (recordStatus === "archived" ? country.isDeleted : !country.isDeleted);
      return statusMatch && (!search || country.nameEn.toLowerCase().includes(search));
    });
    return json(response, 200, page(items));
  }

  const countryMatch = /^\/api\/v1\/countries\/(\d+)$/.exec(url.pathname);
  if (countryMatch && request.method === "GET") {
    const country = state.countries.find((item) => item.id === Number(countryMatch[1]));
    return country ? json(response, 200, country) : problem(response, 404, "Country not found");
  }

  if (request.method === "POST" && url.pathname === "/api/v1/countries") {
    if (state.countriesMode === "fail") return problem(response, 500, "Countries fixture failure");
    const body = await readJson(request);
    const country = {
      id: Math.max(0, ...state.countries.map((item) => item.id)) + 1,
      nameAr: body?.nameAr ?? "",
      nameEn: body?.nameEn ?? "",
      alpha2Code: body?.alpha2Code ?? null,
      alpha3Code: body?.alpha3Code ?? null,
      phoneCode: body?.phoneCode ?? null,
      currencyCode: body?.currencyCode ?? null,
      createdOn: new Date().toISOString(),
      updatedOn: null,
      isDeleted: false,
      statesCount: 0,
    };
    state.countries.push(country);
    return json(response, 201, country);
  }

  if (countryMatch && request.method === "PUT") {
    const index = state.countries.findIndex((item) => item.id === Number(countryMatch[1]));
    if (index < 0) return problem(response, 404, "Country not found");
    const body = await readJson(request);
    state.countries[index] = {
      ...state.countries[index],
      nameAr: body?.nameAr ?? state.countries[index].nameAr,
      nameEn: body?.nameEn ?? state.countries[index].nameEn,
      alpha2Code: body?.alpha2Code ?? null,
      alpha3Code: body?.alpha3Code ?? null,
      phoneCode: body?.phoneCode ?? null,
      currencyCode: body?.currencyCode ?? null,
      updatedOn: new Date().toISOString(),
    };
    return json(response, 200, state.countries[index]);
  }

  if (countryMatch && request.method === "DELETE") {
    const country = state.countries.find((item) => item.id === Number(countryMatch[1]));
    if (!country) return problem(response, 404, "Country not found");
    country.isDeleted = true;
    country.updatedOn = new Date().toISOString();
    return json(response, 204);
  }

  const countryRestoreMatch = /^\/api\/v1\/countries\/(\d+)\/restore$/.exec(url.pathname);
  if (countryRestoreMatch && request.method === "POST") {
    const country = state.countries.find((item) => item.id === Number(countryRestoreMatch[1]));
    if (!country) return problem(response, 404, "Country not found");
    country.isDeleted = false;
    country.updatedOn = new Date().toISOString();
    return json(response, 204);
  }

  if (url.pathname.startsWith("/hubs/company")) {
    return problem(response, 503, "Realtime fixture intentionally unavailable");
  }

  return problem(response, 404, `No E2E fixture for ${request.method} ${url.pathname}`);
});

server.listen(port, host, () => {
  console.log(`[e2e-backend] listening on http://${host}:${port}`);
});

function resetState() {
  state.sessions.clear();
  state.refreshTokens.clear();
  state.sessionMode = "ok";
  state.countriesMode = "ok";
  state.role = makeRoleFixture();
  state.fiscalYears = {
    1: [makeFiscalYear({
      id: 1,
      code: "FY-ONE",
      nameAr: "السنة المالية الأولى",
      nameEn: "Company One Fiscal Year",
      startDate: "2026-01-01",
      endDate: "2026-12-31",
      periodFrequency: 1,
      rowVersion: "rv-ONE",
    })],
    2: [makeFiscalYear({
      id: 2,
      code: "FY-TWO",
      nameAr: "السنة المالية الثانية",
      nameEn: "Company Two Fiscal Year",
      startDate: "2026-01-01",
      endDate: "2026-12-31",
      periodFrequency: 1,
      rowVersion: "rv-TWO",
    })],
  };
  state.countries = [
    {
      id: 1,
      nameAr: "مصر",
      nameEn: "Egypt",
      alpha2Code: "EG",
      alpha3Code: "EGY",
      phoneCode: "+20",
      currencyCode: "EGP",
      createdOn: "2026-01-01T00:00:00.000Z",
      updatedOn: null,
      isDeleted: false,
      statesCount: 4,
    },
  ];
}

function makeRoleFixture() {
  const selectedPermissions = new Set([
    "Accounts:View",
    "Books:View",
    "Countries:View",
    "Currencies:View",
    "FiscalYears:View",
    "JournalDefinitions:View",
    "Roles:View",
    "RolePermissions:View",
    "Users:View",
    "Users:Create",
    "Users:Edit",
  ]);
  const groups = [
    "Accounts",
    "Books",
    "Countries",
    "Currencies",
    "FiscalYears",
    "JournalDefinitions",
    "Roles",
    "RolePermissions",
    "Users",
    "UserInvitations",
    "WorkforcePlans",
    "WorkforceBudgets",
  ];
  const actions = ["View", "Create", "Edit", "Archive", "Restore", "Delete"];
  return {
    id: "finance-manager",
    name: "Finance managers",
    isSystem: false,
    isDeleted: false,
    roleClaims: groups.flatMap((group) => actions.map((action) => {
      const displayValue = `${group}:${action}`;
      return { displayValue, isSelected: selectedPermissions.has(displayValue) };
    })),
  };
}

function fiscalYearsFor(companyId) {
  return state.fiscalYears[companyId] ?? [];
}

function makeFiscalYear({
  id,
  code,
  nameAr,
  nameEn,
  startDate,
  endDate,
  periodFrequency,
  rowVersion,
  createdOn = "2026-01-01T00:00:00.000Z",
  updatedOn = null,
}) {
  const periodsCount = periodFrequency === 2 ? 4 : 12;
  return {
    id,
    code,
    nameAr,
    nameEn,
    startDate,
    endDate,
    periodFrequency,
    status: 1,
    periodsCount,
    periods: [],
    createdOn,
    updatedOn,
    isDeleted: false,
    rowVersion,
  };
}

function toFiscalYearListItem(item) {
  const listItem = { ...item };
  delete listItem.periods;
  return listItem;
}

function issueAuth(kind, companyId, tenantId) {
  const token = `access:${kind}:${tenantId}:${companyId}:${Date.now()}:${Math.random()}`;
  const refreshToken = `refresh:${kind}:${tenantId}:${companyId}:${Date.now()}:${Math.random()}`;
  const session = makeSession(kind, companyId, tenantId);
  state.sessions.set(token, session);
  state.refreshTokens.set(refreshToken, { kind, companyId, tenantId });
  return {
    isAuthenticated: true,
    companyId,
    token,
    refreshToken,
    expiration: new Date(Date.now() + 60 * 60_000).toISOString(),
  };
}

function makeSession(kind, companyId, tenantId) {
  const company = companies.find((item) => item.id === companyId) ?? companies[0];
  const isSuperAdmin = kind === "superadmin";
  return {
    userId: `e2e-${kind}`,
    tenantId,
    tenantName: isSuperAdmin ? "Platform" : tenantId === "tenant-b" ? "Tenant Beta" : "Tenant Alpha",
    tenantPlanName: "E2E",
    companyId: company.id,
    companyCode: company.companyCode,
    companyNameAr: company.nameAr,
    companyNameEn: company.nameEn,
    companies,
    userName: kind,
    email: `${kind}@example.test`,
    firstName: "E2E",
    lastName: kind,
    roles: isSuperAdmin ? ["super_admin"] : kind === "admin" ? ["admin"] : ["user"],
    permissions: permissions[kind],
    tenantSubscriptionStatus: "Active",
    tenantSubscriptionEndsOn: futureIso(),
    tenantReadOnly: false,
    expiresAt: Date.now() + 60 * 60_000,
  };
}

function modulesFor(session) {
  if (session.roles.includes("super_admin")) return [];
  const modules = [
    {
      code: "acc",
      name: "Accounting",
      isDefault: true,
      submodules: [
        {
          code: "ledger-setup",
          name: "Ledger setup",
          requiredPermissions: ["FiscalYears:View"],
          entryPath: "/finance/ledger-setup",
        },
      ],
    },
    {
      code: "crm",
      name: "CRM",
      isDefault: false,
      submodules: [
        {
          code: "appointments",
          name: "Appointments",
          requiredPermissions: ["Appointments:View"],
          entryPath: "/appointments",
        },
      ],
    },
  ];
  if (session.roles.includes("admin")) {
    modules.push({
      code: "hr",
      name: "HR",
      isDefault: false,
      submodules: [
        {
          code: "basic-data",
          name: "Basic data",
          requiredPermissions: ["OrganizationalStructure:View"],
          entryPath: "/basic-data/organizational-structure/branches",
        },
      ],
    });
  }
  return modules;
}

function sessionFromAuthorization(request) {
  const value = request.headers.authorization ?? "";
  return value.startsWith("Bearer ") ? state.sessions.get(value.slice(7)) ?? null : null;
}

function page(items) {
  return {
    items,
    metaData: {
      currentPage: 1,
      totalPages: 1,
      pageSize: 10,
      pageNumber: 1,
      totalCount: items.length,
      hasPrev: false,
      hasNext: false,
    },
  };
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (chunks.length === 0) return null;
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return null;
  }
}

function json(response, status, payload) {
  response.statusCode = status;
  response.setHeader("cache-control", "no-store");
  if (status === 204) return response.end();
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload));
}

function problem(response, status, detail) {
  return json(response, status, {
    type: "about:blank",
    title: detail,
    status,
    detail,
  });
}

function futureIso() {
  return new Date(Date.now() + 24 * 60 * 60_000).toISOString();
}
