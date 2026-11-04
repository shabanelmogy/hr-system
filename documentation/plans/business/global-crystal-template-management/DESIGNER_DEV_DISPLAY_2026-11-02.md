# Empty-template dialog development display correction

## Verified symptom and diagnosis

The requester supplied 333.png: the dialog header rendered, while form fields
appeared as empty horizontal lines and the submit button had no caption. The
requester confirmed GET manage/design-sources returned 200. Public hosted Swagger
also exposed design-sources/designer-package/drafts; missing deployment was not
the demonstrated cause.

The same failure was reproduced against assets served by the already-running
Angular development process, using an isolated Playwright browser and known-valid
mock API responses. The production-build fixture passed the same journey.

Capturing console.error, rather than only the browser pageerror event, exposed:
`ERROR TypeError: ctx_r3.viewMessages is not a function` in
GlobalTemplateDesigner_Conditional_6_Conditional_3_Template. DOM inspection showed
that the form elements existed but their update bindings had aborted. This was
not a persistent loading state: the template had entered the ready/form branch.

Read-only inspection of the served JavaScript confirmed that its template called
viewMessages(), but its GlobalTemplateDesigner class lacked that computed member.
The current TypeScript file contained the member and a fresh production build
succeeded. The development asset was stale relative to its external HTML template.
No evidence attributes this to an API body, SQL View query or source-contract error.

## Correction and guard

Refreshed the existing component file's modification timestamp, leaving its
contents unchanged, to trigger the running ng serve watcher. The process was not
stopped/restarted and no additional server was started. Fresh development sessions
then rendered the complete form and completed the normal validation/correction/
draft journey. No Angular dependency, shared input contract, permission, API,
database, native Crystal policy or report file was changed.

The durable browser verifier now supports `--existing-dev-assets`, using the
already-running development server for assets while keeping every API request
mocked. Default behavior still serves production assets through Playwright routing.
Both modes capture Angular console errors as well as page errors, fail if the
initial submit control never renders, and preserve initial diagnostic screenshots.
Expected HTTP resource-console lines for the deliberate 400 validation fixture are
ignored; Angular runtime errors remain failures. A missing script or required
control still fails the journey. No user browser session or credentials are read.

Commands:

```text
npm run verify:report-designer-browser
npm run verify:report-designer-browser -- --existing-dev-assets
```

The second command requires a development server that the operator already started;
the verifier never launches one. Official Angular documentation describes rebuilds
on file changes and the separate HMR/live-reload options:
https://angular.dev/cli/serve. That documentation supports the rebuild mechanism;
the particular stale class/template diagnosis comes from the runtime evidence above.

## Acceptance and limits

Eight production-build cases and eight existing-development-server cases pass:
EN/AR, light/dark and desktop/mobile, typed source selection/manual View entry,
visible fields/parameters, unobscured Save, missing-field focus, package download,
server error correction and successful draft navigation. Full Angular check remains
required after the verifier change. The current feature verification receipt and
the designer-display-correction evidence directory record the final gate results.

API/model/SQL verification from the manual View slice remains unchanged and was not
rerun for this asset synchronization correction. All browser APIs here are fixtures;
an actual authenticated hosted/native RPT/PDF journey remains FOLLOW-024/PROD-028.
Phase06 remains Not Verified; Phase07 is not started.
