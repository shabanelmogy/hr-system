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

## Baseline after the modular migration

Recorded from the production build on 2026-09-10:

| Metric | Result |
| --- | ---: |
| App-path manifest entries | 80 |
| Routes with First Load diagnostics | 71 |
| Generated JavaScript chunks | 145 |
| Aggregate generated JavaScript | 23.35 MiB |
| `/` First Load JS | 3.75 MiB |
| `/apps` First Load JS | 3.75 MiB |
| `/finance/fiscal-years` First Load JS | 3.76 MiB |
| `/administration/crystal-reports` First Load JS | 3.76 MiB |
| `/login` First Load JS | 1.68 MiB |
| `/register` First Load JS | 2.04 MiB |

The largest measured First Load route is currently `/appointments` at 4.01 MiB.
The next largest group is approximately 3.8-3.9 MiB and includes the geographic
management and Recruitment screens.

### Heavy viewer isolation

Before phase-7 optimization, `/files/view/[...fileParams]` had approximately
9.79 MiB of First Load JavaScript because `MediaContent` statically imported all
viewer implementations. The PDF/Syncfusion viewer alone contributed a multi-MiB
chunk even when the selected file was an image, audio file, or plain text.

All media viewers are now dynamically loaded by selected media type. The same
route measures **3.75 MiB First Load JS**, a reduction of roughly 62%. The heavy
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
