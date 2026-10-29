# Angular company context — final implementation request

Documentation state: Final. Exact S2-A4 was authorized after current Phase 00 books, fixed transition design, 11 SQL and real transport proof, generated261 recipes and planning checks. Phase06 is now Verified; see IMPLEMENTATION_REPORT.md.

Existing-System Relationship Review: reused current SwitchCompanyCommand/adapter and browser endpoint; no new auth issuer or grant. Business Rules: trusted current tenant/user/session and company membership remain server-owned. Current/unknown/invalid/global/duplicate choices cause no mutation; every attempted mutation is verified before protected reads resume. External messages supply no authority. Uncertain replies are reconciled through session/refresh, without repeating the write.

Edge cases: pending/logout exclusion, changed actor, invalid/unavailable session, stale identity/read/locale, delayed CSRF/localization, response loss and denial, queued external events, lifecycle cleanup, single company, keyboard/RTL/compact/modes, reload and cross-tab login/switch/logout. Meaningful unit and real-browser proofs are in the final manifest. All business Grid/CRUD/import/export/report/attachment/structured-field capabilities are Excluded for this header-only child. Fiscal year/tenant switching is Deferred FOLLOW-015; future dirty editors FOLLOW-014; actual translation editor persistence FOLLOW-012.

Impact: Extend Angular AuthSession, existing transport/selector/feedback and Shell; reuse scoped reads and localization owner. API/native/Next runtime preserved except generated bilingual catalog. Actual isolated SQL proves existing schema unchanged; no production company creation. Customer education followed Phase06 Verified.
