import type { ReactNode } from "react";

export interface TreeNode<T> {
  item: T;
  children: TreeNode<T>[];
}

export interface SplitTreeViewProps<T> {
  /** Array of items to build the tree from. */
  items: T[];
  /** Function to extract unique ID from an item. */
  getId: (item: T) => number | string;
  /** Function to extract parent ID from an item. Returns null/undefined/0 for root items. */
  getParentId: (item: T) => number | string | null | undefined;
  /** Function to extract code for tree-list variant. */
  getCode?: (item: T) => string;
  /** Function to extract primary name for tree-list variant. */
  getName?: (item: T, isAr: boolean) => string;
  /** Function to extract secondary name for tree-list variant. */
  getSecondaryName?: (item: T, isAr: boolean) => string;
  /** Function to extract isDeleted/status for tree-list variant. */
  getIsDeleted?: (item: T) => boolean;

  /** Visual variant: 'tree-list' (hierarchical list like accounting directory) or 'diagram' (2D canvas org chart). Default: 'tree-list'. */
  variant?: "tree-list" | "diagram";

  /** Function to test if item matches search term. */
  searchFilter?: (item: T, term: string) => boolean;

  /** Optional custom node card renderer (used when variant is 'diagram' or custom). */
  renderNode?: (props: {
    item: T;
    isSelected: boolean;
    isDragging: boolean;
    isDropTarget: boolean;
    isDropTargetInvalid: boolean;
    isMatchingSearch: boolean;
    hasChildren: boolean;
    childrenCount: number;
    isExpanded: boolean;
    toggleExpand: () => void;
  }) => ReactNode;

  /** Detail panel renderer when an item is selected. */
  renderDetailPanel?: (props: {
    selectedItem: T;
    onClose: () => void;
    onSelectNode: (item: T) => void;
  }) => ReactNode;

  /** Optional empty/placeholder detail panel when no item is selected. */
  renderEmptyDetailPanel?: () => ReactNode;

  /** Drag and drop reparent callback. If not provided, dragging is disabled. */
  onReparent?: (sourceItem: T, newParentId: number | string | null) => Promise<void>;

  /** Whether dragging is permitted. */
  canDrag?: boolean;

  /** Callback when selection changes. */
  onSelect?: (item: T | null) => void;

  /** Selected item ID (controlled). */
  selectedId?: number | string | null;

  /** Root anchor title / element. */
  rootTitle?: ReactNode;

  /** Search input placeholder text. */
  searchPlaceholder?: string;

  /** Loading indicator. */
  loading?: boolean;

  /** Default width for the detail side panel on desktop (default: 420). */
  detailPanelWidth?: number;

  /** Initial detail panel open state (default: true). */
  initialDetailPanelOpen?: boolean;

  /** Quick action callbacks */
  onAddChild?: (parentItem: T) => void;
  onMove?: (item: T) => void;
  onEdit?: (item: T) => void;
}
