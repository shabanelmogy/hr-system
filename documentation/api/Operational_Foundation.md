# Operational Foundation

The API operational baseline is intentionally small and uses the infrastructure already required by the application.

## Logging and correlation

Serilog writes structured events to the console and rolling JSON files under `Logs/`. Files are retained for 30 days. The SQL sink is restricted to error events to avoid turning request logging into an unbounded operational table.

Every HTTP request has an `X-Correlation-ID`. A valid client value is preserved; otherwise the API creates one. The value is returned in the response, added to the Serilog context, and included in validation, concurrency, and unhandled-error Problem Details.

Authentication runs before the user log context is created. Request events can therefore include `UserId` and `UserName` for authenticated requests without logging tokens or credentials.

## Background work

Hangfire is the only background-processing mechanism. Do not add an `IHostedService` or polling worker for persisted application work that Hangfire already supports.

- Enqueue non-critical notifications and realtime updates only after a successful database save.
- Jobs must be safe to retry because Hangfire provides at-least-once execution.
- Pass tenant, company, actor, and operation identifiers in job requests.
- Establish `ICurrentActorScope` before a job accesses tenant/company-filtered data.
- Use recurring Hangfire jobs only when cleanup or scheduled business behavior is introduced.

## Health endpoints

- `/health/live` confirms that the API process can serve requests. It does not call dependencies.
- `/health/ready` checks SQL Server and that a Hangfire server is available. It returns the minimal health-check response and allows anonymous infrastructure probes.
- `/health` preserves the authenticated detailed response used by the application health page.

External websites are not health dependencies. A Google or public-internet failure must not mark the HR system unhealthy.

## Startup database work

`DatabaseSettings` controls startup behavior:

```json
{
  "DatabaseSettings": {
    "ApplyMigrationsOnStartup": false,
    "SeedOnStartup": false
  }
}
```

Both settings are enabled in local Development. Hosted environments default to disabled so multiple API instances do not race while applying migrations or seeds. Apply production migrations as a deployment step, or explicitly opt in for a controlled single-instance deployment.

## Configuration validation

JWT, Hangfire, CORS, mail, frontend URL, and database connection settings are validated during startup. Hosted configuration must provide valid values before the API begins serving requests. Development secrets may remain in development-only configuration, but production secrets belong in environment variables or a secret store.

OpenTelemetry, a message broker, distributed cache, persistent Data Protection storage, and gateway-specific configuration can be introduced when the deployment topology requires them. They are not prerequisites for building the domain.
