using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.BuildingBlocks.Application.Common.Errors;
using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.Modules.Accounting.Contracts;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Abstractions;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Candidates.Commands;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Candidates.Queries;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Dashboard;
using ErpSystem.Modules.HR.Application.Features.Recruitment.EmploymentApplications.Commands;
using ErpSystem.Modules.HR.Application.Features.Recruitment.EmploymentApplications.Queries;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Errors;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Interviews.Commands;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Interviews.Queries;
using ErpSystem.Modules.HR.Application.Features.Recruitment.JobOffers.Commands;
using ErpSystem.Modules.HR.Application.Features.Recruitment.JobOpenings.Commands;
using ErpSystem.Modules.HR.Application.Features.Recruitment.JobOpenings.Queries;
using ErpSystem.Modules.HR.Application.Features.Recruitment.JobRequisitions.Abstractions;
using ErpSystem.Modules.HR.Application.Features.Recruitment.JobRequisitions.Commands;
using ErpSystem.Modules.HR.Application.Features.Recruitment.JobRequisitions.Queries;
using ErpSystem.Modules.HR.Domain.Recruitment.Enums;
using ErpSystem.Modules.HR.Infrastructure.Features.Recruitment.Candidates.Persistence;
using ErpSystem.Modules.HR.Infrastructure.Features.Recruitment.Dashboard;
using ErpSystem.Modules.HR.Infrastructure.Features.Recruitment.EmploymentApplications.Persistence;
using ErpSystem.Modules.HR.Infrastructure.Features.Recruitment.Interviews.Persistence;
using ErpSystem.Modules.HR.Infrastructure.Features.Recruitment.JobOffers.Persistence;
using ErpSystem.Modules.HR.Infrastructure.Features.Recruitment.JobOpenings.Persistence;
using ErpSystem.Modules.HR.Infrastructure.Features.Recruitment.JobRequisitions.Persistence;
using ErpSystem.Modules.HR.Infrastructure.Features.Recruitment.Settings.Persistence;
using ErpSystem.Modules.HR.Infrastructure.Features.Recruitment.Shared;
using ErpSystem.Modules.HR.Infrastructure.Persistence;
using Mapster;
using Microsoft.EntityFrameworkCore;

using ErpSystem.Modules.HR.Domain.OrganizationalStructure.Entities;
using ErpSystem.Modules.HR.Domain.Recruitment.Entities;
using ErpSystem.Modules.HR.Domain.Employees.Entities;

