# HR web documentation

HR has active Next.js surfaces for organizational structure, Recruitment,
Workforce Planning, and Attendance Devices under `web-next/src/modules/hr`.
Each feature's `-web.md` book (under `../features/<feature>/`) records its
detailed behavior; shared Next.js rules stay in `documentation/guides/web/`.

For each HR feature, verify route ownership, server/client boundaries,
permissions, loading/error/empty states, localization, and tests. A link in the
catalog does not imply that an additional web surface exists. The generated
current ownership/route inventory is maintained in
`documentation/guides/web/architecture/frontend-architecture-manifest.md`.
