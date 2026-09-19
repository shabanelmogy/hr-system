# HR web documentation

HR has active Next.js surfaces for organizational structure, Recruitment,
Workforce Planning, and Attendance Devices under `web-next/src/modules/hr`.
Detailed behavior remains in the established `documentation/web-next/` feature
books; this package owns the HR index and module-specific decisions without
copying shared Next.js rules.

For each HR feature, verify route ownership, server/client boundaries,
permissions, loading/error/empty states, localization, and tests. A link in the
catalog does not imply that an additional web surface exists. The generated
current ownership/route inventory is maintained in
`documentation/web-next/architecture/frontend-architecture-manifest.md`.
