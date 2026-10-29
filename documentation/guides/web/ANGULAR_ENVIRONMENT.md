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
