# Authentication configuration

Authentication and infrastructure secrets must be supplied through environment variables in hosted environments or .NET user secrets locally. They must not be committed to `appsettings*.json`.

## Local setup

In `Development`, the API uses a development-only JWT key if `JwtOptions:Key` is not configured. This avoids committing a real signing key while still allowing local startup. Production and non-development environments still require a real `JwtOptions:Key`.

`appsettings.Development.json` points to SQL LocalDB by default. If LocalDB is not available on your machine, override the connection strings with user secrets.

Run these commands from the `api/HrManagementSystem` directory, replacing each placeholder with a newly rotated value:

```powershell
dotnet user-secrets set "JwtOptions:Key" "<at-least-32-random-characters>"
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "<sql-connection-string>"
dotnet user-secrets set "ConnectionStrings:HangfireConnection" "<hangfire-connection-string>"
dotnet user-secrets set "MailSettings:Mail" "<smtp-account>"
dotnet user-secrets set "MailSettings:Password" "<smtp-password>"
dotnet user-secrets set "HangfireSettings:Username" "<dashboard-user>"
dotnet user-secrets set "HangfireSettings:Password" "<dashboard-password>"
dotnet user-secrets set "ExternalLogin:Google:ClientId" "<google-client-id>"
dotnet user-secrets set "Syncfusion:LicenseKey" "<syncfusion-license>"
```

Bootstrap accounts are optional. To create an initial administrator on an empty database, configure `BootstrapUsers:Admin:UserName`, `Email`, `FirstName`, `LastName`, and `Password` through user secrets or environment variables. No default account or password is created when those values are absent.

Hosted environment variable names use double underscores, for example `JwtOptions__Key` and `ConnectionStrings__DefaultConnection`.

All secrets that previously existed in repository history must be rotated. Removing them from the current files does not invalidate exposed historical values.
