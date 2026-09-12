namespace ErpSystem.Modules.Contacts.Domain;

public sealed class Party
{
    private Party()
    {
    }

    private Party(
        Guid id,
        string tenantId,
        int companyId,
        string displayName,
        string? email,
        string? phone,
        DateTimeOffset createdOnUtc)
    {
        Id = id;
        TenantId = Required(tenantId, nameof(tenantId));
        CompanyId = Positive(companyId, nameof(companyId));
        ApplyContactDetails(displayName, email, phone);
        CreatedOnUtc = createdOnUtc.ToUniversalTime();
    }

    public Guid Id { get; private set; }

    public string TenantId { get; private set; } = string.Empty;

    public int CompanyId { get; private set; }

    public string DisplayName { get; private set; } = string.Empty;

    public string? Email { get; private set; }

    public string? Phone { get; private set; }

    public DateTimeOffset CreatedOnUtc { get; private set; }

    public DateTimeOffset? UpdatedOnUtc { get; private set; }

    public byte[] RowVersion { get; private set; } = [];

    public static Party Create(
        Guid id,
        string tenantId,
        int companyId,
        string displayName,
        string? email,
        string? phone,
        DateTimeOffset createdOnUtc)
    {
        if (id == Guid.Empty)
            throw new ArgumentException("Party id must not be empty.", nameof(id));

        return new Party(id, tenantId, companyId, displayName, email, phone, createdOnUtc);
    }

    public void Update(
        string displayName,
        string? email,
        string? phone,
        DateTimeOffset updatedOnUtc)
    {
        ApplyContactDetails(displayName, email, phone);
        UpdatedOnUtc = updatedOnUtc.ToUniversalTime();
    }

    private void ApplyContactDetails(string displayName, string? email, string? phone)
    {
        DisplayName = Required(displayName, nameof(displayName));
        Email = Optional(email);
        Phone = Optional(phone);
    }

    private static string Required(string value, string parameterName)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(value, parameterName);
        return value.Trim();
    }

    private static int Positive(int value, string parameterName) =>
        value > 0
            ? value
            : throw new ArgumentOutOfRangeException(parameterName, "Value must be positive.");

    private static string? Optional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
