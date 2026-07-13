using System.Text.Json;
using HrManagementSystem.Features.Platform.Notifications.Contracts;
using HrManagementSystem.Features.Platform.Notifications.Entities;

namespace HrManagementSystem.Features.Platform.Notifications.Mapping;

public sealed class NotificationMappingConfig : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<Notification, NotificationResponse>()
            .Map(response => response.Parameters,
                notification => NotificationParameters.Deserialize(notification.ParametersJson));

        config.NewConfig<Notification, NotificationRealtimeResponse>()
            .Map(response => response.Parameters,
                notification => NotificationParameters.Deserialize(notification.ParametersJson));
    }
}

public static class NotificationParameters
{
    private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web);

    public static string Serialize(IReadOnlyDictionary<string, string>? parameters)
    {
        return JsonSerializer.Serialize(parameters ?? new Dictionary<string, string>(), SerializerOptions);
    }

    public static IReadOnlyDictionary<string, string> Deserialize(string json)
    {
        if (string.IsNullOrWhiteSpace(json))
            return new Dictionary<string, string>();

        try
        {
            return JsonSerializer.Deserialize<Dictionary<string, string>>(json, SerializerOptions)
                   ?? new Dictionary<string, string>();
        }
        catch (JsonException)
        {
            return new Dictionary<string, string>();
        }
    }
}
