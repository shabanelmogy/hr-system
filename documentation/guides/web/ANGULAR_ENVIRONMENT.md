# Angular API environment

The tracked `web-angular/.env` contains public API addresses only. The default is
the existing hosted test API. All URLs are HTTPS origins without `/api`, paths,
queries or credentials; services append their own API paths.

```dotenv
ERP_API_TARGET=host
ERP_API_LOCAL_URL=https://localhost:7037
ERP_API_HOST_URL=https://shabanhrms.runasp.net
```

Set `ERP_API_TARGET=local` or `host`, then restart the dev server. Commands from
the repository root:

| Command | API selection |
| --- | --- |
| `npm --prefix web-angular start` | Current `.env` selection |
| `npm --prefix web-angular run start:local` | Local API for this run |
| `npm --prefix web-angular run start:host` | Hosted test API for this run |
| `npm --prefix web-angular run build` | Current `.env` selection |
| `npm --prefix web-angular run build:local` | Production build targeting local API |
| `npm --prefix web-angular run build:host` | Production build targeting hosted API |

Build mode and API selection are independent. `npm run watch`, `npm test` and the
`npm run ng -- ...` wrapper also configure the API input. Direct `npx ng` bypasses
that preparation; use the npm commands. The URL is baked into the build; changing
`.env` does not reconfigure an already deployed bundle. Rebuild/redeploy it.

Precedence, lowest to highest: tracked `.env`, ignored `.env.local`, process
environment, explicit `--api-target=local|host` on the npm command. `.env.local`
may contain private device overrides and the existing PrimeUI license; those
values are not copied wholesale into the client. Only the selected public origin
is written to ignored `src/config/api.generated.ts`, consumed by ERP_API_ORIGIN.
No added dependency, browser credential storage or BFF is involved.

`start` continues using trusted local HTTPS on port4210. Selecting a hosted API
does not change that frontend origin or configure the server's allowlist,
forwarded HTTPS, CSRF or Cookie policy. Hosted acceptance remains PROD-017/019;
the previously recorded BrowserOriginDenied is not fixed by selecting its URL.
The API-side repair now prepares exact4210 in both browser/CORS allowlists and
explicit `BrowserAuthentication:UseCrossSiteCookies=true` for split-site testing.
It must be published with its API binary; remote HTTPS and actual browser Cookie
acceptance are still separate. See the
[API repair record](../../modules/platform/features/platform-browser-authentication/verification/HOSTED_CONFIGURATION_REPAIR.md).
Existing `verify:fiscal-live` is a local API/SQL acceptance script and is not a
hosted-data test; its origins remain explicitly local.

Validation: `npm --prefix web-angular run test:config` covers target selection,
URL validation, precedence, normalized origins and exclusion of other environment
values. HTTP unit tests supply their own API origin, independent of the developer
selection. `npm --prefix web-angular run check` includes configuration tests.

Maintenance verification on2026-10-29: full Angular `check` passed4 configuration
tests,7 architecture cases,24 files/99 unit tests, strict types/templates,
tokens/fonts/catalog and hosted-target production build (432.52 kB initial).
`build:local -- --output-path dist/api-local-check` also passed; each output's
JavaScript was checked for its selected API origin. The generated source was
then restored to the default host selection. No live hosted login or deployment
was performed by this maintenance change. `.env` was explicitly added to the Git
index at the requester's instruction; no commit/push was made.

Angular's [environment documentation](https://angular.dev/tools/cli/environments)
describes environment values as client bundle inputs. This repository uses a
small Node preparation script to read `.env` and emit that typed input, following
the existing generated-license preparation pattern instead of adding a builder.

## Development-server diagnostics — 2026-11-05

After component moves or extraction, compare any compiler error with the current
file before editing it again. A long-running server on port4210 was observed
sending a stale Vite error overlay for `closeGuard.requestClose()` even though the
file already contained `closeGuard().requestClose()` and a fresh production build
passed. Restarting that server restored the current compilation. Chrome then
returned HTTP200 for Login, without a Vite error overlay, compilation messages or
page errors. This is a verified recovery for that session, not a rule to ignore
new compilation failures. `viewChild.required()` returns a signal; read it before
calling the component method. The Reporting public-API import resolves to the
existing `global-template-manager/pages/global-template-manager/global-template-manager.ts`.

With HTTPS enabled, Node may print
`UnsupportedWarning: Status message is not supported by HTTP/2 (RFC7540 8.1.2.4)`.
A temporary server using Node24.18.1, Angular CLI22.2.5 and Vite8.3.5 reproduced
this warning with `--trace-warnings`: Vite's final response handler writes
`res.statusMessage` for a missing JSON path. HTTP/2 still delivered the expected
404 response; requesting `/` with `Accept: text/html` returned200 over HTTP/2.
Node ignores the unsupported text status message, as described in its
[HTTP/2 compatibility API](https://nodejs.org/api/http2.html#responsestatusmessage).
The warning alone does not require an application-code change. Inspect any
associated failed request independently; the original request that triggered a
user-reported warning cannot be identified from the warning text alone.

To capture the source for one run from `web-angular/` in PowerShell:

```powershell
$previousNodeOptions = $env:NODE_OPTIONS
try {
    $env:NODE_OPTIONS = ((@($previousNodeOptions, '--trace-warnings') | Where-Object { $_ }) -join ' ')
    npm start
}
finally {
    $env:NODE_OPTIONS = $previousNodeOptions
}
```

Stop that diagnostic run with Ctrl+C. Do not suppress all Node warnings, patch
`node_modules`, disable HTTPS or upgrade dependencies solely for this warning.
The temporary diagnostic server used for the recorded reproduction was stopped;
other development-server sessions were left with their owner.
