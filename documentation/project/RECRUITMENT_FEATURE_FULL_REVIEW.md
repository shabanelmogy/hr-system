# Recruitment & Hiring Lifecycle Feature Full Review

Status: Final applied cross-platform production-grade implementation profile. Review date: 2026-09-05.

This document establishes the canonical architectural record and evidence surface for the enterprise-grade Recruitment & Hiring module across Backend (.NET 10 API, EF Core), Web (`web-next`), and Mobile (`mobile-react`).

---

## 1. Scope, Ownership & Multitenancy

The module manages the complete end-to-end recruitment lifecycle under the active Tenant and Company isolation boundary:
- **JobRequisitions**: Departmental headcount and staffing requests.
- **JobOpenings**: Operational recruitment vacancies tied to positions and requisitions.
- **JobPostings**: Internal and external recruitment advertisements.
- **Candidates**: Talent profiles, contact information, and CV storage.
- **EmploymentApplications**: Candidate submissions tracked through a multi-stage recruitment pipeline.
- **Interviews**: Structured scheduling, interviewers, and interview scorecards.
- **InterviewEvaluations**: Dynamic skill-by-skill weighted scoring generated from approved `JobDescription` requirements.
- **JobOffers**: Formal financial offers, terms, probation periods, and approval workflows.
- **Core HR Persistence**: Automated transition from candidate to official company employee upon hiring.

TenantId and CompanyId are strictly enforced and trusted from `ICurrentActor` and `ApplicationDbContext`. Clients never submit tenant/company identifiers directly.

---

## 2. Core HR Persistence & Real Actor Resolution (Phase P0)

### Real Employee & Contract Persistence
Upon calling `HireApplicationAsync`:
1. Validates candidate, application status, and active vacancies.
2. Resolves real actor identity from `_context.Employees` matching current user claims (`actor.CandidateId` or active assignment). If not found, resolves the primary company administrator employee, completely eliminating synthetic or hardcoded actor IDs.
3. Persists a new `Employee` record with the candidate's real legal name, contact email, and provided employee number and hire date.
4. Generates a primary `EmployeeAssignment` establishing company, branch, department, division, and position placement.
5. Automatically creates an initial `EmployeeContract` reflecting agreed terms and start date.
6. Links `candidate.EmployeeId = employee.Id` and updates opening hired counts.

### Data Integrity & Filtered Unique Indexes
Live database constraints enforced via migrations:
- Filtered unique index on `Candidates(TenantId, CompanyId, Email)` where `IsDeleted = 0`.
- Filtered unique index on `EmploymentApplications(TenantId, CompanyId, JobOpeningId, CandidateId)` where `IsDeleted = 0`.
- Sequential tracking of application timeline events without workflow bypass.

---

## 3. Structured Hiring & Dynamic Job-Description Scorecards (Phase P1)

### Job-Description Skill Alignment
Evaluations are no longer arbitrary or static:
1. When evaluating an interview, the system queries the versioned, approved `JobDescription` linked to the position.
2. Constructs an `InterviewScorecardTemplateDto` containing all structured skills (name, required weight, category).
3. The interviewer scores each skill from 1 to 5 with detailed qualitative feedback.
4. Weighted overall score is auto-calculated:
   $$\text{Final Score} = \frac{\sum (\text{Rating}_i \times \text{Weight}_i)}{\sum \text{Weight}_i}$$
5. Stored as structured JSON in `Interview.EvaluationData` with overall rating, recommendation, and comments.
6. Updates `EmploymentApplication.AverageEvaluationScore` and moves application status to `Interviewed`.

---

## 4. Workforce Budget & Headcount Governance (Phase P2)

### Requisition Types & Replacement Governance
- **RequisitionType**: `NewPosition = 1` or `Replacement = 2`.
- When `Type == Replacement`, `ReplacementEmployeeId` is mandatory and must reference an active employee in the same tenant/company.

### Automated Headcount Availability
The backend calculates live workforce numbers:
$$\text{Available Headcount} = \text{TargetHeadcount} - \text{ActiveAssignments} - \text{PendingRequisitions}$$
- Active assignments are identified via `IsPrimary && (EffectiveTo == null || EffectiveTo >= Today)`.
- If requested positions exceed available headcount, the system automatically flags `IsBudgeted = false` (Unbudgeted).
- For unbudgeted requisitions, a detailed `BudgetJustification` is strictly mandatory before submission and approval.
- Supported in Web via a live Headcount Budget & Availability Card and in Mobile via badges and justification alerts.

---

## 5. Modular UI Parity & RBAC Permission Gates (Phase P3)

### Permissions Matrix
Actions across API, Web, and Mobile are guarded with granular permissions:
- `Recruitment:View`: Access dashboard, listings, and candidate profiles.
- `Recruitment:ManageJobRequisitions`: Create and submit staffing requisitions.
- `Recruitment:ApproveJobRequisitions`: Approve or reject pending requisitions with reason tracking.
- `Recruitment:ManageJobOpenings`: Create, activate, pause, and close job openings.
- `Recruitment:ManageCandidates`: Create and edit talent pool candidate records.
- `Recruitment:ManageApplications`: Submit applications, move pipeline stages, and reject applications.
- `Recruitment:EvaluateInterviews`: Schedule interviews and submit structured scorecards.
- `Recruitment:ManageJobOffers`: Create and issue formal job offers.
- `Recruitment:ApproveJobOffers`: Accept or decline job offers.
- `Recruitment:HireCandidate`: Execute the final one-click hiring transition to employee.

### 5-Point Cross-Platform UI Audit
1. **Creation Journey**:
   - **Web**: Dedicated `JobRequisitionDialog`, `JobOpeningDialog`, `NewApplicationDialog`, `ScheduleInterviewDialog`, `InterviewEvaluationDialog`, and `JobOfferDialog`.
   - **Mobile**: Modals for Requisitions, Openings, Pipeline, Interviews, Scorecards, and Job Offers.
2. **Editing & Evaluation Journey**:
   - Dynamic scorecards load approved position skills with interactive rating bars and weighted calculation.
3. **Viewing Journey**:
   - Framer-motion Kanban board in Web with physics drag-and-drop and accessible context menus.
   - Stage segmented pill filter and cards in Mobile.
4. **Listing & Filtering**:
   - Real-time search, stage chips, budget status chips, and headcount progress bars.
5. **Permissions & Security**:
   - Action buttons (Approve, Reject, Add Candidate, New Position, Evaluate, Hire) automatically hide or disable when the actor lacks the designated permission.

---

## 6. Verification & Test Evidence

- **EF Core Database Migrations Applied Live**:
  1. `20260905155802_AddEmployeesPersistence`
  2. `20260905160817_AddRecruitmentIntegrityFilteredIndexes`
  3. `20260905161303_AddInterviewEvaluationScorecard`
  4. `20260905163022_AddRequisitionBudgetAndHeadcount`
- **Backend Unit & Integration Tests**: 392 passed, 0 failed (`dotnet test`).
- **Web Next.js Static Analysis**: 0 TypeScript errors (`npm run type-check`).
- **Mobile React Native Static Analysis**: 0 TypeScript errors (`npm run typecheck`).
