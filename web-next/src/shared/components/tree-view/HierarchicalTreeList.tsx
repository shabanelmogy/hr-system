"use client";

import React, { useState, useRef } from "react";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Collapse,
  Chip,
  alpha,
  useTheme,
} from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowRight,
  KeyboardArrowLeft,
  Folder,
  FolderOpen,
  AccountBalanceWallet,
  DragIndicator,
  Add,
  SwapVert,
  Edit,
} from "@mui/icons-material";
import { motion, type PanInfo } from "framer-motion";
import type { TreeNode } from "./types";

export interface HierarchicalTreeListProps<T> {
  tree: TreeNode<T>[];
  getId: (item: T) => number | string;
  getParentId: (item: T) => number | string | null | undefined;
  getCode: (item: T) => string;
  getName: (item: T, isAr: boolean) => string;
  getSecondaryName?: (item: T, isAr: boolean) => string;
  getIsDeleted?: (item: T) => boolean;
  selectedId: number | string | null;
  onSelect: (item: T) => void;
  onReparent?: (sourceItem: T, newParentId: number | string | null) => Promise<void>;
  onAddChild?: (parentItem: T) => void;
  onMove?: (item: T) => void;
  onEdit?: (item: T) => void;
  canDrag?: boolean;
  canEdit?: boolean;
  canCreate?: boolean;
  expandedNodes: Set<number | string>;
  onToggleExpand: (id: number | string) => void;
  matchingIds: Set<number | string>;
  getDescendantIds: (id: number | string) => Set<number | string>;
  rootTitle?: string;
}

