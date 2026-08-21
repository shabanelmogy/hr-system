# Prompt: Simplify Transactional Outbox to Hangfire

Use the following prompt in the project that currently implements Transactional
Outbox only for notifications and realtime data refresh.

```text
Simplify the current notification and realtime update architecture by removing the
custom Transactional Outbox implementation and replacing it with direct Hangfire
background jobs after successful database saves.

Context:

- This is an internal application.
- Outbox is used only for persisted notifications, SignalR messages, and frontend
  data-refresh events.
- These realtime operations are not business-critical.
- The small failure window between SaveChangesAsync() and Hangfire enqueue is
  acceptable.
- Prefer simple and maintainable code over guaranteed delivery for these events.

Before editing, locate every Outbox producer and consumer. If Outbox is also used for
accounting entries, payments, external integrations, audit guarantees, or any other
business-critical workflow, do not migrate that usage. Stop and report it before
continuing.

Apply the following architecture consistently:

1. Perform and validate the business operation.
2. Call SaveChangesAsync().
3. Only after SaveChangesAsync() succeeds, call BackgroundJob.Enqueue(...).
4. Let Hangfire persist, retry, schedule, and execute the background job.
5. Let the job persist the user notification when required and send the SignalR
   update.

Implementation requirements:

- Keep each background job inside the owning feature's Jobs folder.
- Use one consistent pattern for every migrated feature.
- Do not create another dispatcher, polling service, recovery service, lease manager,
  event bus, or custom background-job framework.
- Do not introduce a replacement Outbox abstraction.
- Apply this retry policy to every notification/realtime job:

  [AutomaticRetry(Attempts = 5, OnAttemptsExceeded = AttemptsExceededAction.Fail)]

- Each job request should contain only the data required after the HTTP request ends:
  - OperationId
  - Action
  - EntityId
  - ActorUserId when available
  - TenantId and CompanyId when applicable
  - Small display values required to build the notification text

- Do not pass HttpContext, ClaimsPrincipal, tracked EF entities, DbContext, or service
  instances in Hangfire job arguments.
- Use OperationId as the notification deduplication key so Hangfire retries do not
  create duplicate persisted notifications.
- Make jobs idempotent wherever they can perform more than one durable side effect.

Realtime requirements:

- Send one generic ReceiveEntityChanged event for frontend cache invalidation.
- Use a small payload containing only:
  - EventId
  - OccurredAtUtc
  - Resource
  - Action
  - EntityId
- Generate resource names from the entity type using the project's shared convention,
  such as RealtimeResource.For<TEntity>(). Do not maintain a central manual entity-name
  list.
- Never include sensitive business or personal data in the SignalR payload.
- Keep ReceiveNotification separate from ReceiveEntityChanged.
- Do not display notification behavior from the generic cache-invalidation event.
- Target the narrowest valid SignalR audience:
  - Permission group for shared reference data
  - Tenant/company/permission group for company-owned data
  - Tenant/company/user group for personal data
- Never use Clients.All.
- Never accept tenant, company, user, or permission group names from the client.

Failure behavior:

- A failed SaveChangesAsync() must never enqueue a background job.
- A failed notification or SignalR job must not roll back or change the already saved
  business operation.
- Because notifications and realtime refresh are non-critical, an enqueue failure
  after a successful SaveChangesAsync() must be logged clearly and must not make the
  API report that the saved CRUD operation failed.
- The frontend must recover missed realtime events by refetching active data after
  reconnecting.

Remove the old Outbox infrastructure after every producer has been migrated:

- Outbox entities and DTOs
- DbSet and EF entity configuration
- SaveChanges interceptors used only by Outbox
- Outbox writers and publishers
- Dispatchers and hosted polling services
- Leasing and lock-management code
- Recovery, retry, and cleanup services implemented specifically for Outbox
- Dead-letter infrastructure used only by Outbox
- Dependency Injection registrations
- Configuration sections and options
- Scheduled jobs used only to dispatch or recover Outbox messages
- Unused packages, tests, and documentation

Database and migration safety:

- Do not edit or delete migrations that may already be applied to a shared, staging,
  or production database.
- Check for pending Outbox records before removing its table.
- For an existing database, create a new migration that safely drops the Outbox table,
  indexes, and related objects after pending records are handled.
- If this is development-only and the database can be recreated, follow the project's
  existing migration-reset process instead of creating unnecessary compatibility
  migrations.
- Do not delete unrelated migrations or application data.

Preserve existing behavior:

- Do not change public API contracts or routes.
- Do not change authorization, tenant isolation, or company isolation.
- Do not change notification localization keys or action URLs unless they are broken.
- Do not change frontend UI or design.
- Do not remove existing typed SignalR events until all current clients no longer use
  them. The generic ReceiveEntityChanged event may run alongside them during migration.
- Keep feature-specific business logic inside each feature.

Add or update tests covering:

- No job is enqueued when SaveChangesAsync() fails.
- A job is enqueued only after SaveChangesAsync() succeeds.
- Every migrated job has the expected Hangfire retry policy.
- Notification retries are deduplicated by OperationId.
- SignalR audiences respect permission, tenant, company, and user boundaries.
- No entity update uses Clients.All.
- Realtime payloads contain no sensitive entity data.
- The application contains no remaining runtime references to the removed Outbox
  infrastructure.

Verification:

- Build the complete solution.
- Run all automated tests.
- Search the repository for remaining Outbox types, registrations, configuration,
  table references, dispatchers, and polling services.
- Review the final migration before applying it.
- Do not stop with partially migrated features or both active delivery paths, because
  that can send duplicate notifications and SignalR events.

At the end, report:

- All migrated features.
- All removed Outbox components.
- How enqueue failures are handled.
- How notification deduplication is preserved.
- How tenant/company/permission targeting is preserved.
- The database migration strategy used.
- Build and test results.
- Any remaining Outbox usage and why it was retained.
```
