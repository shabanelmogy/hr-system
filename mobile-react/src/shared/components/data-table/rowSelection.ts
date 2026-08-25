export type AppDataTableRowKey = string | number;

export function toggleDataTableRowSelection(
  selectedRowKeys: readonly AppDataTableRowKey[],
  rowKey: AppDataTableRowKey,
) {
  const uniqueKeys = [...new Set(selectedRowKeys)];
  return uniqueKeys.includes(rowKey)
    ? uniqueKeys.filter((selectedKey) => selectedKey !== rowKey)
    : [...uniqueKeys, rowKey];
}
