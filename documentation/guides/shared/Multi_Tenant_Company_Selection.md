# Multi-Tenant Company Selection

## Model

- `Tenant` represents the customer account.
- `Company` represents an operating company owned by a tenant.
- `PlatformUserTenantAccess` grants a user access to one or more active tenants; `PlatformApplicationUser.TenantId` holds the default tenant.
- `PlatformUserCompanyAccess` grants that user access to one or more active companies in the tenant.
- Tenant-owned and company-owned records carry explicit scope keys. EF Core query filters and `SaveChanges` checks enforce the current scope.
- Countries, states, districts, and address types remain shared reference data.

This is intentionally a shared-database monolith. It does not add a tenant framework or separate deployable modules.

## Login Flow

1. The user submits credentials (or completes an external login).
2. If the user has no available active tenant, the API returns `Authentication.NoTenantAccess`.
3. With exactly one tenant the API goes straight to company resolution. With more than one, it returns a short-lived tenant-selection token and the tenant options; no access or refresh token is issued at this step. A `super_admin` never receives a selection challenge.
4. The user explicitly selects a tenant. The API validates the one-time token, user security stamp, user status, and tenant membership before resolving companies.
5. If the selected tenant has no active company access, the API returns `Authentication.NoCompanyAccess`.
6. With exactly one company the API issues the session directly. With more than one, it returns a short-lived company-selection token and the company options; no access or refresh token is issued at this step.
7. The user explicitly selects a company. Only then does the API validate the one-time token, tenant, security stamp, user status, company status, and membership before issuing normal access and refresh tokens.
8. Access, refresh, realtime, and session responses include `tenantId` and `companyId`. Auth and session responses also expose the current company code and localized names.

Tenant- and company-selection tokens are valid for five minutes by default. Each token carries a unique `jti`, which is persisted in `AuthenticationSelectionChallenges` and consumed atomically on the first selection attempt. A consumed, expired, mismatched, or replayed selection token is rejected. Selection tokens are never accepted by normal authenticated endpoints.

The flow on both clients is `credentials -> tenant (only when there is a choice) -> company (only when there is a choice) -> module launcher -> module -> submodule`. When a selection list is shown, neither web nor mobile preselects an option; the user must choose before Continue is enabled.

## Current Company And Switching

`GET /api/v1/auth/session` is the source of truth for client company context. It returns:

- `companyId`, `companyCode`, `companyNameAr`, and `companyNameEn` for the current company.
- `companies`, containing every active company the user may enter in the current tenant.

Both `web-next` and `mobile-react` display the localized current company identity in the authenticated application header. When more than one company is available, the header opens the shared company selector.

`POST /api/v1/auth/switchCompany` is authenticated and accepts `{ companyId }`. The API revalidates tenant access, company activity, and membership; creates a new session bound to the selected company; and revokes only the replaced session. Other sessions owned by the user are preserved. The old access token stops passing server-side session validation because its session no longer has an active refresh token.

After a successful switch, every client must complete all of these steps before continuing:

1. Persist the replacement access and refresh tokens.
2. refetch `auth/session` rather than constructing company scope locally.
3. clear company-scoped query and sensitive-file caches.
4. disconnect and reconnect SignalR so group membership uses the new tenant/company claims.
5. refresh the active route without carrying old-company data into the new context.

Requests started before the switch can finish after the replacement credentials are stored. A `401` from such a request must never clear the newer session directly. The web BFF leaves credential deletion to a fresh `auth/session` verification, while mobile compares the failed request token with the currently stored token and retries with the newer token. Both clients suppress ordinary authentication-failure handling during the short credential replacement transaction. Mobile also lets any refresh already in flight settle before issuing the switch request, so an old refresh response cannot overwrite the replacement company credentials.

Company switching remains available when a tenant subscription is read-only because it changes authentication context, not tenant business data.

## Refresh Tokens

Refresh tokens are rotated and bound to the user session and company. The old token is revoked and a new token is stored. There is no replacement-token family or traversal chain. Revoking all sessions is still used for password, security-stamp, and administrator security actions.

## Notifications and Realtime Updates

Notification persistence and SignalR delivery stay simple:

- CRUD services save first.
- Hangfire enqueues the notification job after the successful save.
- Hangfire provides persistence, retry, and execution.
- Notification rows contain tenant, company, recipient, permission, and event data.
- SignalR connections join a tenant/company/user group so a user with several open company sessions receives only the notification for the selected company.
- Shared reference-data updates can remain global because they are not company-owned.

The small failure window between the database save and Hangfire enqueue is accepted for these non-critical realtime updates.

## Database

The tenant/company schema and `AuthenticationSelectionChallenges` are part of the Platform baseline migration `20260914181129_InitialPlatform`. Apply it with `api/scripts/Apply-ErpModuleMigrations.ps1`.

To grant a user access to several companies, send `companyIds` in the authenticated user create/update request. When omitted, the current company is used. Company IDs must belong to active companies in the current tenant.

## Frontend Contract

`web-next` and `mobile-react` implement the same company-selection and company-switching behavior. Both clients:

- parse the same strict company option shape: `id`, `companyCode`, `nameAr`, and `nameEn`;
- show tenant and company selection during login only when the API returns a selection challenge (more than one option);
- show current company identity in the authenticated header;
- offer only companies returned by `auth/session`;
- replace credentials, clear scoped state, and reconnect realtime services after a switch;
- use Arabic names in Arabic and English names in English, with the other name and then `companyCode` as fallbacks.

The web BFF keeps access and refresh tokens in secure HttpOnly cookies. Mobile stores them through the secure-session abstraction. UI code must never decode a token to invent an available-company list; the verified session contract owns that list.

## Verification Checklist

- One tenant and one company log in directly; several tenants or companies return the matching selection challenge; `super_admin` never gets a challenge.
- No access or refresh session is issued while a selection challenge is pending.
- Replaying the same tenant/company selection token fails.
- The session response contains the current company in a unique available-company list.
- Switching to an inaccessible or inactive company fails without changing client scope.
- A successful switch revokes the previous session, preserves unrelated user sessions, clears company-scoped caches, and reconnects realtime services.
- A delayed `401` from the previous company session cannot clear or log out the replacement session.
- Web and mobile headers show the same localized current-company identity.
