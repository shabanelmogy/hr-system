namespace HrManagementSystem.Features.Security.Users.Errors
{
    public class UserErrors(IStringLocalizer<UserErrors> localizer)
    {
        private readonly IStringLocalizer<UserErrors> _localizer = localizer;

        public Error InvalidCredentials =>
            new("User.InvalidCredentials", _localizer[nameof(InvalidCredentials)], StatusCodes.Status400BadRequest);

        public Error DisabledUser =>
            new("User.DisabledUser", _localizer[nameof(DisabledUser)], StatusCodes.Status400BadRequest);

        public Error LockedUser =>
            new("User.LockedUser", _localizer[nameof(LockedUser)], StatusCodes.Status400BadRequest);

        public Error InvalidJwtToken =>
            new("User.InvalidJwtToken", _localizer[nameof(InvalidJwtToken)], StatusCodes.Status400BadRequest);

        public Error InvalidRefreshToken =>
            new("User.InvalidRefreshToken", _localizer[nameof(InvalidRefreshToken)], StatusCodes.Status400BadRequest);

        public Error DuplicatedEmail =>
            new("User.DuplicatedEmail", _localizer[nameof(DuplicatedEmail)], StatusCodes.Status409Conflict);

        public Error DuplicatedUserName =>
            new("User.DuplicatedUserName", _localizer[nameof(DuplicatedUserName)], StatusCodes.Status409Conflict);

        public Error EmailNotConfirmed =>
            new("User.EmailNotConfirmed", _localizer[nameof(EmailNotConfirmed)], StatusCodes.Status400BadRequest);

        public Error InvalidCode =>
            new("User.InvalidCode", _localizer[nameof(InvalidCode)], StatusCodes.Status400BadRequest);

        public Error DuplicatedConfirmation =>
            new("User.DuplicatedConfirmation", _localizer[nameof(DuplicatedConfirmation)], StatusCodes.Status409Conflict);

        public Error UserNotFound =>
        new("User.UserNotFound", _localizer[nameof(UserNotFound)], StatusCodes.Status404NotFound);

        public Error ProfilePictureRequired =>
            new("User.ProfilePictureRequired", _localizer[nameof(ProfilePictureRequired)], StatusCodes.Status400BadRequest);

        public Error InvalidProfilePicture =>
            new("User.InvalidProfilePicture", _localizer[nameof(InvalidProfilePicture)], StatusCodes.Status400BadRequest);

        public Error InvalidRoles =>
            new("Role.InvalidRoles", _localizer[nameof(InvalidRoles)], StatusCodes.Status400BadRequest);

        public Error NoActiveRefreshTokens =>
            new("Role.InvalidRoles", _localizer[nameof(NoActiveRefreshTokens)], StatusCodes.Status400BadRequest);

        public Error UpdateFailed =>
            new("Role.InvalidRoles", _localizer[nameof(UpdateFailed)], StatusCodes.Status400BadRequest);
    }
}
