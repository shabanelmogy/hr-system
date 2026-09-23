import type { AccountTreeItem, AccountTreeNode } from "../types/coaHierarchy";

export function flattenAccountTree(
  nodes: readonly AccountTreeNode[],
  parentAccountId: number | null = null,
): AccountTreeItem[] {
  return nodes.flatMap((node) => [
    {
      id: node.id,
      code: node.code,
      nameAr: node.nameAr,
      nameEn: node.nameEn,
      allowPosting: node.allowPosting,
      parentAccountId,
    },
    ...flattenAccountTree(node.children, node.id),
  ]);
}
