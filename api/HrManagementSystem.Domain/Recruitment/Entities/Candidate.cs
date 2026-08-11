using HrManagementSystem.Domain.Common.Exceptions;
using static HrManagementSystem.Domain.Common.Guards.DomainGuard;

namespace HrManagementSystem.Domain.Recruitment.Entities;

public sealed class Candidate : TenantAuditableEntity
{
    private Candidate()
    {
    }

    public Candidate(string firstName, string lastName, string email, string? phoneNumber = null)
    {
        PublicId = Guid.NewGuid();
        UpdateIdentity(firstName, null, lastName);
        UpdateContact(email, phoneNumber);
    }

    public int Id { get; private set; }
    public Guid PublicId { get; private set; }
    public string? PortalUserId { get; private set; }
    public string FirstName { get; private set; } = string.Empty;
    public string? MiddleName { get; private set; }
    public string LastName { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string? PhoneNumber { get; private set; }
    public DateOnly? DateOfBirth { get; private set; }
    public int? NationalityCountryId { get; private set; }
    public int? CurrentCountryId { get; private set; }
    public int? CurrentStateId { get; private set; }
    public string? City { get; private set; }
    public string? LinkedInUrl { get; private set; }
    public string? PortfolioUrl { get; private set; }
    public int? ResumeFileId { get; private set; }
    public DateTimeOffset? ConsentGrantedOn { get; private set; }
    public string? PrivacyPolicyVersion { get; private set; }
    public bool IsActive { get; private set; } = true;

    public string FullName => string.Join(
        ' ',
        new[] { FirstName, MiddleName, LastName }.Where(value => !string.IsNullOrWhiteSpace(value)));

    public void LinkPortalAccount(string portalUserId)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(portalUserId);

        if (PortalUserId is not null && !string.Equals(PortalUserId, portalUserId, StringComparison.Ordinal))
        {
            throw new DomainRuleException(
                "Recruitment.Candidate.PortalAccountAlreadyLinked",
                "The candidate is already linked to another portal account.");
        }

        PortalUserId = portalUserId.Trim();
    }

    public void UpdateIdentity(
        string firstName,
        string? middleName,
        string lastName,
        DateOnly? dateOfBirth = null,
        int? nationalityCountryId = null)
    {
        var normalizedFirstName = Required(firstName, nameof(firstName));
        var normalizedMiddleName = Optional(middleName);
        var normalizedLastName = Required(lastName, nameof(lastName));
        var normalizedNationalityCountryId = PositiveOrNull(nationalityCountryId, nameof(nationalityCountryId));

        FirstName = normalizedFirstName;
        MiddleName = normalizedMiddleName;
        LastName = normalizedLastName;
        DateOfBirth = dateOfBirth;
        NationalityCountryId = normalizedNationalityCountryId;
    }

    public void UpdateContact(string email, string? phoneNumber)
    {
        Email = Required(email, nameof(email)).ToLowerInvariant();
        PhoneNumber = Optional(phoneNumber);
    }

    public void UpdateLocation(int? countryId, int? stateId, string? city)
    {
        var normalizedCountryId = PositiveOrNull(countryId, nameof(countryId));
        var normalizedStateId = PositiveOrNull(stateId, nameof(stateId));

        CurrentCountryId = normalizedCountryId;
        CurrentStateId = normalizedStateId;
        City = Optional(city);
    }

    public void UpdateProfessionalProfile(string? linkedInUrl, string? portfolioUrl, int? resumeFileId)
    {
        var normalizedResumeFileId = PositiveOrNull(resumeFileId, nameof(resumeFileId));

        LinkedInUrl = Optional(linkedInUrl);
        PortfolioUrl = Optional(portfolioUrl);
        ResumeFileId = normalizedResumeFileId;
    }

    public void RecordPrivacyConsent(string privacyPolicyVersion, DateTimeOffset grantedOn)
    {
        PrivacyPolicyVersion = Required(privacyPolicyVersion, nameof(privacyPolicyVersion));
        ConsentGrantedOn = grantedOn;
    }

    public void Activate() => IsActive = true;

    public void Deactivate() => IsActive = false;

}
