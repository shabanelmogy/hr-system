# Summary Info selector diagnosis


## 31. Summary Info selector diagnosis — 2026-11-03

Requester confirms direction changed, but the selector name did not load. This is
user-confirmed direction behavior, not independent acceptance of all shape cases.
Read-only hosted inspection of the local G:/Countries.tests.rpt candidate (44544
bytes, SHA256 e9505470cfeb41d6c1dc7f05eb04ad94870435a0387c6c8f1345d10829fa84d7)
returned HTTP200, valid=true, Title=null and Subject=null. Independent OLE property
inspection of its SummaryInformation stream (codepage1256) also found empty Title
and Subject. No source file or business record was modified by these probes.

The local candidate is not yet matched to the report's currently published
version. The public catalog's reportKey/summaryTitle/summarySubject/version was
requested without credentials. Do not infer the hosted stored metadata from the
local file alone. Current source preserves inspection -> immutable version ->
published catalog -> localized Angular selector. The prior three DOM tests prove
Title(ar)/Subject(en) and displayName fallback, not that a user's source has names.

For this same candidate, save Title(ar)/Subject(en) in Crystal Designer's Summary
Info, then upload a new immutable version, inspect, explicitly Publish and refresh
the viewer. A local RPT edit does not alter an already uploaded/published source;
Revalidate updates validation evidence, not immutable source summary metadata.
Do not synthesize names or rewrite existing version bytes to hide missing values.
No runtime change or test rerun is made for this diagnosis. Current evidence:
SUMMARY_NAMES_2026-11-03.md / verification/summary-names/. FOLLOW-024/PROD-028 remain
Open, Phase06 Not Verified and DEF-027/DEF-028 remain Deferred.

Primary SDK reference: [SummaryInfo.ReportTitle](https://learn.microsoft.com/en-us/previous-versions/ms226152(v=vs.90)). No speculative implementation is authorized by an empty source value.


Published-catalog follow-up: the requester could not copy Network because DevTools
was attached to the embedded Edge PDF viewer. Native browser inspection observed
the actual authenticated catalog directly: countries-tests, displayName
Countries.tests, summaryTitle=null, summarySubject=null, currentVersionNumber=1,
isPublished=true/isArchived=false. The English ERP selector visibly shows
Countries.tests. This establishes missing persisted names in the published version
and correct fallback presentation; no UI label bug or speculative fix is inferred.
Byte identity with the local file has not been verified, but no longer blocks the
published-metadata diagnosis. No further Network copy is required from the user.

A separate read-only API tab was opened and the original ERP tab restored. No
credential, browser preference, source file or business record was changed. The
observed DevTools target is edge_pdf/index.html; lifecycle closing with replaced
PDF content is an inference, not a verified DevTools configuration diagnosis.
Evidence: verification/summary-names/published-catalog-observation.json. The
correction remains saving Summary Info in the intended RPT, uploading a new
version and explicitly publishing it. No runtime change or test rerun.
