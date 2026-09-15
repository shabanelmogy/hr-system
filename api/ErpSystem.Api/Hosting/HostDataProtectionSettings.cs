namespace ErpSystem.Api.Hosting;

public sealed class HostDataProtectionSettings
{
    public const string SectionName = "DataProtection";

    public string ApplicationName { get; set; } = "ErpSystem";
    public string? KeyRingDirectory { get; set; }
    public string? ProtectionCertificatePath { get; set; }
    public string? ProtectionCertificatePassword { get; set; }
    public List<HostDataProtectionCertificateSettings> PreviousProtectionCertificates { get; set; } = [];
    public bool SharedKeyRing { get; set; }

    public bool IsValid(out string error)
    {
        if (string.IsNullOrWhiteSpace(ApplicationName) ||
            ApplicationName.Length > 128 ||
            ApplicationName.Any(char.IsControl))
        {
            error = "DataProtection:ApplicationName must be a non-empty stable value no longer than 128 characters.";
            return false;
        }

        if (HasUnsafeCharacters(KeyRingDirectory) ||
            HasUnsafeCharacters(ProtectionCertificatePath))
        {
            error = "DataProtection paths must not contain control characters.";
            return false;
        }

        if (!string.IsNullOrWhiteSpace(KeyRingDirectory) && !Path.IsPathFullyQualified(KeyRingDirectory))
        {
            error = "DataProtection:KeyRingDirectory must be an absolute path.";
            return false;
        }

        if (!string.IsNullOrWhiteSpace(ProtectionCertificatePath) && !Path.IsPathFullyQualified(ProtectionCertificatePath))
        {
            error = "DataProtection:ProtectionCertificatePath must be an absolute path.";
            return false;
        }

        var hasCertificatePath = !string.IsNullOrWhiteSpace(ProtectionCertificatePath);
        var hasCertificatePassword = !string.IsNullOrWhiteSpace(ProtectionCertificatePassword);
        if (hasCertificatePath != hasCertificatePassword)
        {
            error = "DataProtection certificate path and password must be configured together.";
            return false;
        }

        if (PreviousProtectionCertificates is null)
        {
            error = "DataProtection previous certificates cannot be null.";
            return false;
        }

        foreach (var previousCertificate in PreviousProtectionCertificates)
        {
            if (!previousCertificate.IsValid(out error))
                return false;
        }

        error = string.Empty;
        return true;
    }

    private static bool HasUnsafeCharacters(string? value) =>
        value is not null && value.Any(char.IsControl);
}

public sealed class HostDataProtectionCertificateSettings
{
    public string? Path { get; set; }
    public string? Password { get; set; }

    public bool IsValid(out string error)
    {
        if (string.IsNullOrWhiteSpace(Path) || !System.IO.Path.IsPathFullyQualified(Path) || Path.Any(char.IsControl))
        {
            error = "DataProtection previous certificate paths must be absolute and free of control characters.";
            return false;
        }

        if (string.IsNullOrWhiteSpace(Password))
        {
            error = "DataProtection previous certificate paths and passwords must be configured together.";
            return false;
        }

        error = string.Empty;
        return true;
    }
}