namespace ErpSystem.Modules.HR.Tests;

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
    public async Task SubmitApplication_RejectsCurrencyOutsideAccountingCatalog()
    {
        var actor = new TestCurrentActor("user-1", "tenant-1", 1);
        await using var context = CreateInMemoryDbContext(Guid.NewGuid().ToString(), actor);
        var service = new RecruitmentHarness(context, actor);

        var result = await service.SubmitApplicationAsync(new SubmitApplicationMutation(
            CandidateId: 999,
            JobOpeningId: 999,
            Source: ApplicationSource.CareersPortal,
            ExpectedSalary: 1000m,
            ExpectedSalaryCurrencyCode: "USD"));

        Assert.False(result.IsSuccess);
        Assert.Equal("HR.Currency.InvalidOrInactive", result.Error.Code);
    }

    [Fact]
    public async Task CreateJobOffer_RejectsCurrencyOutsideAccountingCatalog()
    {
        var actor = new TestCurrentActor("user-1", "tenant-1", 1);
        await using var context = CreateInMemoryDbContext(Guid.NewGuid().ToString(), actor);
        var service = new RecruitmentHarness(context, actor);

        var result = await service.CreateJobOfferAsync(new JobOfferMutation(
            EmploymentApplicationId: 999,
            BaseSalary: 1000m,
            CurrencyCode: "USD",
            PayFrequency: PayFrequency.Monthly,
            EmploymentType: EmploymentType.FullTime,
            WorkArrangement: WorkArrangement.OnSite,
            ProposedStartDate: new DateOnly(2026, 10, 1)));

        Assert.False(result.IsSuccess);
        Assert.Equal("HR.Currency.InvalidOrInactive", result.Error.Code);
    }

    [Fact]
    public async Task PagedRecruitmentReads_NormalizeInvalidClientPaging()
    {
        var actor = new TestCurrentActor("user-1", "tenant-1", 1);
        await using var context = CreateInMemoryDbContext(Guid.NewGuid().ToString(), actor);
        var service = new RecruitmentHarness(context, actor);

        var page = await service.GetCandidatesPageAsync(0, 0, search: null);

        Assert.Equal(1, page.MetaData.CurrentPage);
        Assert.Equal(1, page.MetaData.PageNumber);
        Assert.Equal(1, page.MetaData.PageSize);
    }

    [Fact]
    public async Task EmployeeAttributedMutation_WithoutActorEmployeeLink_FailsClosed()
    {
        var actor = new TestCurrentActor("user-1", "tenant-1", 1);
        await using var context = CreateInMemoryDbContext(Guid.NewGuid().ToString(), actor);
        var service = new RecruitmentHarness(context, actor);

        var result = await service.ScheduleInterviewAsync(new ScheduleInterviewMutation(
            EmploymentApplicationId: 999,
            Type: InterviewType.Technical,
            StartsOn: DateTimeOffset.UtcNow.AddDays(1),
            EndsOn: DateTimeOffset.UtcNow.AddDays(1).AddHours(1)));

        Assert.True(result.IsFailure);
        Assert.Equal(RecruitmentErrors.ActorEmployeeRequired.Code, result.Error.Code);
    }

    private static async Task<Employee> SeedActorEmployeeAsync(
        ApplicationDbContext context,
        TestCurrentActor actor)
    {
        var employee = new Employee(
            $"ACTOR-{Guid.NewGuid():N}"[..18],
            "Recruitment",
            "Actor",
            new DateOnly(2026, 1, 1))
        {
            TenantId = actor.TenantId!,
            CompanyId = actor.CompanyId!.Value
        };
        employee.LinkUserAccount(actor.UserId!);
        context.Employees.Add(employee);
        await context.SaveChangesAsync();
        return employee;
    }

    [Fact]
    public async Task HireApplication_WithoutAcceptedOfferFailsWithoutMutation()
    {
        var actor = new TestCurrentActor("hiring-manager", "tenant-1", 1);
        await using var context = CreateInMemoryDbContext(Guid.NewGuid().ToString(), actor);
        var application = new EmploymentApplication(
            candidateId: 1,
            jobOpeningId: 1,
            source: ApplicationSource.CareersPortal,
            createdOn: DateTimeOffset.UtcNow)
        {
            TenantId = "tenant-1",
            CompanyId = 1,
            CreatedById = "candidate-service"
        };
        context.EmploymentApplications.Add(application);
        await context.SaveChangesAsync();

        var service = new RecruitmentHarness(context, actor);
        var result = await service.HireApplicationAsync(application.Id, new HireCandidateMutation(
            EmployeeNumber: "EMP-NOT-ACCEPTED",
            HireDate: DateOnly.FromDateTime(DateTime.UtcNow),
            IdempotencyKey: "hire-without-offer"));

        Assert.True(result.IsFailure);
        Assert.Equal("Recruitment.Hire.AcceptedOfferRequired", result.Error.Code);
        Assert.Equal(ApplicationStatus.Draft, application.Status);
        Assert.Null(application.EmployeeId);
        Assert.Empty(await context.Employees.ToListAsync());
    }

    [Fact]
    public async Task EndToEnd_RecruitmentLifecycle_Succeeds()
    {
        var actor = new TestCurrentActor("admin-user-1", "tenant-1", 1);
        await using var context = CreateInMemoryDbContext(Guid.NewGuid().ToString(), actor);
        var service = new RecruitmentHarness(context, actor);
        await SeedActorEmployeeAsync(context, actor);

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
            ApplicationStatusFilter.UnderReview,
            "Initial resume review meets core criteria");
        Assert.True(reviewResult.IsSuccess);
        Assert.Equal(ApplicationStatus.UnderReview, reviewResult.Value.Status);

        var shortlistResult = await service.MoveApplicationStageAsync(
            applicationId,
            ApplicationStatusFilter.Shortlisted,
            "Candidate passed initial screening");
        Assert.True(shortlistResult.IsSuccess);
        Assert.Equal(ApplicationStatus.Shortlisted, shortlistResult.Value.Status);

        // 6. Schedule Interview & Submit Evaluation
        var invalidParticipantResult = await service.ScheduleInterviewAsync(new ScheduleInterviewMutation(
            EmploymentApplicationId: applicationId,
            Type: InterviewType.Technical,
            StartsOn: DateTimeOffset.UtcNow.AddHours(-2),
            EndsOn: DateTimeOffset.UtcNow.AddHours(-1),
            LocationOrMeetingUrl: "https://meet.google.com/invalid-participant",
            ParticipantEmployeeIds: [int.MaxValue]));
        Assert.True(invalidParticipantResult.IsFailure);
        Assert.Equal(
            RecruitmentErrors.InterviewParticipantNotFound.Code,
            invalidParticipantResult.Error.Code);

        var interviewResult = await service.ScheduleInterviewAsync(new ScheduleInterviewMutation(
            EmploymentApplicationId: applicationId,
            Type: InterviewType.Technical,
            StartsOn: DateTimeOffset.UtcNow.AddHours(-2),
            EndsOn: DateTimeOffset.UtcNow.AddHours(-1),
            LocationOrMeetingUrl: "https://meet.google.com/xyz-test"));

        Assert.True(interviewResult.IsSuccess);
        var interviewId = interviewResult.Value.Id;
        var leadInterviewer = Assert.Single(interviewResult.Value.Participants);
        Assert.Equal("Recruitment Actor", leadInterviewer.EmployeeName);

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
            BaseSalary: 28000,
            CurrencyCode: "EGP",
            PayFrequency: PayFrequency.Monthly,
            EmploymentType: EmploymentType.FullTime,
            WorkArrangement: WorkArrangement.Hybrid,
            ProposedStartDate: DateOnly.FromDateTime(DateTime.UtcNow.AddDays(14))));

        Assert.True(offerResult.IsSuccess);
        var offerId = offerResult.Value.Id;

        var submittedOfferResult = await service.SubmitJobOfferAsync(offerId);
        Assert.True(submittedOfferResult.IsSuccess);
        Assert.Equal(JobOfferStatus.PendingApproval, submittedOfferResult.Value.Status);

        // Approval requires a different actor: the submitter cannot approve their own offer.
        var approverActor = new TestCurrentActor("approver-1", "tenant-1", 1);
        var approvalService = new RecruitmentHarness(context, approverActor);
        var approvedOfferResult = await approvalService.ApproveJobOfferAsync(offerId);
        Assert.True(approvedOfferResult.IsSuccess);
        Assert.Equal(JobOfferStatus.Approved, approvedOfferResult.Value.Status);

        context.RecruitmentPolicies.Add(new RecruitmentPolicy(
            "EGP", 9, autoPublishOpening: true, enforceHeadcountCapacity: true,
            defaultProbationMonths: 3, enablePublicPortal: true, inboundEmailAlias: "careers@example.com"));
        await context.SaveChangesAsync();

        var issuedOfferResult = await service.IssueJobOfferAsync(offerId);
        Assert.True(issuedOfferResult.IsSuccess);
        Assert.Equal(JobOfferStatus.Issued, issuedOfferResult.Value.Status);
        Assert.Equal(issuedOfferResult.Value.IssuedOn?.AddDays(9), issuedOfferResult.Value.ExpiresOn);

        var acceptedOfferResult = await service.AcceptJobOfferAsync(offerId);
        Assert.True(acceptedOfferResult.IsSuccess);
        Assert.Equal(JobOfferStatus.Accepted, acceptedOfferResult.Value.Status);

        // 8. One-Click Hire Application
        var hireResult = await service.HireApplicationAsync(applicationId, new HireCandidateMutation(
            EmployeeNumber: "EMP-092026-001",
            HireDate: DateOnly.FromDateTime(DateTime.UtcNow),
            IdempotencyKey: "hire-lifecycle-application-1"));

        Assert.True(hireResult.IsSuccess);
        Assert.Equal(ApplicationStatus.Hired, hireResult.Value.Status);
        Assert.NotNull(hireResult.Value.EmployeeId);

        // 9. Idempotent retry returns the same employee without duplicates.
        var retryHireResult = await service.HireApplicationAsync(applicationId, new HireCandidateMutation(
            EmployeeNumber: "EMP-092026-001",
            HireDate: DateOnly.FromDateTime(DateTime.UtcNow),
            IdempotencyKey: "hire-lifecycle-application-1"));

        Assert.True(retryHireResult.IsSuccess);
        Assert.Equal(ApplicationStatus.Hired, retryHireResult.Value.Status);
        Assert.Equal(hireResult.Value.EmployeeId, retryHireResult.Value.EmployeeId);
        Assert.Equal(1, await context.Employees.CountAsync(e => e.EmployeeNumber == "EMP-092026-001"));

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
        Assert.Equal(ErpSystem.Modules.HR.Domain.Employees.Enums.EmployeeContractStatus.Active, contract.Status);

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
        var service = new RecruitmentHarness(context, actor);
        await SeedActorEmployeeAsync(context, actor);

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
        var service = new RecruitmentHarness(context, actor);
        await SeedActorEmployeeAsync(context, actor);

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
        var employee = new ErpSystem.Modules.HR.Domain.Employees.Entities.Employee(
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

        var assignment = new ErpSystem.Modules.HR.Domain.Employees.Entities.EmployeeAssignment(
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
        var service = new RecruitmentHarness(context, actor);
        await SeedActorEmployeeAsync(context, actor);

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

        var departingEmployee = new ErpSystem.Modules.HR.Domain.Employees.Entities.Employee(
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

    private sealed class RecruitmentHarness(ApplicationDbContext context, ICurrentActor actor)
    {
        private static readonly TimeProvider Clock = TimeProvider.System;
        private static readonly TypeAdapterConfig MappingConfig = CreateMappingConfig();
        private readonly CandidateReadStore _candidateReads = new(context);
        private readonly CandidateRepository _candidateRepository = new(context);
        private readonly RecruitmentActorEmployeeSource _actorEmployees = new(context, actor);
        private readonly EmploymentApplicationReadStore _applicationReads = new(context, MappingConfig);
        private readonly EmploymentApplicationRepository _applicationRepository = new(context);
        private readonly RecruitmentHireRepository _hireRepository = new(context);
        private readonly InterviewReadStore _interviewReads = new(context, MappingConfig);
        private readonly InterviewRepository _interviewRepository = new(context);
        private readonly JobOpeningReadStore _openingReads = new(context, MappingConfig);
        private readonly JobOpeningRepository _openingRepository = new(context);
        private readonly JobOfferReadStore _offerReads = new(context, MappingConfig);
        private readonly JobOfferRepository _offerRepository = new(context);
        private readonly RecruitmentSettingsRepository _settingsRepository = new(context);
        private readonly TestAccountingCurrencyCatalog _currencyCatalog = new("EGP");
        private readonly JobRequisitionReadStore _requisitionReads = new(context, MappingConfig);
        private readonly JobRequisitionRepository _requisitionRepository = new(context);
        private readonly RecruitmentDashboardReadStore _dashboardReads = new(context);

        private static TypeAdapterConfig CreateMappingConfig()
        {
            var config = new TypeAdapterConfig();
            config.Scan(typeof(EmploymentApplicationDto).Assembly);
            return config;
        }

        public Task<PageResponse<CandidateDto>> GetCandidatesPageAsync(int pageNumber, int pageSize, string? search) =>
            new GetCandidatesPageQueryHandler(_candidateReads)
                .Handle(new GetCandidatesPageQuery(pageNumber, pageSize, search), CancellationToken.None);

        public Task<Result<CandidateDto>> CreateCandidateAsync(CandidateMutation mutation) =>
            new CreateCandidateCommandHandler(_candidateRepository, _candidateReads)
                .Handle(new CreateCandidateCommand(mutation), CancellationToken.None);

        public Task<Result<JobRequisitionDto>> CreateJobRequisitionAsync(JobRequisitionMutation mutation) =>
            new CreateJobRequisitionCommandHandler(
                    _requisitionRepository,
                    _requisitionReads,
                    new TestRequisitionPolicy(false),
                    _actorEmployees,
                    context,
                    actor,
                    new NullFiscalYearPlanningSource(),
                    Clock)
                .Handle(new CreateJobRequisitionCommand(mutation), CancellationToken.None);

        public Task<Result<JobRequisitionDto>> SubmitJobRequisitionAsync(int id) =>
            new SubmitJobRequisitionCommandHandler(_requisitionRepository, _requisitionReads, context, Clock)
                .Handle(new SubmitJobRequisitionCommand(id), CancellationToken.None);

        public Task<Result<JobRequisitionDto>> ApproveJobRequisitionAsync(int id) =>
            new ApproveJobRequisitionCommandHandler(
                    _requisitionRepository,
                    _requisitionReads,
                    _actorEmployees,
                    context,
                    Clock)
                .Handle(new ApproveJobRequisitionCommand(id), CancellationToken.None);

        public Task<Result<PositionHeadcountSummaryDto>> GetPositionHeadcountSummaryAsync(int positionId) =>
            new GetPositionHeadcountSummaryQueryHandler(
                    _requisitionReads,
                    new NullFiscalYearPlanningSource(),
                    actor,
                    Clock)
                .Handle(new GetPositionHeadcountSummaryQuery(positionId), CancellationToken.None);

        public Task<Result<JobOpeningDto>> CreateJobOpeningAsync(JobOpeningMutation mutation) =>
            new CreateJobOpeningCommandHandler(_openingRepository, _openingReads, Clock)
                .Handle(new CreateJobOpeningCommand(mutation), CancellationToken.None);

        public Task<Result<JobOpeningDto>> OpenJobOpeningAsync(int id) =>
            new OpenJobOpeningCommandHandler(_openingRepository, _openingReads, Clock)
                .Handle(new OpenJobOpeningCommand(id), CancellationToken.None);

        public Task<Result<JobOpeningDto>> GetJobOpeningByIdAsync(int id) =>
            new GetJobOpeningByIdQueryHandler(_openingReads)
                .Handle(new GetJobOpeningByIdQuery(id), CancellationToken.None);

        public Task<Result<EmploymentApplicationDto>> SubmitApplicationAsync(SubmitApplicationMutation mutation) =>
            new SubmitEmploymentApplicationCommandHandler(
                    _applicationRepository, _applicationReads, actor, _currencyCatalog, Clock)
                .Handle(new SubmitEmploymentApplicationCommand(mutation), CancellationToken.None);

        public Task<Result<EmploymentApplicationDto>> MoveApplicationStageAsync(
            int id,
            ApplicationStatusFilter targetStatus,
            string? reason) =>
            new MoveEmploymentApplicationStageCommandHandler(
                    _applicationRepository,
                    _applicationReads,
                    _actorEmployees,
                    Clock)
                .Handle(new MoveEmploymentApplicationStageCommand(id, targetStatus, reason), CancellationToken.None);

        public Task<Result<EmploymentApplicationDto>> GetApplicationByIdAsync(int id) =>
            new GetEmploymentApplicationByIdQueryHandler(_applicationReads)
                .Handle(new GetEmploymentApplicationByIdQuery(id), CancellationToken.None);

        public Task<Result<EmploymentApplicationDto>> HireApplicationAsync(int id, HireCandidateMutation mutation) =>
            new HireEmploymentApplicationCommandHandler(
                    _hireRepository,
                    _applicationReads,
                    _actorEmployees,
                    context,
                    actor,
                    Clock)
                .Handle(new HireEmploymentApplicationCommand(id, mutation), CancellationToken.None);

        public Task<Result<InterviewDto>> ScheduleInterviewAsync(ScheduleInterviewMutation mutation) =>
            new ScheduleInterviewCommandHandler(_interviewRepository, _interviewReads, _actorEmployees, Clock)
                .Handle(new ScheduleInterviewCommand(mutation), CancellationToken.None);

        public Task<Result<InterviewDto>> CompleteInterviewAsync(int id) =>
            new CompleteInterviewCommandHandler(_interviewRepository, _interviewReads, _actorEmployees, Clock)
                .Handle(new CompleteInterviewCommand(id), CancellationToken.None);

        public Task<Result<InterviewDto>> SubmitInterviewEvaluationAsync(
            int interviewId,
            SubmitInterviewEvaluationMutation mutation) =>
            new SubmitInterviewEvaluationCommandHandler(
                    _interviewRepository,
                    _interviewReads,
                    _actorEmployees,
                    Clock)
                .Handle(new SubmitInterviewEvaluationCommand(interviewId, mutation), CancellationToken.None);

        public Task<Result<InterviewDto>> GetInterviewByIdAsync(int id) =>
            new GetInterviewByIdQueryHandler(_interviewReads)
                .Handle(new GetInterviewByIdQuery(id), CancellationToken.None);

        public Task<Result<InterviewScorecardTemplateDto>> GetInterviewScorecardTemplateAsync(int interviewId) =>
            new GetInterviewScorecardTemplateQueryHandler(_interviewReads)
                .Handle(new GetInterviewScorecardTemplateQuery(interviewId), CancellationToken.None);

        public Task<Result<JobOfferDto>> CreateJobOfferAsync(JobOfferMutation mutation) =>
            new CreateJobOfferCommandHandler(
                    _offerRepository, _offerReads, context, actor, _currencyCatalog, Clock)
                .Handle(new CreateJobOfferCommand(mutation), CancellationToken.None);

        public Task<Result<JobOfferDto>> SubmitJobOfferAsync(int id) =>
            new SubmitJobOfferCommandHandler(
                    _offerRepository,
                    _offerReads,
                    context,
                    actor,
                    new NullFiscalYearPlanningSource(),
                    Clock)
                .Handle(new SubmitJobOfferCommand(id), CancellationToken.None);

        public Task<Result<JobOfferDto>> ApproveJobOfferAsync(int id) =>
            new ApproveJobOfferCommandHandler(_offerRepository, _offerReads, context, actor, Clock)
                .Handle(new ApproveJobOfferCommand(id), CancellationToken.None);

        public Task<Result<JobOfferDto>> IssueJobOfferAsync(int id) =>
            new IssueJobOfferCommandHandler(
                    _offerRepository,
                    _offerReads,
                    _actorEmployees,
                    _settingsRepository,
                    context,
                    actor,
                    Clock)
                .Handle(new IssueJobOfferCommand(id), CancellationToken.None);

        public Task<Result<JobOfferDto>> AcceptJobOfferAsync(int id) =>
            new AcceptJobOfferCommandHandler(_offerRepository, _offerReads, context, actor, Clock)
                .Handle(new AcceptJobOfferCommand(id), CancellationToken.None);

        public Task<RecruitmentDashboardSummaryDto> GetDashboardSummaryAsync() =>
            new GetRecruitmentDashboardSummaryQueryHandler(_dashboardReads)
                .Handle(new GetRecruitmentDashboardSummaryQuery(), CancellationToken.None);
    }

    private sealed record TestRequisitionPolicy(bool RequireStaffingRequestForNewRequisitions)
        : IRecruitmentRequisitionPolicy;

    private sealed class NullFiscalYearPlanningSource : IFiscalYearPlanningSource
    {
        public Task<FiscalYearPlanningSnapshot?> GetAsync(
            string tenantId,
            int companyId,
            int fiscalYearId,
            CancellationToken cancellationToken) =>
            Task.FromResult<FiscalYearPlanningSnapshot?>(null);
    }
}

