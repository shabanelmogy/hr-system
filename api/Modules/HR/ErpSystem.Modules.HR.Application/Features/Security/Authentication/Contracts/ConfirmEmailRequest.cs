namespace ErpSystem.Modules.HR.Application.Features.Security.Authentication.Contracts
{
    public record ConfirmEmailRequest(
        string UserId,
        string Code
    );
}