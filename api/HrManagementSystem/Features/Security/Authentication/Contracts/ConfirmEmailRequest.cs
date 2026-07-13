namespace HrManagementSystem.Features.Security.Authentication.Contracts
{
    public record ConfirmEmailRequest(
        string UserId,
        string Code
    );
}