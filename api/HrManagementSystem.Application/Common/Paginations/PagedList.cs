namespace HrManagementSystem.Application.Common.Paginations
{
    //When Inherit From List<T>
    //1.Add Indexing To Class
    //2.Return Only List And can access metadata to add in headers

    public class PagedList<T> : List<T>
    {
        public MetaData MetaData { get; set; }

        public PagedList(List<T> items, int count, int pageNumber, int pageSize)
        {
            ArgumentNullException.ThrowIfNull(items);
            ArgumentOutOfRangeException.ThrowIfNegative(count);
            ArgumentOutOfRangeException.ThrowIfLessThan(pageNumber, 1);
            ArgumentOutOfRangeException.ThrowIfLessThan(pageSize, 1);
            ArgumentOutOfRangeException.ThrowIfGreaterThan(pageSize, PaginationRequest.MaxPageSize);

            MetaData = new()
            {
                TotalCount = count,
                PageNumber = pageNumber,
                PageSize = pageSize,
                CurrentPage = pageNumber,
                TotalPages = (int)Math.Ceiling(count / (double)pageSize)
            };
            AddRange(items);
        }
    }
}
