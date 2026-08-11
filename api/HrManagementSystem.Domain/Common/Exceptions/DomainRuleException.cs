namespace HrManagementSystem.Domain.Common.Exceptions;

public sealed class DomainRuleException(string code, string message) : InvalidOperationException(message)
{
    public string Code { get; } = code;
}
