using ErpSystem.BuildingBlocks.Application.Common.Paginations;

namespace ErpSystem.Modules.Platform.Application.Features.Platform.Notifications.Contracts;

public sealed class NotificationRequestValidator : AbstractValidator<NotificationQueryRequest>
{
    private static readonly string[] AllowedSortColumns = ["CreatedOn", "ReadOn", "Severity", "Category"];

    public NotificationRequestValidator(IStringLocalizer<NotificationQueryRequest> localizer)
    {
        RuleFor(request => request.PageNumber)
            .GreaterThan(0)
            .WithMessage(localizer[ValidationMessageKeys.GreaterThanZero]);

        RuleFor(request => request.PageSize)
            .InclusiveBetween(1, PaginationRequest.MaxPageSize)
            .WithMessage(localizer[ValidationMessageKeys.InvalidValues]);

        RuleFor(request => request.Status)
            .IsInEnum()
            .WithMessage(localizer[ValidationMessageKeys.InvalidValues]);

        RuleFor(request => request.Severity)
            .IsInEnum()
            .When(request => request.Severity.HasValue)
            .WithMessage(localizer[ValidationMessageKeys.InvalidValues]);

        RuleFor(request => request.Category)
            .MaximumLength(100)
            .Matches("^[A-Za-z][A-Za-z0-9._-]*$")
            .When(request => !string.IsNullOrWhiteSpace(request.Category))
            .WithMessage(localizer[ValidationMessageKeys.InvalidValues]);

        RuleFor(request => request.ColumnName)
            .Must(column => string.IsNullOrWhiteSpace(column) || AllowedSortColumns.Contains(column, StringComparer.OrdinalIgnoreCase))
            .WithMessage(localizer[ValidationMessageKeys.InvalidValues]);

        RuleFor(request => request.SortDirection)
            .Must(direction => string.IsNullOrWhiteSpace(direction) ||
                               direction.Equals("ASC", StringComparison.OrdinalIgnoreCase) ||
                               direction.Equals("DESC", StringComparison.OrdinalIgnoreCase))
            .WithMessage(localizer[ValidationMessageKeys.InvalidValues]);
    }
}
