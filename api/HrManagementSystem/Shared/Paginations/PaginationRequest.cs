namespace HrManagementSystem.Shared.Paginations
{
    public record PaginationRequest
    {
        public const int MaxPageSize = 50;

        public int PageNumber { get; init; } = 1;

        private int _pageSize = 10;

        public int PageSize
        {
            get => _pageSize;
            init => _pageSize = value;
        }
        public string? ColumnName { get; init; }

        /// <summary>
        /// Enter Filter Types => Contains | StartsWith  | EndsWith  | Equals => (Not Case Sensitive)
        /// </summary>
        /// 
        public string? Operation { get; init; } = "Contains";

        /// <summary>
        /// Enter ASC OR DESC => (Not Case Sensitive)
        /// </summary>
        public string? SortDirection { get; init; } = "ASC";
        public string? SearchValue { get; init; }
    }

    public sealed class PaginationRequestValidator : AbstractValidator<PaginationRequest>
    {
        private static readonly string[] AllowedOperations = ["Contains", "StartsWith", "EndsWith", "Equals"];
        private static readonly string[] AllowedSortDirections = ["ASC", "DESC"];

        public PaginationRequestValidator(IStringLocalizer<PaginationRequest> localizer)
        {
            RuleFor(request => request.PageNumber)
                .GreaterThan(0)
                .WithMessage(localizer[Strings.GreaterThanZero]);

            RuleFor(request => request.PageSize)
                .InclusiveBetween(1, PaginationRequest.MaxPageSize)
                .WithMessage(localizer[Strings.InvalidValues]);

            RuleFor(request => request.Operation)
                .Must(operation => operation is null || AllowedOperations.Contains(operation, StringComparer.OrdinalIgnoreCase))
                .WithMessage(localizer[Strings.InvalidValues]);

            RuleFor(request => request.SortDirection)
                .Must(direction => direction is null || AllowedSortDirections.Contains(direction, StringComparer.OrdinalIgnoreCase))
                .WithMessage(localizer[Strings.InvalidValues]);

            RuleFor(request => request.ColumnName)
                .Matches("^[A-Za-z_][A-Za-z0-9_]*$")
                .WithMessage(localizer[Strings.InvalidValues])
                .When(request => !string.IsNullOrWhiteSpace(request.ColumnName));
        }
    }


}
