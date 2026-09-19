# Web Next Performance Baseline

The production bundle is measured from the generated `.next/static/chunks`
directory with:

```powershell
npm.cmd run build
npm.cmd run measure:build
```

`measure:build` records total generated JavaScript, chunk count, App Router
manifest entries, the largest JavaScript chunks, and the route-level uncompressed
First Load JavaScript reported by Next.js diagnostics. The aggregate chunk size
is not a page-download number: it includes lazy chunks that are only requested
when a feature needs them.

## Current Phase 11 baseline

Recorded from the production build on 2026-09-18 after the Phase 10 dependency
work and the completed cross-route runtime hardening:

| Metric | Result |
| --- | ---: |
| App-path manifest entries | 71 |
| Routes with First Load diagnostics | 60 |
| Generated JavaScript chunks | 270 |
| Aggregate generated JavaScript | 24.39 MiB |
| Largest emitted JavaScript chunk | 11.06 MiB |
| Protected routes included in shared-intersection measurement | 52 |
| Protected shared First Load intersection | 26 chunks / 1.60 MiB |
| `/` First Load JS | 2.00 MiB |
| `/login` First Load JS | 1.14 MiB |
| `/register` First Load JS | 1.94 MiB |
| `/finance/fiscal-years` First Load JS | 2.23 MiB |
| `/administration/users` First Load JS | 2.19 MiB |
| `/profile` First Load JS | 2.10 MiB |
| `/recruitment` First Load JS | 2.25 MiB |
| `/files/view/[...fileParams]` First Load JS | 2.03 MiB |
| `/appointments` First Load JS | 2.33 MiB |

`/appointments` is the largest measured route in the current build at `2.33 MiB`.
The aggregate emitted-JavaScript number is intentionally not interpreted as a
page download: code splitting can increase the number of emitted chunks while
reducing the amount a single route needs on first load.

### Route-class budgets

`measure:build` now classifies every measured App Router page and enforces a
baseline-derived budget for that route class in CI. These limits deliberately
leave modest growth headroom without returning to the old single `4.5 MiB`
ceiling as the only first-load protection.

| Route class | Current maximum | Budget | Representative route |
| --- | ---: | ---: | --- |
| Error fallback | 0.84 MiB | 1.10 MiB | `/_not-found` |
| Public auth | 1.94 MiB | 2.15 MiB | `/register` |
| Protected shell/launcher | 2.04 MiB | 2.25 MiB | `/workforce-planning` |
| Business application | 2.28 MiB | 2.55 MiB | `/super-admin/tenant-admins` |
| Heavy feature entry | 2.33 MiB | 2.75 MiB | `/appointments` |

The protected shared First Load intersection has its own `1.85 MiB` budget; the
current value is `1.60 MiB`. The existing global safeguards remain in place as
backstops: `26 MiB` aggregate emitted JavaScript, `12 MiB` largest emitted chunk,
and `4.5 MiB` absolute maximum for any measured first-load route.

All defaults may be overridden deliberately through the corresponding
`WEB_BUNDLE_MAX_*_BYTES` environment variables in `measure-build.mjs` and
`performance-budget-policy.mjs`. Raising a budget requires an explicit product or
architecture reason and an updated baseline in the same change.

### Route-class definitions

- **Public auth:** login, registration, recovery, confirmation and invitation flows.
- **Protected shell/launcher:** root/module launcher and shell-level entry routes.
- **Business application:** ordinary ERP CRUD/management routes.
- **Heavy feature entry:** calendar, Recruitment/Kanban, Crystal Reports and the
  media viewer entry, where a separate client runtime is expected.
- **Error fallback:** the minimal App Router not-found surface.

Unknown future measured pages default to the business-application class rather
than escaping the budget system. When a new route genuinely belongs to another
class, update the policy and its focused test together.

### Heavy viewer isolation

Before the viewer-isolation optimization, `/files/view/[...fileParams]` had approximately
9.79 MiB of First Load JavaScript because `MediaContent` statically imported all
viewer implementations. The PDF/Syncfusion viewer alone contributed a multi-MiB
chunk even when the selected file was an image, audio file, or plain text.

All media viewers are now dynamically loaded by selected media type. The same
route now measures **2.03 MiB First Load JS**. The heavy
ActiveReports and Syncfusion chunks remain in the aggregate production output,
but are fetched only when their corresponding report/viewer capability is used.

Current structural performance safeguards:

- notifications, realtime bridges, global search and React Query devtools remain dynamically loaded;
- Syncfusion licensing and pull-to-refresh are loaded after client mount;
- module translation namespaces are lazy-loaded only for the active module;
- PDF, Excel, Word, image, audio, video and text viewers are split by media type;
- route groups for Apps, Workforce Planning, Recruitment and Attendance Devices have local loading/error boundaries;
- company switching cancels in-flight Query and Axios work before rotating the work context.

Request-count measurement requires a running API and authenticated browser journey.
It must be recorded in an integration/E2E environment rather than inferred from
source code. The frontend architecture avoids adding duplicate module-catalog
requests by sharing the existing TanStack Query key and cache.

LCP, INP, client-navigation latency and company/module-switch timing are runtime
experience metrics rather than deterministic production-build artifacts. They
should be observed in authenticated browser/production telemetry and investigated
when evidence shows a regression; they are not converted into machine-specific CI
timing thresholds that would be dominated by runner variance. PPR/Instant
Navigation behavior remains covered by the browser E2E suite, while bundle and
shared-runtime regressions are enforced deterministically by `measure:build`.
