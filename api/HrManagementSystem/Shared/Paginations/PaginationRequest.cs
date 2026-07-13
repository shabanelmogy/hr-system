namespace HrManagementSystem.Shared.Paginations
{
    //TODO : Add Values In appsettings.json
    public record PaginationRequest
    {
        const int maxPageSize = 50;

        public int PageNumber { get; init; } = 1;

        private int _pageSize = 10;

        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = (value > maxPageSize) ? maxPageSize : value;
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


}
