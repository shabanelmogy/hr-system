# Error logs — Research

- ASP.NET Core 10 handled exception diagnostics default suppression means capture
  cannot rely solely on middleware diagnostics. Current HostGlobalExceptionHandler
  explicitly logs unexpected exceptions; preserve one deliberate capture boundary.
  https://learn.microsoft.com/aspnet/core/breaking-changes/10/exception-handler-diagnostics-suppressed?view=aspnetcore-10.0
- Hangfire captures job failures and retries; distinguish per-attempt failure from
  final failed state and avoid duplicating one incident at multiple boundaries.
  https://docs.hangfire.io/en/latest/background-processing/dealing-with-exceptions.html
  https://docs.hangfire.io/en/latest/extensibility/using-job-filters.html
- Metadata must be allowlisted/redacted; screenshots do not authorize payload logging.
  https://learn.microsoft.com/en-us/aspnet/core/fundamentals/http-logging/

These support design investigation only; no new runtime capture is implemented yet.
