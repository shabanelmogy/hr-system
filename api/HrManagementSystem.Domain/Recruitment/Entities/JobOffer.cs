using HrManagementSystem.Domain.Common.Exceptions;
using HrManagementSystem.Domain.Recruitment.Enums;
using static HrManagementSystem.Domain.Common.Guards.DomainGuard;

namespace HrManagementSystem.Domain.Recruitment.Entities;

public sealed class JobOffer : CompanyAuditableEntity
{
    private JobOffer()
    {
    }

    public JobOffer(
        string offerNumber,
        int employmentApplicationId,
        int positionId,
        int branchId,
        int departmentId,
        decimal baseSalary,
        string currencyCode,
        PayFrequency payFrequency,
        EmploymentType employmentType,
        WorkArrangement workArrangement,
        DateOnly proposedStartDate,
        int? divisionId = null)
    {
        PublicId = Guid.NewGuid();
        OfferNumber = Required(offerNumber, nameof(offerNumber));
        EmploymentApplicationId = Positive(employmentApplicationId, nameof(employmentApplicationId));
        PositionId = Positive(positionId, nameof(positionId));
        BranchId = Positive(branchId, nameof(branchId));
        DepartmentId = Positive(departmentId, nameof(departmentId));
        DivisionId = PositiveOrNull(divisionId, nameof(divisionId));
        SetTerms(
            baseSalary,
            currencyCode,
            payFrequency,
            employmentType,
            workArrangement,
            proposedStartDate,
            null);
    }

    public int Id { get; private set; }
    public Guid PublicId { get; private set; }
    public string OfferNumber { get; private set; } = string.Empty;
    public int EmploymentApplicationId { get; private set; }
    public int PositionId { get; private set; }
    public int BranchId { get; private set; }
    public int DepartmentId { get; private set; }
    public int? DivisionId { get; private set; }
    public decimal BaseSalary { get; private set; }
    public string CurrencyCode { get; private set; } = string.Empty;
    public PayFrequency PayFrequency { get; private set; }
    public EmploymentType EmploymentType { get; private set; }
    public WorkArrangement WorkArrangement { get; private set; }
    public DateOnly ProposedStartDate { get; private set; }
    public string? TermsAndConditions { get; private set; }
    public JobOfferStatus Status { get; private set; } = JobOfferStatus.Draft;
    public DateTimeOffset? IssuedOn { get; private set; }
    public DateTimeOffset? ExpiresOn { get; private set; }
    public DateTimeOffset? RespondedOn { get; private set; }
    public string? ResponseReason { get; private set; }

    public void UpdateTerms(
        decimal baseSalary,
        string currencyCode,
        PayFrequency payFrequency,
        EmploymentType employmentType,
        WorkArrangement workArrangement,
        DateOnly proposedStartDate,
        string? termsAndConditions)
    {
        EnsureStatus(JobOfferStatus.Draft);
        SetTerms(
            baseSalary,
            currencyCode,
            payFrequency,
            employmentType,
            workArrangement,
            proposedStartDate,
            termsAndConditions);
    }

    public void Issue(DateTimeOffset issuedOn, DateTimeOffset expiresOn)
    {
        EnsureStatus(JobOfferStatus.Draft);

        if (expiresOn <= issuedOn)
        {
            throw new DomainRuleException(
                "Recruitment.JobOffer.InvalidExpiry",
                "The offer expiry must be later than its issue date.");
        }

        IssuedOn = issuedOn;
        ExpiresOn = expiresOn;
        Status = JobOfferStatus.Issued;
    }

    public void Accept(DateTimeOffset respondedOn)
    {
        EnsureIssuedAndNotExpired(respondedOn);
        Status = JobOfferStatus.Accepted;
        RespondedOn = respondedOn;
        ResponseReason = null;
    }

    public void Decline(string reason, DateTimeOffset respondedOn)
    {
        EnsureIssuedAndNotExpired(respondedOn);
        var normalizedReason = Required(reason, nameof(reason));
        Status = JobOfferStatus.Declined;
        RespondedOn = respondedOn;
        ResponseReason = normalizedReason;
    }

    public void Withdraw(string reason, DateTimeOffset withdrawnOn)
    {
        EnsureStatus(JobOfferStatus.Issued);
        var normalizedReason = Required(reason, nameof(reason));
        Status = JobOfferStatus.Withdrawn;
        RespondedOn = withdrawnOn;
        ResponseReason = normalizedReason;
    }

    public void Expire(DateTimeOffset expiredOn)
    {
        EnsureStatus(JobOfferStatus.Issued);

        if (!ExpiresOn.HasValue || expiredOn < ExpiresOn.Value)
        {
            throw new DomainRuleException(
                "Recruitment.JobOffer.NotExpired",
                "The offer cannot expire before its configured expiry date.");
        }

        Status = JobOfferStatus.Expired;
        RespondedOn = expiredOn;
    }

    private void EnsureIssuedAndNotExpired(DateTimeOffset respondedOn)
    {
        EnsureStatus(JobOfferStatus.Issued);

        if (IssuedOn.HasValue && respondedOn < IssuedOn.Value)
        {
            throw new DomainRuleException(
                "Recruitment.JobOffer.InvalidResponseTime",
                "The offer response cannot be earlier than the issue date.");
        }

        if (ExpiresOn.HasValue && respondedOn > ExpiresOn.Value)
        {
            throw new DomainRuleException(
                "Recruitment.JobOffer.Expired",
                "The offer has expired and can no longer receive a response.");
        }
    }

    private void EnsureStatus(JobOfferStatus expected)
    {
        if (Status != expected)
        {
            throw new DomainRuleException(
                "Recruitment.JobOffer.InvalidStatusTransition",
                $"The operation requires {expected}, but the offer status is {Status}.");
        }
    }

    private void SetTerms(
        decimal baseSalary,
        string currencyCode,
        PayFrequency payFrequency,
        EmploymentType employmentType,
        WorkArrangement workArrangement,
        DateOnly proposedStartDate,
        string? termsAndConditions)
    {
        var normalizedSalary = NonNegative(baseSalary, nameof(baseSalary));
        var normalizedCurrency = NormalizeCurrencyCode(currencyCode, nameof(currencyCode));
        var normalizedPayFrequency = Defined(payFrequency, nameof(payFrequency));
        var normalizedEmploymentType = Defined(employmentType, nameof(employmentType));
        var normalizedWorkArrangement = Defined(workArrangement, nameof(workArrangement));

        BaseSalary = normalizedSalary;
        CurrencyCode = normalizedCurrency;
        PayFrequency = normalizedPayFrequency;
        EmploymentType = normalizedEmploymentType;
        WorkArrangement = normalizedWorkArrangement;
        ProposedStartDate = proposedStartDate;
        TermsAndConditions = Optional(termsAndConditions);
    }

}
