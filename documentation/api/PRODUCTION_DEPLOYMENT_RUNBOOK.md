# API Production Deployment Runbook

This runbook defines the supported release sequence for the modular ERP API.
The hosting platform may wrap these commands, but it must preserve the order and
the health gates below.

## Release inputs

- Use a commit that passed `.github/workflows/api-ci.yml` and the relevant
  client workflow (`.github/workflows/web-ci.yml` or
  `.github/workflows/mobile-ci.yml`) before releasing that client.
- Retain the commit-scoped NuGet vulnerability report and validated SPDX SBOM
  with the release evidence.
- Use the uploaded `erpsystem-api-<commit>` publish artifact or build the
  production image from `api/ErpSystem.Api/Dockerfile` with `api/` as its build
  context.
- Resolve database, JWT, SMTP, Hangfire, bootstrap, and connector secrets from
  the deployment secret store. Do not place live values in an image or tracked
  settings file.
- The web production-build CI job uses `https://api.ci.invalid/api/v1` only to
  satisfy Next.js rewrite configuration; it is not a deployment endpoint.
  Configure the real backend URL in the hosting environment.
- Keep `DatabaseSettings__ApplyMigrationsOnStartup=false` and
  `DatabaseSettings__SeedOnStartup=false` in hosted environments.
- Provide `ConnectionStrings__DefaultConnection`, or provide every installed
  module's `ConnectionStrings__<ModuleName>` override when modules use separate
  databases.
- When telemetry export is required, set `OpenTelemetry__Enabled=true`, a valid
  `OpenTelemetry__OtlpEndpoint`, `OpenTelemetry__OtlpProtocol` (`grpc` or
  `http/protobuf`), and an approved sampling ratio from `0` through `1`. Supply
  collector credentials through secret-backed `OTEL_EXPORTER_OTLP_HEADERS`.
- When TLS terminates at a reverse proxy, set `ForwardedHeaders__Enabled=true`,
  keep `RequireHeaderSymmetry=true`, choose the real proxy-chain `ForwardLimit`,
  and enumerate exact proxy addresses/networks through `KnownProxies` and
  `KnownNetworks`. Never use `0.0.0.0/0`, `::/0`, or the global
  `ASPNETCORE_FORWARDEDHEADERS_ENABLED` shortcut because those configurations
  can trust unlisted forwarders.
- Keep `DistributedRuntime__ReplicaCount=1` for a single API process. Before
  scaling out, enable `DistributedRuntime`, supply `ConnectionStrings__Redis`
  from the secret store, assign deployment-specific cache/SignalR prefixes, and
  set the replica count to the real maximum. Set the external-rate-limit,
  shared-file-storage, and session-affinity assertions to true only after those
  facilities exist in the deployment. Startup rejects an incomplete scale-out
  contract.
- Configure `DataProtection__KeyRingDirectory` as an absolute persistent volume,
  provide the current PFX path/password, and set
  `DataProtection__SharedKeyRing=true` for more than one replica. During
  certificate rotation, deploy the new certificate as
  `ProtectionCertificatePath` and retain the previous PFX entries under
  `DataProtection__PreviousProtectionCertificates__0__Path` and
  `DataProtection__PreviousProtectionCertificates__0__Password`
  (add one entry per still-needed old certificate). Restart all replicas and run
  a protect/unprotect smoke check before removing any old key or certificate.

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
- From the real proxy, confirm HTTPS scheme and the expected client IP reach the
  API. Send a controlled direct request with spoofed `X-Forwarded-For` and
  `X-Forwarded-Proto` headers and confirm the transport IP/scheme remain in use.
- When distributed runtime is enabled, confirm `distributed-runtime:redis` is
  healthy, cache entries are visible across two replicas, and a SignalR event
  published by either replica reaches clients connected to both. Confirm load
  balancer session affinity and gateway-wide rate limits, then verify an uploaded
  file can be read after the next request is routed to another replica.
- Record the deployed commit/image digest and the migration execution result.
- Attach the NuGet audit report, SPDX SBOM, and SBOM validation result to the
  deployment record.
- Set `FileSecurity:MalwareScanningEnabled=true` in production and provide a
  valid `FileSecurity:ScannerHost` and `FileSecurity:ScannerPort` for a trusted
  ClamAV sidecar/private service. Verify the `file-security:clamav` readiness
  check is healthy and exercise a clean upload plus a controlled test signature.
  Scanner failures are fail-closed; do not expose the scanner response or upload
  name in logs or API problem details.

Approval gates, environment promotion rules, collector retention, dashboards,
SLOs, alert routing, backup schedules, restore drills, RPO/RTO, and
registry/image-signing policy remain owned by the
selected hosting environment and must be completed before an external
production launch.
