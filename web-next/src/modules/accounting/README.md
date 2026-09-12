# Accounting frontend module

Folder slug: `accounting`. Backend/catalog code: `acc`.

The frontend boundary exists and is registered, but the current Accounting API
does not expose a business submodule or Chart of Accounts CRUD contract yet.
Do not add speculative routes, permissions, or API calls here. When Accounting
publishes a server-backed submodule, add its frontend metadata to
`moduleDefinition.tsx`, keep the App Router adapter thin, and coordinate shared
contract changes with the mobile application.

The module generator supports this split explicitly:

```powershell
npm.cmd run generate:module -- --slug accounting --code acc --name "Accounting"
```

Use `--dry-run` when reviewing a new module shape before creating files.
