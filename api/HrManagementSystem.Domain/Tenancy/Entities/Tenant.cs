using static HrManagementSystem.Domain.Common.Guards.DomainGuard;
using HrManagementSystem.Domain.Tenancy.Enums;

namespace HrManagementSystem.Domain.Tenancy.Entities;

public sealed class Tenant
{
    private Tenant()
    {
    }

    public Tenant(string id, string identifier, string name, DateTime createdOn)
    {
        Id = Required(id, nameof(id));
        Identifier = Required(identifier, nameof(identifier));
        Name = Required(name, nameof(name));
        CreatedOn = createdOn;
        IsActive = true;
        SubscriptionStatus = HrManagementSystem.Domain.Tenancy.Enums.SubscriptionStatus.Free;
        SubscriptionStartedOn = createdOn;
        MaxAdmins = 1;
        MaxUsers = 5;
    }

    public string Id { get; private set; } = string.Empty;
    public string Identifier { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public bool IsActive { get; private set; }
    public DateTime CreatedOn { get; private set; }
    public SubscriptionStatus SubscriptionStatus { get; private set; }
    public DateTime SubscriptionStartedOn { get; private set; }
    public DateTime? SubscriptionEndsOn { get; private set; }
    public string? PlanName { get; private set; }
    public int MaxAdmins { get; private set; }
    public int MaxUsers { get; private set; }
    public string? BillingEmail { get; private set; }
    public string? ContactName { get; private set; }
    public string? ContactPhone { get; private set; }
    public string? Notes { get; private set; }
    public DateTime? UpdatedOn { get; private set; }

    public void Rename(string name) => Name = Required(name, nameof(name));

    public void ChangeIdentifier(string identifier) =>
        Identifier = Required(identifier, nameof(identifier));

    public void Activate() => IsActive = true;

    public void Deactivate() => IsActive = false;

    public void UpdateSubscription(
        string name,
        bool isActive,
        SubscriptionStatus status,
        DateTime startedOn,
        DateTime? endsOn,
        string? planName,
        int maxAdmins,
        int maxUsers,
        string? billingEmail,
        string? contactName,
        string? contactPhone,
        string? notes,
        DateTime updatedOn)
    {
        if (endsOn.HasValue && endsOn.Value < startedOn)
            throw new ArgumentException("Subscription end date cannot be before its start date.", nameof(endsOn));
        if (maxAdmins < 1)
            throw new ArgumentOutOfRangeException(nameof(maxAdmins));
        if (maxUsers < 0)
            throw new ArgumentOutOfRangeException(nameof(maxUsers));

        Rename(name);
        IsActive = isActive;
        SubscriptionStatus = status;
        SubscriptionStartedOn = startedOn;
        SubscriptionEndsOn = endsOn;
        PlanName = Optional(planName);
        MaxAdmins = maxAdmins;
        MaxUsers = maxUsers;
        BillingEmail = Optional(billingEmail);
        ContactName = Optional(contactName);
        ContactPhone = Optional(contactPhone);
        Notes = Optional(notes);
        UpdatedOn = updatedOn;
    }

    private static string? Optional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
