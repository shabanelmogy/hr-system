# Multi-Tenant Company Selection

## Model

- `Tenant` represents the customer account.
- `Company` represents an operating company owned by a tenant.
- `ApplicationUser.TenantId` assigns a user to one tenant.
- `UserCompanyAccess` grants that user access to one or more active companies in the tenant.
- Tenant-owned and company-owned records carry explicit scope keys. EF Core query filters and `SaveChanges` checks enforce the current scope.
- Countries, states, districts, and address types remain shared reference data.

This is intentionally a shared-database monolith. It does not add a tenant framework or separate deployable modules.

## Login Flow

1. The user submits credentials.
2. If the user has no active company access, the API returns `User.NoCompanyAccess`.
3. If the user has one active company, the API immediately issues normal access and refresh tokens.
4. If the user has more than one active company, the API returns a short-lived company-selection token and the available company names. No access or refresh token is issued at this step.
5. The user selects a company. The API validates the temporary token, tenant, security stamp, user status, company status, and membership before issuing normal tokens.
6. Access, refresh, realtime, and session responses include `tenantId` and `companyId`.

The selection token is valid for five minutes by default (`JwtOptions:CompanySelectionExpireInMinutes`). It is not accepted by normal authenticated endpoints.

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

## Existing Database Migration

Apply the generated `AddTenantCompanyIsolation` migration before starting the application against an existing database.

For an existing database with users, the migration:

- Creates the default tenant and one default company.
- Assigns existing users to the default tenant and company.
- Backfills company and tenant keys for existing company-owned rows.
- Creates one default `UserCompanyAccess` row per existing user.
- Removes the obsolete refresh-token replacement hash.

For a fresh database, the migration creates the schema without a company. The normal seed process creates the default tenant, bootstrap users, default company, and memberships.

To grant a user access to several companies, send `companyIds` in the authenticated user create/update request. When omitted, the current company is used. Company IDs must belong to active companies in the current tenant.

## Frontend Contract

`web-next` is the canonical frontend. Its login flow recognizes the company-selection response, displays a localized MUI dialog, posts the selected company to `auth/selectCompany`, and navigates only after the final token response is received.
