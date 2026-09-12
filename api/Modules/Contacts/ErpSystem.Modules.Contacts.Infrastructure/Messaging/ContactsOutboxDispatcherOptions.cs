using System.Globalization;
using Microsoft.Extensions.Configuration;

namespace ErpSystem.Modules.Contacts.Infrastructure.Messaging;

public sealed class ContactsOutboxDispatcherOptions
{
    public const string SectionName = "Modules:Contacts:Messaging:Outbox";

    public int BatchSize { get; set; } = 20;
    public int MaxAttempts { get; set; } = 8;
    public TimeSpan PollInterval { get; set; } = TimeSpan.FromSeconds(2);
    public TimeSpan ProcessingTimeout { get; set; } = TimeSpan.FromMinutes(5);
    public TimeSpan BaseRetryDelay { get; set; } = TimeSpan.FromSeconds(5);
    public TimeSpan MaxRetryDelay { get; set; } = TimeSpan.FromMinutes(5);
    public int MaxDeadRows { get; set; } = 0;
    public TimeSpan MaxDueBacklogAge { get; set; } = TimeSpan.FromMinutes(30);

    public static ContactsOutboxDispatcherOptions FromConfiguration(IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(configuration);

        var options = new ContactsOutboxDispatcherOptions();
        options.BatchSize = ReadInt(configuration, nameof(BatchSize), options.BatchSize);
        options.MaxAttempts = ReadInt(configuration, nameof(MaxAttempts), options.MaxAttempts);
        options.PollInterval = ReadTimeSpan(configuration, nameof(PollInterval), options.PollInterval);
        options.ProcessingTimeout = ReadTimeSpan(configuration, nameof(ProcessingTimeout), options.ProcessingTimeout);
        options.BaseRetryDelay = ReadTimeSpan(configuration, nameof(BaseRetryDelay), options.BaseRetryDelay);
        options.MaxRetryDelay = ReadTimeSpan(configuration, nameof(MaxRetryDelay), options.MaxRetryDelay);
        options.MaxDeadRows = ReadInt(configuration, nameof(MaxDeadRows), options.MaxDeadRows);
        options.MaxDueBacklogAge = ReadTimeSpan(configuration, nameof(MaxDueBacklogAge), options.MaxDueBacklogAge);
        options.Validate();
        return options;
    }

    public void Validate()
    {
        if (BatchSize <= 0)
            throw new InvalidOperationException("Contacts outbox BatchSize must be positive.");
        if (MaxAttempts <= 0)
            throw new InvalidOperationException("Contacts outbox MaxAttempts must be positive.");
        if (PollInterval <= TimeSpan.Zero)
            throw new InvalidOperationException("Contacts outbox PollInterval must be positive.");
        if (ProcessingTimeout <= TimeSpan.Zero)
            throw new InvalidOperationException("Contacts outbox ProcessingTimeout must be positive.");
        if (BaseRetryDelay <= TimeSpan.Zero)
            throw new InvalidOperationException("Contacts outbox BaseRetryDelay must be positive.");
        if (MaxRetryDelay < BaseRetryDelay)
            throw new InvalidOperationException("Contacts outbox MaxRetryDelay must not be less than BaseRetryDelay.");
        if (MaxDeadRows < 0)
            throw new InvalidOperationException("Contacts outbox MaxDeadRows must not be negative.");
        if (MaxDueBacklogAge <= TimeSpan.Zero)
            throw new InvalidOperationException("Contacts outbox MaxDueBacklogAge must be positive.");
    }

    private static int ReadInt(IConfiguration configuration, string name, int fallback)
    {
        var value = configuration[$"{SectionName}:{name}"];
        if (string.IsNullOrWhiteSpace(value))
            return fallback;
        if (int.TryParse(value, NumberStyles.Integer, CultureInfo.InvariantCulture, out var parsed))
            return parsed;
        throw new InvalidOperationException($"{SectionName}:{name} must be an integer.");
    }

    private static TimeSpan ReadTimeSpan(IConfiguration configuration, string name, TimeSpan fallback)
    {
        var value = configuration[$"{SectionName}:{name}"];
        if (string.IsNullOrWhiteSpace(value))
            return fallback;
        if (TimeSpan.TryParse(value, CultureInfo.InvariantCulture, out var parsed))
            return parsed;
        throw new InvalidOperationException($"{SectionName}:{name} must be a TimeSpan value.");
    }
}
