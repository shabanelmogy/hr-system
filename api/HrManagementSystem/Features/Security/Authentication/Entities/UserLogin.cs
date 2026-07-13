namespace HrManagementSystem.Features.Security.Authentication.Entities;

public class UserLogin
{
    public string? Id { get; set; }
    public required string? UserId { get; set; }
    public ApplicationUser? User { get; set; }
    public required DateTime LoginDate { get; set; }
    public DateTime? LogOutDate { get; set; }
}
