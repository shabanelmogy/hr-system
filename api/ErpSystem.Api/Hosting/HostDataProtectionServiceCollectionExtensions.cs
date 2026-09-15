using System.Security.Cryptography.X509Certificates;
using System.Security.Cryptography;
using Microsoft.AspNetCore.DataProtection;

namespace ErpSystem.Api.Hosting;

public static class HostDataProtectionServiceCollectionExtensions
{
    public static IServiceCollection AddHostDataProtection(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(services);
        ArgumentNullException.ThrowIfNull(configuration);

        var settings = configuration
            .GetSection(HostDataProtectionSettings.SectionName)
            .Get<HostDataProtectionSettings>() ?? new HostDataProtectionSettings();
        if (!settings.IsValid(out _))
            throw new InvalidOperationException("DataProtection settings are invalid.");

        var dataProtection = services.AddDataProtection()
            .SetApplicationName(settings.ApplicationName);

        if (!string.IsNullOrWhiteSpace(settings.KeyRingDirectory))
        {
            try
            {
                dataProtection.PersistKeysToFileSystem(
                    new DirectoryInfo(Path.GetFullPath(settings.KeyRingDirectory)));
            }
            catch (Exception exception) when (exception is ArgumentException or IOException or NotSupportedException)
            {
                throw new InvalidOperationException("DataProtection:KeyRingDirectory is invalid or unavailable.");
            }
        }

        if (!string.IsNullOrWhiteSpace(settings.ProtectionCertificatePath))
        {
            var certificate = LoadProtectionCertificate(
                settings.ProtectionCertificatePath,
                settings.ProtectionCertificatePassword!,
                requireCurrent: true);
            dataProtection.ProtectKeysWithCertificate(certificate);
        }

        if (settings.PreviousProtectionCertificates.Count > 0)
        {
            var previousCertificates = settings.PreviousProtectionCertificates
                .Select(item => LoadProtectionCertificate(item.Path!, item.Password!, requireCurrent: false))
                .ToArray();
            dataProtection.UnprotectKeysWithAnyCertificate(previousCertificates);
        }

        return services;
    }

    private static X509Certificate2 LoadProtectionCertificate(string path, string password, bool requireCurrent)
    {
        X509Certificate2 certificate;
        try
        {
            certificate = X509CertificateLoader.LoadPkcs12FromFile(
                path,
                password,
                X509KeyStorageFlags.EphemeralKeySet);
        }
        catch (Exception exception) when (exception is CryptographicException or IOException or ArgumentException)
        {
            // The underlying exception may include details about supplied secrets;
            // only the setting name and exception type are safe diagnostics.
            throw new InvalidOperationException(
                $"DataProtection:ProtectionCertificatePath could not be loaded ({exception.GetType().Name}).");
        }

        var now = DateTime.UtcNow;
        if (!certificate.HasPrivateKey ||
            (requireCurrent && (now < certificate.NotBefore.ToUniversalTime() ||
                                now >= certificate.NotAfter.ToUniversalTime())))
        {
            certificate.Dispose();
            throw new InvalidOperationException(
                "DataProtection:ProtectionCertificatePath must contain a current certificate with its private key.");
        }

        return certificate;
    }
}
