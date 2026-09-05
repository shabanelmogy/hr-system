using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Features.Recruitment.Contracts;
using HrManagementSystem.Domain.Recruitment.Enums;
using HrManagementSystem.Infrastructure.Features.Recruitment.Services;
using HrManagementSystem.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;

using HrManagementSystem.Domain.OrganizationalStructure.Entities;

namespace HrManagementSystem.Tests;

public sealed class RecruitmentLifecycleTests
{
    private static ApplicationDbContext CreateInMemoryDbContext(string dbName, ICurrentActor actor)
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        return new ApplicationDbContext(options, actor, TimeProvider.System);
    }

    private sealed record TestCurrentActor(
        string? UserId,
        string? TenantId,
        int? CompanyId) : ICurrentActor;

    [Fact]
    public async Task EndToEnd_RecruitmentLifecycle_Succeeds()
    {
        var actor = new TestCurrentActor("admin-user-1", "tenant-1", 1);
        await using var context = CreateInMemoryDbContext(Guid.NewGuid().ToString(), actor);
        var logger = NullLogger<RecruitmentService>.Instance;
        var service = new RecruitmentService(context, actor, logger);

        // Seed organizational structure
        var branch = new Branch("HQ", "Cairo", "القاهرة", "Africa/Cairo", new DateOnly(2026, 1, 1)) { TenantId = "tenant-1", CompanyId = 1 };
        context.Branches.Add(branch);
        await context.SaveChangesAsync();

        var dept = new Department(branch.Id, "ENG", "Engineering", "الهندسة") { TenantId = "tenant-1", CompanyId = 1 };
        context.Departments.Add(dept);
        await context.SaveChangesAsync();

        var div = new Division(dept.Id, "SW", "Software", "البرمجيات") { TenantId = "tenant-1", CompanyId = 1 };
        context.Divisions.Add(div);
        await context.SaveChangesAsync();

        var jobTitle = new JobTitle("DEV", "Software Engineer", "مهندس برمجيات") { TenantId = "tenant-1", CompanyId = 1 };
        context.JobTitles.Add(jobTitle);
        await context.SaveChangesAsync();

        var jobLevel = new JobLevel("SR", "Senior", "أول", 3) { TenantId = "tenant-1", CompanyId = 1 };
        context.JobLevels.Add(jobLevel);
        await context.SaveChangesAsync();

        var position = new Position("POS-DEV", jobTitle.Id, div.Id, jobLevel.Id, 5) { TenantId = "tenant-1", CompanyId = 1 };
        context.Positions.Add(position);
        await context.SaveChangesAsync();

        // 1. Create Candidate
        var candResult = await service.CreateCandidateAsync(new CandidateMutation(
            FirstName: "Ahmed",
            MiddleName: "Mahmoud",
            LastName: "Ibrahim",
            Email: "ahmed.ibrahim@example.com",
            PhoneNumber: "+201001234567"));

        Assert.True(candResult.IsSuccess);
        Assert.Equal("Ahmed Mahmoud Ibrahim", candResult.Value.FullName);
        var candidateId = candResult.Value.Id;

        // 2. Create and Approve Job Requisition
        var reqResult = await service.CreateJobRequisitionAsync(new JobRequisitionMutation(
            PositionId: position.Id,
            BranchId: branch.Id,
            DepartmentId: dept.Id,
            DivisionId: div.Id,
            RequestedPositions: 2,
            BusinessReason: "Expanding backend development team for 2026 growth",
            EmploymentType: EmploymentType.FullTime,
            WorkArrangement: WorkArrangement.Hybrid,
            TargetHireDate: DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(1))));

        Assert.True(reqResult.IsSuccess);
        var requisitionId = reqResult.Value.Id;

        var submitReqResult = await service.SubmitJobRequisitionAsync(requisitionId);
        Assert.True(submitReqResult.IsSuccess);
        Assert.Equal(JobRequisitionStatus.PendingApproval, submitReqResult.Value.Status);

        var approveReqResult = await service.ApproveJobRequisitionAsync(requisitionId);
        Assert.True(approveReqResult.IsSuccess);
        Assert.Equal(JobRequisitionStatus.Approved, approveReqResult.Value.Status);

        // 3. Create and Open Job Opening
        var openResult = await service.CreateJobOpeningAsync(new JobOpeningMutation(
            JobRequisitionId: requisitionId,
            PositionId: position.Id,
            BranchId: branch.Id,
            DepartmentId: dept.Id,
            DivisionId: div.Id,
            PositionCount: 2,
            EmploymentType: EmploymentType.FullTime,
            WorkArrangement: WorkArrangement.Hybrid));

        Assert.True(openResult.IsSuccess);
        var openingId = openResult.Value.Id;

        var activatedOpeningResult = await service.OpenJobOpeningAsync(openingId);
        Assert.True(activatedOpeningResult.IsSuccess);
        Assert.Equal(JobOpeningStatus.Open, activatedOpeningResult.Value.Status);

        // 4. Submit Employment Application
        var appResult = await service.SubmitApplicationAsync(new SubmitApplicationMutation(
            CandidateId: candidateId,
            JobOpeningId: openingId,
            Source: ApplicationSource.CareersPortal,
            ExpectedSalary: 25000,
            ExpectedSalaryCurrencyCode: "EGP"));

        Assert.True(appResult.IsSuccess);
        var applicationId = appResult.Value.Id;
        Assert.Equal(ApplicationStatus.Submitted, appResult.Value.Status);

        // 5. Advance Stage to UnderReview then Shortlisted
        var reviewResult = await service.MoveApplicationStageAsync(
            applicationId,
            ApplicationStatus.UnderReview,
            "Initial resume review meets core criteria");
        Assert.True(reviewResult.IsSuccess);
        Assert.Equal(ApplicationStatus.UnderReview, reviewResult.Value.Status);

        var shortlistResult = await service.MoveApplicationStageAsync(
            applicationId,
            ApplicationStatus.Shortlisted,
            "Candidate passed initial screening");
        Assert.True(shortlistResult.IsSuccess);
        Assert.Equal(ApplicationStatus.Shortlisted, shortlistResult.Value.Status);

        // 6. Schedule Interview & Submit Evaluation
        var interviewResult = await service.ScheduleInterviewAsync(new ScheduleInterviewMutation(
            EmploymentApplicationId: applicationId,
            Type: InterviewType.Technical,
            StartsOn: DateTimeOffset.UtcNow.AddHours(-2),
            EndsOn: DateTimeOffset.UtcNow.AddHours(-1),
            LocationOrMeetingUrl: "https://meet.google.com/xyz-test",
            LeadEmployeeId: 1));

        Assert.True(interviewResult.IsSuccess);
        var interviewId = interviewResult.Value.Id;

        // Verify application automatically transitioned to InterviewScheduled
        var updatedApp = await service.GetApplicationByIdAsync(applicationId);
        Assert.Equal(ApplicationStatus.InterviewScheduled, updatedApp.Value.Status);

        var completeInterviewResult = await service.CompleteInterviewAsync(interviewId);
        Assert.True(completeInterviewResult.IsSuccess);

        var evalResult = await service.SubmitInterviewEvaluationAsync(interviewId, new SubmitInterviewEvaluationMutation(
            Score: 4.8m,
            Recommendation: InterviewRecommendation.StrongHire,
            Comments: "Exceptional architecture and .NET/Next.js experience"));
        Assert.True(evalResult.IsSuccess);

        // 7. Create & Issue Job Offer
        var offerResult = await service.CreateJobOfferAsync(new JobOfferMutation(
            EmploymentApplicationId: applicationId,
            PositionId: position.Id,
            BranchId: branch.Id,
            DepartmentId: dept.Id,
            DivisionId: div.Id,
            BaseSalary: 28000,
            CurrencyCode: "EGP",
            PayFrequency: PayFrequency.Monthly,
            EmploymentType: EmploymentType.FullTime,
            WorkArrangement: WorkArrangement.Hybrid,
            ProposedStartDate: DateOnly.FromDateTime(DateTime.UtcNow.AddDays(14))));

        Assert.True(offerResult.IsSuccess);
        var offerId = offerResult.Value.Id;

        var issuedOfferResult = await service.IssueJobOfferAsync(offerId);
        Assert.True(issuedOfferResult.IsSuccess);
        Assert.Equal(JobOfferStatus.Issued, issuedOfferResult.Value.Status);

        var acceptedOfferResult = await service.AcceptJobOfferAsync(offerId);
        Assert.True(acceptedOfferResult.IsSuccess);
        Assert.Equal(JobOfferStatus.Accepted, acceptedOfferResult.Value.Status);

        // 8. One-Click Hire Application
        var hireResult = await service.HireApplicationAsync(applicationId, new HireCandidateMutation(
            EmployeeNumber: "EMP-092026-001",
            HireDate: DateOnly.FromDateTime(DateTime.UtcNow)));

        Assert.True(hireResult.IsSuccess);
        Assert.Equal(ApplicationStatus.Hired, hireResult.Value.Status);
        Assert.NotNull(hireResult.Value.EmployeeId);

        // Verify Real Employee, Assignment, and Contract persisted in Database
        var createdEmployee = await context.Employees
            .Include(e => e.Assignments)
            .Include(e => e.Contracts)
            .FirstOrDefaultAsync(e => e.Id == hireResult.Value.EmployeeId);

        Assert.NotNull(createdEmployee);
        Assert.Equal("EMP-092026-001", createdEmployee.EmployeeNumber);
        Assert.Equal("Ahmed", createdEmployee.FirstName);
        Assert.Equal("Ibrahim", createdEmployee.LastName);
        Assert.Equal(candidateId, createdEmployee.CandidateId);
        Assert.Single(createdEmployee.Assignments);
        var assignment = createdEmployee.Assignments.First();
        Assert.Equal(position.Id, assignment.PositionId);
        Assert.Equal(branch.Id, assignment.BranchId);
        Assert.Equal(dept.Id, assignment.DepartmentId);
        Assert.True(assignment.IsPrimary);
        Assert.Single(createdEmployee.Contracts);
        var contract = createdEmployee.Contracts.First();
        Assert.Equal(HrManagementSystem.Domain.Employees.Enums.EmployeeContractStatus.Active, contract.Status);

        // Verify Job Opening hired count incremented
        var updatedOpening = await service.GetJobOpeningByIdAsync(openingId);
        Assert.Equal(1, updatedOpening.Value.HiredCount);
        Assert.Equal(1, updatedOpening.Value.AvailablePositions);

        // 9. Dashboard Summary Verification
        var summary = await service.GetDashboardSummaryAsync();
        Assert.Equal(1, summary.TotalOpenings);
        Assert.Equal(1, summary.TotalActiveCandidates);
        Assert.Equal(1, summary.TotalHiredCount);
        Assert.True(summary.StageCounts.ContainsKey(ApplicationStatus.Hired.ToString()));
        Assert.Equal(1, summary.StageCounts[ApplicationStatus.Hired.ToString()]);
    }

    [Fact]
    public async Task ScorecardEvaluation_WithDynamicJobSkills_CalculatesWeightedScoreCorrectly()
    {
        var actor = new TestCurrentActor("admin-user-2", "tenant-1", 1);
        await using var context = CreateInMemoryDbContext(Guid.NewGuid().ToString(), actor);
        var logger = NullLogger<RecruitmentService>.Instance;
        var service = new RecruitmentService(context, actor, logger);

        // Seed org structure
        var branch = new Branch("HQ2", "Giza", "الجيزة", "Africa/Cairo", new DateOnly(2026, 1, 1)) { TenantId = "tenant-1", CompanyId = 1 };
        context.Branches.Add(branch);
        await context.SaveChangesAsync();

        var dept = new Department(branch.Id, "ENG2", "Tech", "التقنية") { TenantId = "tenant-1", CompanyId = 1 };
        context.Departments.Add(dept);
        await context.SaveChangesAsync();

        var div = new Division(dept.Id, "BACK", "Backend", "الخلفية") { TenantId = "tenant-1", CompanyId = 1 };
        context.Divisions.Add(div);
        await context.SaveChangesAsync();

        var jobTitle = new JobTitle("ARCH", "Lead Architect", "كبير المعماريين") { TenantId = "tenant-1", CompanyId = 1 };
        context.JobTitles.Add(jobTitle);
        await context.SaveChangesAsync();

        var jobLevel = new JobLevel("LEAD", "Lead", "قائد", 5) { TenantId = "tenant-1", CompanyId = 1 };
        context.JobLevels.Add(jobLevel);
        await context.SaveChangesAsync();

        var position = new Position("POS-ARCH", jobTitle.Id, div.Id, jobLevel.Id, 2) { TenantId = "tenant-1", CompanyId = 1 };
        context.Positions.Add(position);
        await context.SaveChangesAsync();

        // Seed Job Description with structured skills
        var jd = new JobDescription(position.Id, "Lead Architect", "كبير المعماريين", "V1.0")
        {
            TenantId = "tenant-1",
            CompanyId = 1
        };
        jd.UpdateContent(
            purposeEn: "Architect enterprise applications",
            purposeAr: "تصميم النظم المؤسسية",
            responsibilitiesEn: "Design microservices and domain architecture",
            responsibilitiesAr: "تصميم المعمارية والخدمات",
            requirementsEn: "10+ years C# and cloud systems",
            requirementsAr: "خبرة 10 سنوات في سي شارب",
            requiredSkills: "C#, Architecture, SQL",
            requiredEducation: "BSc Computer Science",
            minExperienceYears: 8);
        jd.UpdateStructuredContent(
            dutySections: null,
            skills: [
                new JobSkillItem { SkillName = ".NET 10 Enterprise", ProficiencyLevel = "Expert", IsMandatory = true },
                new JobSkillItem { SkillName = "Domain-Driven Design", ProficiencyLevel = "Advanced", IsMandatory = true }
            ],
            educationRequirements: null);
        jd.Approve("admin-user-2", new DateOnly(2026, 1, 1), null, DateTimeOffset.UtcNow);
        context.JobDescriptions.Add(jd);
        await context.SaveChangesAsync();

        // Create requisition and opening
        var reqResult = await service.CreateJobRequisitionAsync(new JobRequisitionMutation(
            PositionId: position.Id,
            BranchId: branch.Id,
            DepartmentId: dept.Id,
            DivisionId: div.Id,
            RequestedPositions: 1,
            BusinessReason: "Strategic lead architect hiring",
            EmploymentType: EmploymentType.FullTime,
            WorkArrangement: WorkArrangement.OnSite,
            TargetHireDate: DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(1))));
        Assert.True(reqResult.IsSuccess);
        var reqId = reqResult.Value.Id;

        await service.SubmitJobRequisitionAsync(reqId);
        await service.ApproveJobRequisitionAsync(reqId);

        var openingResult = await service.CreateJobOpeningAsync(new JobOpeningMutation(
            JobRequisitionId: reqId,
            PositionId: position.Id,
            BranchId: branch.Id,
            DepartmentId: dept.Id,
            DivisionId: div.Id,
            PositionCount: 1,
            EmploymentType: EmploymentType.FullTime,
            WorkArrangement: WorkArrangement.OnSite));
        Assert.True(openingResult.IsSuccess);
        var openingId = openingResult.Value.Id;
        await service.OpenJobOpeningAsync(openingId);

        // Candidate and application
        var candResult = await service.CreateCandidateAsync(new CandidateMutation(
            FirstName: "Omar",
            MiddleName: null,
            LastName: "Farouk",
            Email: "omar.farouk@example.com",
            PhoneNumber: "+201099998888"));
        Assert.True(candResult.IsSuccess);

        var appResult = await service.SubmitApplicationAsync(new SubmitApplicationMutation(
            CandidateId: candResult.Value.Id,
            JobOpeningId: openingId,
            Source: ApplicationSource.CareersPortal));
        Assert.True(appResult.IsSuccess);
        var appId = appResult.Value.Id;

        // Schedule interview
        var interviewResult = await service.ScheduleInterviewAsync(new ScheduleInterviewMutation(
            EmploymentApplicationId: appId,
            Type: InterviewType.Technical,
            StartsOn: DateTimeOffset.UtcNow.AddHours(-1),
            EndsOn: DateTimeOffset.UtcNow,
            LocationOrMeetingUrl: "Boardroom A"));
        Assert.True(interviewResult.IsSuccess);
        var interviewId = interviewResult.Value.Id;

        // 1. Get Scorecard Template and verify skills loaded from approved JobDescription
        var templateResult = await service.GetInterviewScorecardTemplateAsync(interviewId);
        Assert.True(templateResult.IsSuccess);
        Assert.Equal(2, templateResult.Value.Skills.Count);
        Assert.Contains(templateResult.Value.Skills, s => s.SkillName == ".NET 10 Enterprise");
        Assert.Contains(templateResult.Value.Skills, s => s.SkillName == "Domain-Driven Design");

        // Complete interview prior to evaluation submission as enforced by domain
        var completeResult = await service.CompleteInterviewAsync(interviewId);
        Assert.True(completeResult.IsSuccess);

        // 2. Submit Scorecard with weighted skill evaluations
        // Skill 1: Score 4, Weight 60
        // Skill 2: Score 5, Weight 40
        // Expected weighted score: (4 * 60 + 5 * 40) / 100 = 4.4
        var evalResult = await service.SubmitInterviewEvaluationAsync(interviewId, new SubmitInterviewEvaluationMutation(
            Score: 0, // Should be recalculated by backend service based on weighted skill scores
            Recommendation: InterviewRecommendation.StrongHire,
            Comments: "Superb architectural design knowledge and clean code practices",
            SkillEvaluations: [
                new InterviewSkillEvaluationDto(
                    SkillName: ".NET 10 Enterprise",
                    Score: 4,
                    WeightPercentage: 60,
                    IsMandatory: true,
                    Notes: "Strong C# 13 and performance optimization patterns"),
                new InterviewSkillEvaluationDto(
                    SkillName: "Domain-Driven Design",
                    Score: 5,
                    WeightPercentage: 40,
                    IsMandatory: true,
                    Notes: "Flawless aggregate boundaries and domain events knowledge")
            ]));

        Assert.True(evalResult.IsSuccess);
        Assert.Single(evalResult.Value.Evaluations);
        var evaluation = evalResult.Value.Evaluations.First();
        Assert.Equal(4.4m, evaluation.Score);
        Assert.Equal(InterviewRecommendation.StrongHire, evaluation.Recommendation);
        Assert.NotNull(evaluation.SkillEvaluations);
        Assert.Equal(2, evaluation.SkillEvaluations.Count);

        // 3. Verify GetInterviewByIdAsync returns the structured scorecard evaluation
        var interviewDetail = await service.GetInterviewByIdAsync(interviewId);
        Assert.True(interviewDetail.IsSuccess);
        Assert.Single(interviewDetail.Value.Evaluations);
        var detailEval = interviewDetail.Value.Evaluations.First();
        Assert.Equal(4.4m, detailEval.Score);
        Assert.Equal(2, detailEval.SkillEvaluations.Count);
        Assert.Equal(".NET 10 Enterprise", detailEval.SkillEvaluations[0].SkillName);
    }

    [Fact]
    public async Task HeadcountGovernance_WhenExceedingTargetHeadcount_RequiresBudgetJustification()
    {
        var actor = new TestCurrentActor("admin-user-3", "tenant-1", 1);
        await using var context = CreateInMemoryDbContext(Guid.NewGuid().ToString(), actor);
        var logger = NullLogger<RecruitmentService>.Instance;
        var service = new RecruitmentService(context, actor, logger);

        // Seed branch, dept, div, title, level, position (TargetHeadcount = 2)
        var branch = new Branch("HQ3", "Cairo", "القاهرة", "Africa/Cairo", new DateOnly(2026, 1, 1)) { TenantId = "tenant-1", CompanyId = 1 };
        context.Branches.Add(branch);
        await context.SaveChangesAsync();

        var dept = new Department(branch.Id, "HR", "Human Resources", "الموارد البشرية") { TenantId = "tenant-1", CompanyId = 1 };
        context.Departments.Add(dept);
        await context.SaveChangesAsync();

        var div = new Division(dept.Id, "OPS", "Operations", "العمليات") { TenantId = "tenant-1", CompanyId = 1 };
        context.Divisions.Add(div);
        await context.SaveChangesAsync();

        var jobTitle = new JobTitle("HROPS", "HR Specialist", "أخصائي موارد بشرية") { TenantId = "tenant-1", CompanyId = 1 };
        context.JobTitles.Add(jobTitle);
        await context.SaveChangesAsync();

        var jobLevel = new JobLevel("MID", "Mid-Level", "متوسط", 2) { TenantId = "tenant-1", CompanyId = 1 };
        context.JobLevels.Add(jobLevel);
        await context.SaveChangesAsync();

        var position = new Position("POS-HROPS", jobTitle.Id, div.Id, jobLevel.Id, 2) { TenantId = "tenant-1", CompanyId = 1 };
        context.Positions.Add(position);
        await context.SaveChangesAsync();

        // 1. Seed 1 active employee assignment for this position
        var employee = new HrManagementSystem.Domain.Employees.Entities.Employee(
            "EMP-TEST-001",
            "Mona",
            "Sayed",
            new DateOnly(2026, 1, 1))
        {
            TenantId = "tenant-1",
            CompanyId = 1
        };
        context.Employees.Add(employee);
        await context.SaveChangesAsync();

        var assignment = new HrManagementSystem.Domain.Employees.Entities.EmployeeAssignment(
            employee.Id,
            position.Id,
            branch.Id,
            dept.Id,
            new DateOnly(2026, 1, 1),
            isPrimary: true)
        {
            TenantId = "tenant-1",
            CompanyId = 1
        };
        context.EmployeeAssignments.Add(assignment);
        await context.SaveChangesAsync();

        // 2. Query headcount summary: Target = 2, Active = 1, Available = 1
        var summaryResult = await service.GetPositionHeadcountSummaryAsync(position.Id);
        Assert.True(summaryResult.IsSuccess);
        Assert.Equal(2, summaryResult.Value.TargetHeadcount);
        Assert.Equal(1, summaryResult.Value.ActiveHeadcount);
        Assert.Equal(0, summaryResult.Value.PendingRequisitionsCount);
        Assert.Equal(1, summaryResult.Value.AvailableHeadcount);
        Assert.False(summaryResult.Value.ExceedsHeadcount);

        // 3. Attempt to create NewPosition requisition requesting 2 positions (1 available) without justification -> FAILS
        var failResult = await service.CreateJobRequisitionAsync(new JobRequisitionMutation(
            PositionId: position.Id,
            BranchId: branch.Id,
            DepartmentId: dept.Id,
            DivisionId: div.Id,
            RequestedPositions: 2,
            BusinessReason: "Urgent scale up",
            EmploymentType: EmploymentType.FullTime,
            WorkArrangement: WorkArrangement.OnSite,
            TargetHireDate: DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(1)),
            Type: RequisitionType.NewPosition,
            BudgetJustification: null)); // No justification provided

        Assert.False(failResult.IsSuccess);
        Assert.Equal("Recruitment.BudgetJustificationRequired", failResult.Error.Code);

        // 4. Create NewPosition requisition requesting 2 positions with budget justification -> SUCCEEDS as unbudgeted
        var successResult = await service.CreateJobRequisitionAsync(new JobRequisitionMutation(
            PositionId: position.Id,
            BranchId: branch.Id,
            DepartmentId: dept.Id,
            DivisionId: div.Id,
            RequestedPositions: 2,
            BusinessReason: "Urgent scale up approved by board",
            EmploymentType: EmploymentType.FullTime,
            WorkArrangement: WorkArrangement.OnSite,
            TargetHireDate: DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(1)),
            Type: RequisitionType.NewPosition,
            BudgetJustification: "Special approval by CEO for business expansion Q3"));

        Assert.True(successResult.IsSuccess);
        Assert.False(successResult.Value.IsBudgeted);
        Assert.Equal("Special approval by CEO for business expansion Q3", successResult.Value.BudgetJustification);
        Assert.Equal(RequisitionType.NewPosition, successResult.Value.Type);
    }

    [Fact]
    public async Task ReplacementRequisition_RequiresValidReplacementEmployee()
    {
        var actor = new TestCurrentActor("admin-user-4", "tenant-1", 1);
        await using var context = CreateInMemoryDbContext(Guid.NewGuid().ToString(), actor);
        var logger = NullLogger<RecruitmentService>.Instance;
        var service = new RecruitmentService(context, actor, logger);

        // Seed branch, dept, div, position
        var branch = new Branch("HQ4", "Alexandria", "الإسكندرية", "Africa/Cairo", new DateOnly(2026, 1, 1)) { TenantId = "tenant-1", CompanyId = 1 };
        context.Branches.Add(branch);
        await context.SaveChangesAsync();

        var dept = new Department(branch.Id, "FIN", "Finance", "المالية") { TenantId = "tenant-1", CompanyId = 1 };
        context.Departments.Add(dept);
        await context.SaveChangesAsync();

        var div = new Division(dept.Id, "ACC", "Accounting", "المحاسبة") { TenantId = "tenant-1", CompanyId = 1 };
        context.Divisions.Add(div);
        await context.SaveChangesAsync();

        var jobTitle = new JobTitle("ACC", "Senior Accountant", "محاسب أول") { TenantId = "tenant-1", CompanyId = 1 };
        context.JobTitles.Add(jobTitle);
        await context.SaveChangesAsync();

        var jobLevel = new JobLevel("SR2", "Senior", "أول", 3) { TenantId = "tenant-1", CompanyId = 1 };
        context.JobLevels.Add(jobLevel);
        await context.SaveChangesAsync();

        var position = new Position("POS-ACC", jobTitle.Id, div.Id, jobLevel.Id, 1) { TenantId = "tenant-1", CompanyId = 1 };
        context.Positions.Add(position);
        await context.SaveChangesAsync();

        var departingEmployee = new HrManagementSystem.Domain.Employees.Entities.Employee(
            "EMP-FIN-001",
            "Kareem",
            "Hassan",
            new DateOnly(2026, 1, 1))
        {
            TenantId = "tenant-1",
            CompanyId = 1
        };
        context.Employees.Add(departingEmployee);
        await context.SaveChangesAsync();

        // 1. Attempt Replacement requisition without ReplacementEmployeeId -> FAILS
        var failResult = await service.CreateJobRequisitionAsync(new JobRequisitionMutation(
            PositionId: position.Id,
            BranchId: branch.Id,
            DepartmentId: dept.Id,
            DivisionId: div.Id,
            RequestedPositions: 1,
            BusinessReason: "Backfill departing accountant",
            EmploymentType: EmploymentType.FullTime,
            WorkArrangement: WorkArrangement.OnSite,
            TargetHireDate: DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(1)),
            Type: RequisitionType.Replacement,
            ReplacementEmployeeId: null));

        Assert.False(failResult.IsSuccess);
        Assert.Equal("Recruitment.ReplacementEmployeeRequired", failResult.Error.Code);

        // 2. Create Replacement requisition with valid ReplacementEmployeeId -> SUCCEEDS
        var successResult = await service.CreateJobRequisitionAsync(new JobRequisitionMutation(
            PositionId: position.Id,
            BranchId: branch.Id,
            DepartmentId: dept.Id,
            DivisionId: div.Id,
            RequestedPositions: 1,
            BusinessReason: "Backfill departing accountant",
            EmploymentType: EmploymentType.FullTime,
            WorkArrangement: WorkArrangement.OnSite,
            TargetHireDate: DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(1)),
            Type: RequisitionType.Replacement,
            ReplacementEmployeeId: departingEmployee.Id));

        Assert.True(successResult.IsSuccess);
        Assert.Equal(RequisitionType.Replacement, successResult.Value.Type);
        Assert.Equal(departingEmployee.Id, successResult.Value.ReplacementEmployeeId);
        Assert.Equal("Kareem Hassan", successResult.Value.ReplacementEmployeeName);
        Assert.True(successResult.Value.IsBudgeted);
    }
}
