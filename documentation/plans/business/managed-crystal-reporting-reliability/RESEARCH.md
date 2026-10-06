# Managed Crystal Reporting Reliability — Research Notes

## Repository evidence

- `graphify query` was used first for architecture navigation. It surfaced the
  Reporting/Fiscal Years/client documentation relationships but did not fully index
  the independent .NET Framework runtime, so the runtime source and deployment
  artifacts were inspected directly.
- `documentation/system/Generate-Documentation.ps1 -Check` passed for 101 recipes
  before the plan was created.
- `documentation/plans/Check-Planning.ps1` passed before the plan was created.
- Runtime Release x64 build and focused Reporting tests were verified during the
  review; exact outcomes are recorded in `EVIDENCE.md`.

## Version-sensitive primary sources

- SAP Crystal Reports for Visual Studio downloads/support packages:
  `https://help.sap.com/docs/SUPPORT_CONTENT/crystalreports/5322472926.html`
- SAP Crystal Reports for Visual Studio supported platforms:
  `https://assets.cdn.sap.com/sapcom/docs/2016/06/f871031e-757c-0010-82c7-eda71af511fa.pdf`
- SAP Crystal Reports FAQ, including embedded-engine deployment guidance:
  `https://pages.community.sap.com/topics/crystal-reports/faq`
- Microsoft .NET Framework lifecycle:
  `https://learn.microsoft.com/lifecycle/products/microsoft-net-framework`

These links are evidence inputs for the final security/dependency and production
readiness phase. Their current contents must be rechecked when that phase starts.
