# Shared Grid current-source verification — bounded progress

2026-10-30. Source fingerprint `956e93b97bee886ccf040e712baa51dffd24d450a9ff151cc5d804d8812ca4c7` covers the
adapter, shared header/actions/fields, harness and catalog revision; the executable
driver lists exact fingerprint inputs. All40 cases use this same fingerprint.

- Angular complete `npm run check`: 60 files / 345 tests,4 configuration tests,
  10 architecture tests, tokens/fonts/catalog, application/spec types and build.
- Initial bundle:489.89kB; estimated transfer127.89kB. No initial-budget warning.
- `node scripts/verify-grid-capabilities-browser.mjs --full`:40 visual cases,
  5 palettes × light/dark × EN/AR ×390/1440;8 green cases additionally execute all
  current implemented flows. GRID_BROWSER_RESULTS records `interactions` explicitly.
- Native AND/OR Apply/Clear, numeric/date/Boolean true and false, calendar popup,
  multi-sort, selection modes/Shift-click/Shift-arrow, frozen body containment,
  current-row context actions, expandable groups, nested column headers, projected
  header/footer, CSV, pinning, presentation capture and scope replacement pass.
- `node scripts/verify-collection-browser.mjs --focused`:8 current shared Grid/
  CardList caller regression cases. Neutral fixtures, no business API requests.
- Bootstrap reloads, if any, are recorded before stable ready/fonts baseline;
  any subsequent reload, runtime fingerprint change, page error, native dialog or
  business API request fails acceptance. The dedicated preview disables prebundle.

These are executed subset checks, not complete S1-A14 acceptance or exact Countries
pixel parity. CAPABILITY_MATRIX and RUNTIME_STATUS remain authoritative. Virtual
ranges/local custom matches/editors/row reorder and actual-source screen comparison
are still Required. Countries corrected Data/sidebar/header/API/host journey is
separate queued S3-A2. Phase06 remains **Not Verified**.

The first full run exposed pre-existing English assumptions in PDF/calendar tests.
The installed Angular Vitest project defaults to isolate:false; tests now establish
their own language baseline, and GridLocale teardown restores its language.
The complete current gate passes; no production localization rule was weakened.

References: [PrimeNG Table](https://primeng.dev/table),
[PrimeNG Select](https://primeng.dev/select), installed22.1.4 sources,
[Angular service testing](https://angular.dev/guide/testing/services),
[Vitest isolation](https://vitest.dev/guide/features.html#threads), and
[Vite dependency startup](https://vite.dev/guide/dep-pre-bundling).
