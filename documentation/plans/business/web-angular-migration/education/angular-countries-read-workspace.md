# Countries read preview — verified technical guide

Phase06 Verified2026-10-30 precedes this Phase07 guide. Run Angular start:host,
sign in with super_admin plus Countries:View, then visit /dev/countries. This is
an authenticated development preview, excluded from production route registration.

Choose Grid or Cards. Both use one server page and keep the same criteria. Search
allows200characters and applies trimmed text after300ms; field/operator/status,
sort and page size update server criteria. Use shared Grid options for columns
and density; shared footer supports page and record navigation. Language changes
redraw existing rows without another business read. View loads actual detail
into six read-only fields; Close cancels pending detail. There is no Save here.

Empty/error states remain in the panel. Retry is available for recoverable reads;
403 blocks further reads until session identity is revalidated. Losing the role
or permission removes old rows and detail. Existing SQL-backed translation
overrides and strict catalog matching remain unchanged; PROD-019 owns host publish.

Acceptance: npm --prefix web-angular run check; then isolated HTTPS4220 with
node web-angular/scripts/verify-countries-browser.mjs and --focused. Both intercept
synthetic host GETs. Source comparison and final portable evidence are under the
feature verification/. Do not change runtime during acceptance. Compact Chrome
does not establish physical mobile/native acceptance. Other views/actions remain
Required in S3-A3..A8; ActiveReports remains Excluded DEC-028.

Current correction guide after Phase06 verification: enter Dashboard → Data →
sidebar Geography → Countries. Grid options is a shared modal; status remains in
the toolbar. Native filters support bounded AND/OR rules; the hosted query endpoint
requires matching publication under PROD-019. One native record navigator is
centered; size/pages metadata is at the logical edge. Record arrows work on a
single page and cross server pages automatically. Stable focus checks do not reload
the collection. Create/Edit/lifecycle and remaining Views belong to later required
children; this read guide never claims them.
