# Angular Clean Code policy

Requester-approved on 2026-10-31. Applies to `web-angular`, including shared UI,
business features, shell/platform, development fixtures and component test hosts.
This is a mandatory implementation and review policy.

## Component resources

Give every application component a folder matching its file name. Keep its
resources and tests inside that folder, within its feature or shared owner:

```text
countries/components/
  country-editor/
    country-editor.ts       component state, typed bindings and callbacks
    country-editor.html     Angular template and shared component composition
    country-editor.spec.ts  behavior verification, when present
shared/ui/buttons/
  action-button/
    action-button.ts
    action-button.html
    action-button.scss      component-only presentation, when needed
    action-button.spec.ts
  public-api.ts            curated exports for the owning shared boundary
```

Use `templateUrl` and `styleUrl`/`styleUrls`. Do not put `template` or `styles` in
`@Component`, even for a short or empty template. A component without its own
styles needs no empty SCSS file. Existing reusable styles can remain separate
entries in `styleUrls`; keep their cascade order. Related test hosts sharing a TS
file use distinct `<spec-name>.<host-name>.html` files to avoid collisions.
TestBed metadata overrides and strings that are actual test inputs are not
application component definitions.

The root App already lives in its matching `src/app/` directory. Test-only hosts
stay with the tested owner; small related fixture components may share the test
file. Types, services and pure utilities do not need a folder per file. Shared
Sass partials remain with their owner and can be referenced from several component
folders. Do not copy those partials or create another public barrel in every
component folder. Path moves preserve the established curated public API and lazy
route boundaries.

Keep TypeScript module imports extensionless according to the existing compiler
configuration, including dotted names such as `collection.types`. Update import
type expressions and dynamic imports as well as ordinary imports when moving
files; do not loosen compiler options to hide unresolved paths. See the official
[TypeScript module reference](https://www.typescriptlang.org/docs/handbook/modules/reference.html).

Keep one application component per implementation file, including development
previews. Related test-only hosts may share the owning spec file. A shared fixture
state/service stays in one owner file and is imported by its fixture consumers.

Angular officially supports external resources. This repository deliberately
chooses one consistent convention for readability; inline resources remain valid
Angular syntax. See [component anatomy](https://angular.dev/guide/components) and
the [Angular style guide](https://angular.dev/style-guide).

## Responsibilities and readability

- Prefer one focused concept per file and small cohesive methods. Use meaningful
  domain names and typed inputs/outputs; avoid compressed declarations and dense
  lines, hidden side effects, `any` and generic catch-all helpers.
- Components compose shared UI and bind state. Feature services own HTTP calls;
  feature state owns orchestration and domain state. Keep business rules in their
  owner rather than embedding them in markup or presentation code.
- Use existing shared public APIs first. Recurring layout, form behavior, feedback,
  grid controls, colors and scrolling belong in the shared component/theme. A
  feature-local copy is not an acceptable shortcut.
- Use Angular Reactive Forms, signals and dependency injection according to the
  approved architecture. New abstractions, global stores and dependencies need a
  concrete requirement; file separation does not justify another framework layer.
- Keep template expressions simple. Move reusable derivations into named computed
  values or pure owner utilities. Comments explain reasons and constraints, rather
  than narrating obvious code.

## Formatting and enforcement

`web-angular/.prettierrc` is the formatting authority for hand-authored source and
scripts (100-column target, single quotes, Angular HTML parser with CSS whitespace
sensitivity). `.prettierignore` excludes generated resources, generated fonts,
dependencies, build output, environment files and lockfiles; their owners remain
responsible for their content.

Run from `web-angular`:

```text
npm run format
npm run check:format
npm run lint
npm run check:architecture
npm run check
```

The full check includes formatting, architecture, types/templates, unit tests and
production build. The architecture AST check rejects inline component resources
including aliased/namespace Angular decorators, and requires a matching folder for
each application component. External production templates keep
the same shared-control/form boundary checks. Native markup in test-host resources
is allowed solely to exercise fixtures; it grants no application exception.

Angular CLI component schematics default to `flat: false`, external HTML and SCSS in
`angular.json`. Project-level VS Code settings select Prettier and format on save;
the extension recommendation is recorded in `.vscode/extensions.json`. Opening
only the repository root may require selecting `web-angular` as a workspace folder
for its folder-specific editor settings. The CLI checks work independently of the
editor extension.

Formatting enforces layout, and static checks enforce specific boundaries. Review
must still assess naming, cohesion, duplication and understandable control flow;
passing a formatter alone does not demonstrate Clean Code.

## Semantic and ownership gates

`eslint.config.mjs` runs Angular recommended/template/accessibility and TypeScript
recommended type-aware checks, with consistent type imports, unsafe-value checks,
promise handling and unused-variable checks. Static Angular validators are safe
unbound functions. Specs use Vitest's assertion-aware unbound-method rule; their
async fixtures deliberately need not contain await. Generated artifacts remain
generator-owned. A narrow documented control-character regex exception preserves
CSV formula protection; no application folder is broadly suppressed.

TypeScript enables `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
`noUnusedLocals` and `noUnusedParameters`. Selected Angular extended diagnostics
are errors. Keep absent optional properties absent when appropriate; validate
unknown API/vendor values and explicitly guard indexed reads. Intentional DI
startup stays in constructors; do not delete it as unused state.

Resolved imports enforce owner public APIs, reviewed Shared localization/theme
adapters and static runtime-cycle freedom. Type-only and lazy edges are classified
separately. State/data entries do not eagerly export pages/routes/controls; those
have narrow public entries. HTTP stays in services, including aliased/constructor
HttpClient and direct browser fetch calls.

Projected Grid templates use the shared `collectionColumn` pipe with a stable key.
Do not hide a positional lookup behind a non-null assertion. Column preference
state and native geometry observation stay generic inside MyDataGrid; feature
pages never create another grid shell.

Tests use typed service mocks and checked fixture entries. Maintain the actual
expected outcome when tightening types; never remove assertions merely to pass a
new gate. Canonical hardening evidence and CC-01..07 closure are in
`documentation/plans/business/web-angular-migration/CLEAN_CODE_HARDENING.md`.
