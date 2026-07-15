# HR Management System

This repository contains the ASP.NET Core API and the supported Next.js frontend for the HR Management System.

## Application Ownership

| Application | Status | Purpose |
| --- | --- | --- |
| `api/HrManagementSystem/` | Active | Backend API |
| `web-next/` | Canonical | Supported frontend and deployment target |
| `web/` | Legacy | Temporary migration/reference copy; scheduled for removal |

All new frontend features, fixes, tests, configuration, and documentation must target `web-next/`.

Do not add product changes to `web/`. It may be changed only when work is required to migrate remaining behavior to `web-next/` or remove the legacy application. Before deleting it, verify that any still-required behavior and assets have been migrated.

## Main Projects

- Backend: `api/HrManagementSystem/`
- Frontend: `web-next/`
- Shared project documentation: `Docs/`

