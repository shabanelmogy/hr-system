namespace HrManagementSystem.Application.Features.Security.Users.Errors
{
    public class UserErrors(IStringLocalizer<UserErrors> localizer)
    {
        private readonly IStringLocalizer<UserErrors> _localizer = localizer;

        public Error InvalidCredentials =>
            new("User.InvalidCredentials", _localizer[nameof(InvalidCredentials)], ErrorType.Validation);

        public Error DisabledUser =>
            new("User.DisabledUser", _localizer[nameof(DisabledUser)], ErrorType.Validation);

        public Error LockedUser =>
            new("User.LockedUser", _localizer[nameof(LockedUser)], ErrorType.Validation);

        public Error InvalidJwtToken =>
            new("User.InvalidJwtToken", _localizer[nameof(InvalidJwtToken)], ErrorType.Unauthorized);

        public Error InvalidRefreshToken =>
            new("User.InvalidRefreshToken", _localizer[nameof(InvalidRefreshToken)], ErrorType.Unauthorized);

        public Error RefreshTokenAlreadyRotated =>
            new("User.RefreshTokenAlreadyRotated", _localizer[nameof(RefreshTokenAlreadyRotated)], ErrorType.Conflict);

        public Error RefreshTokenUpdateConflict =>
            new("User.RefreshTokenUpdateConflict", _localizer[nameof(RefreshTokenUpdateConflict)], ErrorType.Conflict);

        public Error SessionRevocationFailed =>
            new("User.SessionRevocationFailed", _localizer[nameof(SessionRevocationFailed)], ErrorType.Unexpected);

        public Error NoCompanyAccess =>
            new("User.NoCompanyAccess", _localizer[nameof(NoCompanyAccess)], ErrorType.Forbidden);

        public Error InvalidCompanySelection =>
            new("User.InvalidCompanySelection", _localizer[nameof(InvalidCompanySelection)], ErrorType.Validation);

        public Error DuplicatedEmail =>
            new("User.DuplicatedEmail", _localizer[nameof(DuplicatedEmail)], ErrorType.Conflict);

        public Error DuplicatedUserName =>
            new("User.DuplicatedUserName", _localizer[nameof(DuplicatedUserName)], ErrorType.Conflict);

        public Error EmailNotConfirmed =>
            new("User.EmailNotConfirmed", _localizer[nameof(EmailNotConfirmed)], ErrorType.Validation);

        public Error InvalidCode =>
            new("User.InvalidCode", _localizer[nameof(InvalidCode)], ErrorType.Validation);

        public Error DuplicatedConfirmation =>
            new("User.DuplicatedConfirmation", _localizer[nameof(DuplicatedConfirmation)], ErrorType.Conflict);

        public Error UserNotFound =>
        new("User.UserNotFound", _localizer[nameof(UserNotFound)], ErrorType.NotFound);

        public Error ProfilePictureRequired =>
            new("User.ProfilePictureRequired", _localizer[nameof(ProfilePictureRequired)], ErrorType.Validation);

        public Error InvalidProfilePicture =>
            new("User.InvalidProfilePicture", _localizer[nameof(InvalidProfilePicture)], ErrorType.Validation);

        public Error InvalidRoles =>
            new("Role.InvalidRoles", _localizer[nameof(InvalidRoles)], ErrorType.Validation);

        public Error AdminSeatLimitReached =>
            new("Tenant.AdminSeatLimitReached", _localizer[nameof(AdminSeatLimitReached)], ErrorType.Conflict);

        public Error UserSeatLimitReached =>
            new("Tenant.UserSeatLimitReached", _localizer[nameof(UserSeatLimitReached)], ErrorType.Conflict);

        public Error NoActiveRefreshTokens =>
            new("Role.InvalidRoles", _localizer[nameof(NoActiveRefreshTokens)], ErrorType.Validation);

        public Error UpdateFailed =>
            new("Role.InvalidRoles", _localizer[nameof(UpdateFailed)], ErrorType.Validation);
    }
}
