namespace ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Storage;

internal static class BoundedHttpContentReader
{
    public static async Task<byte[]?> ReadAsync(
        HttpContent content,
        long maximumBytes,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(content);
        if (maximumBytes <= 0)
            return null;

        if (content.Headers.ContentLength is > 0 and var declaredLength &&
            declaredLength > maximumBytes)
            return null;

        await using var source = await content.ReadAsStreamAsync(cancellationToken);
        using var destination = new MemoryStream();
        var buffer = new byte[81920];
        long total = 0;

        while (true)
        {
            var read = await source.ReadAsync(buffer.AsMemory(0, buffer.Length), cancellationToken);
            if (read == 0)
                break;

            total += read;
            if (total > maximumBytes)
                return null;

            await destination.WriteAsync(buffer.AsMemory(0, read), cancellationToken);
        }

        return destination.ToArray();
    }
}
