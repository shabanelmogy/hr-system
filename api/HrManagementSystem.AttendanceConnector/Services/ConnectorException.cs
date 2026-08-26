namespace HrManagementSystem.AttendanceConnector.Services;

public sealed class ConnectorException : Exception
{
    public ConnectorException(string code, string message, int statusCode, int? providerCode = null)
        : base(message)
    {
        Code = code;
        StatusCode = statusCode;
        ProviderCode = providerCode;
    }

    public string Code { get; }
    public int StatusCode { get; }
    public int? ProviderCode { get; }
}
