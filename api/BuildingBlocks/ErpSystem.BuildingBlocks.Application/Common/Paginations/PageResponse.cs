namespace ErpSystem.BuildingBlocks.Application.Common.Paginations;

public sealed record PageResponse<T>(
    IReadOnlyList<T> Items,
    MetaData MetaData);