export default function HierarchicalTreeList<T>({
  tree,
  getId,
  getParentId,
  getCode,
  getName,
  getSecondaryName,
  getIsDeleted,
  selectedId,
  onSelect,
  onReparent,
  onAddChild,
  onMove,
  onEdit,
  canDrag = true,
  canEdit = true,
  canCreate = true,
  expandedNodes,
  onToggleExpand,
  matchingIds,
  getDescendantIds,
  rootTitle,
}: HierarchicalTreeListProps<T>) {
  const theme = useTheme();
  const isRtl = theme.direction === "rtl";

  const [draggingItem, setDraggingItem] = useState<T | null>(null);
  const [dragOverTargetId, setDragOverTargetId] = useState<number | string | "root" | null>(null);
  const [dragOverTargetInvalid, setDragOverTargetInvalid] = useState<boolean>(false);

  const draggingItemRef = useRef<T | null>(null);
  const isDraggingActiveRef = useRef<boolean>(false);
  const descendantIdsRef = useRef<Set<number | string>>(new Set());

  const findDropTarget = (point: { x: number; y: number }): { id: number | string | "root"; invalid: boolean } | null => {
    const dragged = draggingItemRef.current;
    if (!dragged) return null;

    const draggedId = getId(dragged);
    const draggedParentId = getParentId(dragged);

    const elements = document.elementsFromPoint(point.x, point.y);
    for (const el of elements) {
      if (el.getAttribute("data-tree-list-root") === "true") {
        const isAlreadyRoot = draggedParentId == null || draggedParentId === 0 || draggedParentId === "";
        return { id: "root", invalid: isAlreadyRoot };
      }

      const nodeAttr = el.getAttribute("data-tree-list-node-id");
      if (nodeAttr) {
        let targetId: number | string = nodeAttr;
        if (!isNaN(Number(nodeAttr)) && typeof draggedId === "number") {
          targetId = Number(nodeAttr);
        }

        const isSelf = targetId === draggedId;
        const isAlreadyParent = draggedParentId === targetId;
        const isDescendant = descendantIdsRef.current.has(targetId);
        return { id: targetId, invalid: isSelf || isAlreadyParent || isDescendant };
      }
    }
    return null;
  };

  const handleDragStart = (item: T) => {
    isDraggingActiveRef.current = true;
    setDraggingItem(item);
    draggingItemRef.current = item;
    descendantIdsRef.current = getDescendantIds(getId(item));
  };

  const handleDrag = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const target = findDropTarget(info.point);
    if (!target) {
      setDragOverTargetId(null);
      setDragOverTargetInvalid(false);
    } else {
      setDragOverTargetId(target.id);
      setDragOverTargetInvalid(target.invalid);
    }
  };

  const handleDragEnd = async (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const dragged = draggingItemRef.current;
    const target = findDropTarget(info.point);

    setDraggingItem(null);
    draggingItemRef.current = null;
    descendantIdsRef.current.clear();
    setDragOverTargetId(null);
    setDragOverTargetInvalid(false);

    setTimeout(() => {
      isDraggingActiveRef.current = false;
    }, 60);

    if (!dragged || !target || target.invalid || !onReparent) return;

    try {
      if (target.id === "root") {
        await onReparent(dragged, null);
      } else {
        await onReparent(dragged, target.id);
      }
    } catch (err: unknown) {
      console.error("Failed to reparent tree node:", err);
    }
  };

  const renderNodeRow = (node: TreeNode<T>, depth: number = 0) => {
    const item = node.item;
    const id = getId(item);
    const code = getCode(item);
    const name = getName(item, isRtl);
    const secondaryName = getSecondaryName ? getSecondaryName(item, isRtl) : undefined;
    const isDeleted = getIsDeleted ? getIsDeleted(item) : false;

    const hasChildren = node.children.length > 0;
    const isExpanded = expandedNodes.has(id);
    const isSelected = selectedId === id;
    const isDragging = draggingItem ? getId(draggingItem) === id : false;
    const isTarget = dragOverTargetId === id;
    const isTargetInvalid = isTarget && dragOverTargetInvalid;
    const isMatching = matchingIds.has(id);

    return (
      <Box key={String(id)} sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <motion.div
          drag={canDrag && Boolean(onReparent)}
          dragSnapToOrigin={true}
          dragElastic={0.1}
          dragMomentum={false}
          whileDrag={{
            scale: 1.02,
            zIndex: 9999,
            filter: "drop-shadow(0 12px 20px rgba(0,0,0,0.22))",
            cursor: "grabbing",
          }}
          onDragStart={() => handleDragStart(item)}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          onClick={() => {
            if (!isDraggingActiveRef.current) {
              onSelect(item);
            }
          }}
          style={{ touchAction: "none" }}
        >
          <Box
            data-tree-list-node-id={String(id)}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              py: 1,
              px: 1.5,
              paddingInlineStart: `${depth * 26 + 12}px`,
              cursor: canDrag ? "grab" : "pointer",
              userSelect: "none",
              WebkitUserSelect: "none",
              borderRadius: 1.5,
              mx: 1,
              my: 0.35,
              transition: "all 0.15s ease",
              position: "relative",
              border: isTargetInvalid
                ? `2px dashed ${theme.palette.error.main}`
                : isTarget
                  ? `2px dashed ${theme.palette.primary.main}`
                  : isSelected
                    ? `1.5px solid ${theme.palette.mode === "dark" ? alpha(theme.palette.primary.light, 0.5) : alpha(theme.palette.primary.main, 0.35)}`
                    : isMatching
                      ? `1.5px solid ${theme.palette.warning.main}`
                      : `1px solid transparent`,
              borderInlineStart: isSelected
                ? `4px solid ${theme.palette.mode === "dark" ? theme.palette.primary.light : theme.palette.primary.main}`
                : undefined,
              backgroundColor: isTargetInvalid
                ? alpha(theme.palette.error.main, theme.palette.mode === "dark" ? 0.2 : 0.1)
                : isTarget
                  ? alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.25 : 0.12)
                  : isSelected
                    ? alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.22 : 0.08)
                    : isMatching
                      ? alpha(theme.palette.warning.main, theme.palette.mode === "dark" ? 0.18 : 0.08)
                      : "transparent",
              opacity: isDragging ? 0.35 : 1,
              "&:hover": {
                backgroundColor: isSelected
                  ? alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.28 : 0.12)
                  : theme.palette.mode === "dark"
                    ? alpha(theme.palette.common.white, 0.05)
                    : "#f8fafc",
                "& .node-actions": {
                  opacity: 1,
                  visibility: "visible",
                },
              },
            }}
          >
            {/* Left Side: Chevron, Folder Icon, Code, Name */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0, flex: 1 }}>
              {/* Expand / Collapse Button */}
              {hasChildren ? (
                <IconButton
                  size="small"
                  onPointerDown={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleExpand(id);
                  }}
                  sx={{
                    p: 0.25,
                    color: "text.secondary",
                    "&:hover": { color: theme.palette.mode === "dark" ? theme.palette.primary.light : "primary.main" },
                  }}
                >
                  {isExpanded ? (
                    <KeyboardArrowDown fontSize="small" />
                  ) : isRtl ? (
                    <KeyboardArrowLeft fontSize="small" />
                  ) : (
                    <KeyboardArrowRight fontSize="small" />
                  )}
                </IconButton>
              ) : (
                <Box sx={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Box
                    sx={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      backgroundColor: theme.palette.mode === "dark"
                        ? alpha(theme.palette.text.disabled, 0.6)
                        : "#94a3b8",
                    }}
                  />
                </Box>
              )}

              {/* Folder / Wallet Icon */}
              {hasChildren ? (
                isExpanded ? (
                  <FolderOpen sx={{ color: theme.palette.mode === "dark" ? "#fbbf24" : "#d97706", fontSize: 20 }} />
                ) : (
                  <Folder sx={{ color: theme.palette.mode === "dark" ? "#f59e0b" : "#b45309", fontSize: 20 }} />
                )
              ) : (
                <AccountBalanceWallet sx={{ color: theme.palette.mode === "dark" ? theme.palette.primary.light : "primary.main", fontSize: 18 }} />
              )}

              {/* Code Pill */}
              <Typography
                variant="caption"
                sx={{
                  fontFamily: "monospace",
                  fontWeight: 800,
                  fontSize: "0.8rem",
                  color: isSelected
                    ? (theme.palette.mode === "dark" ? theme.palette.primary.light : theme.palette.primary.dark)
                    : (theme.palette.mode === "dark" ? theme.palette.text.primary : "#334155"),
                  backgroundColor: isSelected
                    ? alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.3 : 0.12)
                    : (theme.palette.mode === "dark" ? alpha(theme.palette.common.white, 0.07) : "#f1f5f9"),
                  border: `1px solid ${
                    isSelected
                      ? alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.5 : 0.35)
                      : (theme.palette.mode === "dark" ? alpha(theme.palette.common.white, 0.12) : "#e2e8f0")
                  }`,
                  px: 0.85,
                  py: 0.2,
                  borderRadius: 1,
                  letterSpacing: 0.5,
                }}
              >
                {code}
              </Typography>

              {/* Node Title */}
              <Box sx={{ minWidth: 0, display: "flex", alignItems: "baseline", gap: 1 }}>
                <Typography
                  variant="body2"
                  noWrap
                  title={name}
                  sx={{
                    fontWeight: isSelected ? 800 : hasChildren ? 700 : 500,
                    color: isSelected
                      ? (theme.palette.mode === "dark" ? theme.palette.primary.light : theme.palette.primary.dark)
                      : "text.primary",
                    fontSize: "0.9rem",
                  }}
                >
                  {name}
                </Typography>

                {secondaryName && secondaryName !== name && (
                  <Typography
                    variant="caption"
                    noWrap
                    title={secondaryName}
                    sx={{
                      color: "text.secondary",
                      display: { xs: "none", sm: "inline-block" },
                      fontSize: "0.75rem",
                    }}
                  >
                    ({secondaryName})
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Right Side: Badges and Quick Actions */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {/* Type Badge */}
              <Chip
                label={hasChildren ? (isRtl ? "رئيسي" : "Parent") : (isRtl ? "فرعي" : "Sub")}
                size="small"
                variant="outlined"
                sx={{
                  height: 20,
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  display: { xs: "none", md: "inline-flex" },
                  backgroundColor: hasChildren
                    ? (theme.palette.mode === "dark" ? alpha(theme.palette.common.white, 0.08) : "#f1f5f9")
                    : (theme.palette.mode === "dark" ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.primary.main, 0.08)),
                  color: hasChildren
                    ? (theme.palette.mode === "dark" ? theme.palette.text.secondary : "#475569")
                    : (theme.palette.mode === "dark" ? theme.palette.primary.light : theme.palette.primary.dark),
                  borderColor: hasChildren
                    ? (theme.palette.mode === "dark" ? alpha(theme.palette.common.white, 0.2) : "#e2e8f0")
                    : (theme.palette.mode === "dark" ? alpha(theme.palette.primary.main, 0.3) : alpha(theme.palette.primary.main, 0.25)),
                }}
              />

              {/* Child Count Badge */}
              {hasChildren && (
                <Chip
                  label={node.children.length}
                  size="small"
                  variant="outlined"
                  sx={{
                    height: 20,
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    minWidth: 24,
                    backgroundColor: theme.palette.mode === "dark" ? alpha("#f59e0b", 0.15) : alpha("#f59e0b", 0.1),
                    borderColor: theme.palette.mode === "dark" ? alpha("#f59e0b", 0.6) : alpha("#f59e0b", 0.35),
                    color: theme.palette.mode === "dark" ? "#fbbf24" : "#b45309",
                  }}
                />
              )}

              {/* Status Badge (if archived) */}
              {isDeleted && (
                <Chip
                  label={isRtl ? "مؤرشف" : "Archived"}
                  size="small"
                  color="error"
                  variant="outlined"
                  sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700 }}
                />
              )}

              {/* Hover Quick Actions */}
              <Box
                className="node-actions"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.25,
                  opacity: { xs: 1, sm: 0 },
                  visibility: { xs: "visible", sm: "hidden" },
                  transition: "opacity 0.15s ease",
                }}
              >
                {canCreate && onAddChild && (
                  <Tooltip title={isRtl ? "إضافة عنصر فرعي" : "Add Sub-Item"}>
                    <IconButton
                      size="small"
                      onPointerDown={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddChild(item);
                      }}
                      sx={{ p: 0.35, color: "primary.main" }}
                    >
                      <Add fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}

                {canEdit && onMove && (
                  <Tooltip title={isRtl ? "نقل العنصر" : "Move Item"}>
                    <IconButton
                      size="small"
                      onPointerDown={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        onMove(item);
                      }}
                      sx={{ p: 0.35, color: "secondary.main" }}
                    >
                      <SwapVert fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}

                {canEdit && onEdit && (
                  <Tooltip title={isRtl ? "تعديل" : "Edit"}>
                    <IconButton
                      size="small"
                      onPointerDown={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(item);
                      }}
                      sx={{ p: 0.35, color: "text.secondary" }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}

                {canDrag && (
                  <Tooltip title={isRtl ? "اسحب لإعادة الترتيب أو النقل" : "Drag to move"}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "grab",
                        color: "text.disabled",
                        p: 0.2,
                        "&:hover": { color: "primary.main" },
                      }}
                    >
                      <DragIndicator fontSize="small" />
                    </Box>
                  </Tooltip>
                )}
              </Box>
            </Box>
          </Box>
        </motion.div>

        {/* Child Subtree */}
        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box
              sx={{
                position: "relative",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  bottom: 12,
                  insetInlineStart: `${depth * 26 + 23}px`,
                  width: "1.5px",
                  backgroundColor: theme.palette.mode === "dark"
                    ? alpha(theme.palette.common.white, 0.12)
                    : "#cbd5e1",
                },
              }}
            >
              {node.children.map((child) => renderNodeRow(child, depth + 1))}
            </Box>
          </Collapse>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", py: 1 }}>
      {/* Root Drop Zone */}
      <Box
        data-tree-list-root="true"
        sx={{
          py: 0.85,
          px: 2,
          mx: 1,
          mb: 1,
          borderRadius: 1.5,
          border:
            dragOverTargetId === "root"
              ? `2px dashed ${theme.palette.mode === "dark" ? theme.palette.primary.light : theme.palette.primary.main}`
              : `1px dashed ${theme.palette.mode === "dark" ? alpha(theme.palette.common.white, 0.15) : "#cbd5e1"}`,
          backgroundColor:
            dragOverTargetId === "root"
              ? alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.25 : 0.08)
              : theme.palette.mode === "dark"
                ? alpha(theme.palette.common.white, 0.03)
                : "#f8fafc",
          display: "flex",
          alignItems: "center",
          gap: 1,
          cursor: draggingItem ? "pointer" : "default",
          transition: "all 0.15s ease",
        }}
      >
        <FolderOpen sx={{ color: theme.palette.mode === "dark" ? theme.palette.primary.light : theme.palette.primary.main, fontSize: 18 }} />
        <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.mode === "dark" ? theme.palette.primary.light : theme.palette.primary.dark }}>
          {rootTitle ?? (isRtl ? "المستوى الرئيسي للشركة (بدون مركز أب)" : "Company Top Level (No Parent)")}
        </Typography>
      </Box>

      {/* Tree Nodes */}
      {tree.map((rootNode) => renderNodeRow(rootNode, 0))}
    </Box>
  );
}
