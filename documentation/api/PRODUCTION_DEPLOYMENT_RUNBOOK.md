# API Production Deployment Runbook

This runbook defines the supported release sequence for the modular ERP API.
The hosting platform may wrap these commands, but it must preserve the order and
the health gates below.

## Release inputs

- Use the commit that passed `.github/workflows/api-ci.yml`.
- Retain the commit-scoped NuGet vulnerability report and validated SPDX SBOM
  with the release evidence.
- Use the uploaded `erpsystem-api-<commit>` publish artifact or build the
  production image from `api/ErpSystem.Api/Dockerfile` with `api/` as its build
  context.
- Resolve database, JWT, SMTP, Hangfire, bootstrap, and connector secrets from
  the deployment secret store. Do not place live values in an image or tracked
  settings file.
- Keep `DatabaseSettings__ApplyMigrationsOnStartup=false` and
  `DatabaseSettings__SeedOnStartup=false` in hosted environments.
- Provide `ConnectionStrings__DefaultConnection`, or provide every installed
  module's `ConnectionStrings__<ModuleName>` override when modules use separate
  databases.
- When telemetry export is required, set `OpenTelemetry__Enabled=true`, a valid
  `OpenTelemetry__OtlpEndpoint`, `OpenTelemetry__OtlpProtocol` (`grpc` or
  `http/protobuf`), and an approved sampling ratio from `0` through `1`. Supply
  collector credentials through secret-backed `OTEL_EXPORTER_OTLP_HEADERS`.

## Pre-deployment gate

1. Confirm the target commit completed the API test, EF model-drift, NuGet
   vulnerability audit, validated SBOM, release publish, secret-scan, and
   container-build jobs.
2. Confirm a recoverable database backup exists according to the environment's
   retention policy. A backup is not considered proven until the environment
   owner has completed a restore drill.
3. From a trusted release runner with the .NET 10 SDK, inspect the module order:

   ```powershell
   Set-Location api
   ./scripts/Apply-ErpModuleMigrations.ps1 -Configuration Release -WhatIf
   ```

4. Apply module-owned migrations using secret-store environment variables:

   ```powershell
   $env:ConnectionStrings__DefaultConnection = '<secret-store-value>'
   ./scripts/Apply-ErpModuleMigrations.ps1 -Configuration Release
   ```

   The script discovers installed modules from the explicit registry and applies
   each module's migration chain in dependency order. Do not pass connection
   strings on the command line.

## Application rollout

1. Deploy the immutable publish artifact or image. The container listens on
   port `8080` and runs as the non-root .NET image user.
2. Route platform liveness probes to `GET /health/live`.
3. Route readiness probes to `GET /health/ready`. Keep the new instance out of
   service until readiness succeeds. Readiness covers module databases,
   migration compatibility, Hangfire, and the Contacts durable outbox. Healthy
   returns HTTP `200`; degraded and unhealthy states return HTTP `503`.
4. After readiness succeeds, send a small authenticated smoke request through
   the normal gateway and verify its `X-Correlation-ID` in the response and
   structured logs.
5. Watch HTTP 5xx rate, request latency, Hangfire availability, database health,
   and `contacts-outbox` readiness during the rollout. A degraded Contacts
   outbox means dead rows exceed `MaxDeadRows` or the oldest due/recoverable
   message exceeds `MaxDueBacklogAge`; investigate before increasing traffic.

## Rollback and forward fix

- Stop the rollout when readiness fails or the smoke request regresses.
- Roll application instances back to the last known-good image only when the
  applied schema remains backward compatible with that version.
- Do not run destructive down-migrations against production data. If a schema
  change is not backward compatible, keep traffic on the safe version and ship
  an additive forward fix.
- Restore a database only under the environment's disaster-recovery procedure,
  after recording the recovery point and accepted data-loss window.
- Preserve correlation IDs, deployment commit, migration output, and operator
  decisions in the deployment record.

## Post-deployment checks

- Confirm `/health/live` and `/health/ready` remain successful after traffic is
  enabled.
- Confirm all installed module migration histories show no pending migration.
- Confirm no unexpected Contacts outbox dead rows or overdue backlog exists.
- Confirm background workers and Hangfire servers are active.
- When OpenTelemetry is enabled, confirm the collector receives an API server
  span, a CQRS child span, HTTP/runtime metrics, and the expected service resource
  attributes. Confirm health probes do not create request spans.
- Record the deployed commit/image digest and the migration execution result.
- Attach the NuGet audit report, SPDX SBOM, and SBOM validation result to the
  deployment record.

Approval gates, environment promotion rules, collector retention, dashboards,
SLOs, alert routing, backup schedules, restore drills, RPO/RTO, and
registry/image-signing policy remain owned by the
selected hosting environment and must be completed before an external
production launch.
