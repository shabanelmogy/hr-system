# API configuration

`appsettings.json` and `appsettings.Development.json` are local runtime files in
this workspace and are intentionally ignored by Git because they may contain
database credentials, JWT signing material, SMTP passwords, bootstrap-user
passwords, or integration secrets.

Use `appsettings.example.json` as the safe configuration template. For deployed
environments, prefer the ASP.NET Core environment-variable convention, for
example:

```text
ConnectionStrings__DefaultConnection
ConnectionStrings__HR
ConnectionStrings__Platform
ConnectionStrings__Accounting
ConnectionStrings__Contacts
ConnectionStrings__HangfireConnection
ConnectionStrings__HR
ConnectionStrings__Accounting
ConnectionStrings__Platform
ConnectionStrings__Contacts
JwtOptions__Key
MailSettings__Password
CrystalReports__InspectorApiKey
AttendanceConnector__InternalApiKey
ExternalLogin__Google__ClientSecret
BootstrapUsers__SuperAdmin__Password
```

Each module resolves its own connection key first and falls back to
`ConnectionStrings__DefaultConnection`, so separate databases can be introduced
without changing module code.

Contacts durable integration-event dispatch is configurable under
`Modules__Contacts__Messaging__Outbox__*`. Supported values are `BatchSize`,
`MaxAttempts`, `PollInterval`, `ProcessingTimeout`, `BaseRetryDelay`, and
`MaxRetryDelay`. Time values use .NET `TimeSpan` syntax (for example
`00:00:05`). Defaults are safe for development when the section is omitted.

Do not commit real values for these settings. Existing local runtime files are
left untouched so current login and development behavior are preserved while the
architecture is migrated.
