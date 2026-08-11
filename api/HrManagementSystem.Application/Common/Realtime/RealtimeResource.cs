using System.Collections.Concurrent;
using System.Reflection;
using System.Text;

namespace HrManagementSystem.Application.Common.Realtime;

[AttributeUsage(AttributeTargets.Class, Inherited = false)]
public sealed class RealtimeResourceNameAttribute(string name) : Attribute
{
    public string Name { get; } = name;
}

public static class RealtimeResource
{
    private static readonly ConcurrentDictionary<Type, string> Names = new();

    public static string For<TEntity>() => For(typeof(TEntity));

    public static string For(Type entityType)
    {
        ArgumentNullException.ThrowIfNull(entityType);
        return Names.GetOrAdd(entityType, CreateName);
    }

    private static string CreateName(Type entityType)
    {
        var configuredName = entityType
            .GetCustomAttribute<RealtimeResourceNameAttribute>()?
            .Name
            .Trim();

        var name = string.IsNullOrWhiteSpace(configuredName)
            ? PluralizeLastWord(ToKebabCase(entityType.Name))
            : configuredName;

        if (!IsValid(name))
        {
            throw new InvalidOperationException(
                $"Realtime resource name '{name}' for '{entityType.FullName}' must use lowercase letters, numbers, and single hyphens.");
        }

        return name;
    }

    private static string ToKebabCase(string value)
    {
        var builder = new StringBuilder(value.Length + 8);

        for (var index = 0; index < value.Length; index++)
        {
            var current = value[index];
            var previousIsLowerOrDigit = index > 0 &&
                (char.IsLower(value[index - 1]) || char.IsDigit(value[index - 1]));
            var startsWordAfterAcronym = index > 0 &&
                char.IsUpper(value[index - 1]) &&
                index + 1 < value.Length &&
                char.IsLower(value[index + 1]);

            if (char.IsUpper(current) && (previousIsLowerOrDigit || startsWordAfterAcronym))
                builder.Append('-');

            builder.Append(char.ToLowerInvariant(current));
        }

        return builder.ToString();
    }

    private static string PluralizeLastWord(string value)
    {
        var separatorIndex = value.LastIndexOf('-');
        var prefix = separatorIndex >= 0 ? value[..(separatorIndex + 1)] : string.Empty;
        var word = separatorIndex >= 0 ? value[(separatorIndex + 1)..] : value;

        if (word.EndsWith('y') &&
            word.Length > 1 &&
            !IsVowel(word[^2]))
        {
            return $"{prefix}{word[..^1]}ies";
        }

        if (word.EndsWith('s') ||
            word.EndsWith('x') ||
            word.EndsWith('z') ||
            word.EndsWith("ch", StringComparison.Ordinal) ||
            word.EndsWith("sh", StringComparison.Ordinal))
        {
            return $"{prefix}{word}es";
        }

        return $"{prefix}{word}s";
    }

    private static bool IsVowel(char value) => value is 'a' or 'e' or 'i' or 'o' or 'u';

    private static bool IsValid(string value)
    {
        if (string.IsNullOrWhiteSpace(value) || value[0] == '-' || value[^1] == '-')
            return false;

        var previousWasHyphen = false;
        foreach (var character in value)
        {
            if (character == '-')
            {
                if (previousWasHyphen)
                    return false;

                previousWasHyphen = true;
                continue;
            }

            if (character is not (>= 'a' and <= 'z') and not (>= '0' and <= '9'))
                return false;

            previousWasHyphen = false;
        }

        return true;
    }
}
