"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import {
  AccountTree,
  Add,
  Business,
  ChevronRight,
  DragIndicator,
  Edit,
  ExpandMore,
  Fullscreen,
  FullscreenExit,
  North,
  Remove,
  Search,
  SwapVert,
  Visibility,
  ZoomIn,
  ZoomOut,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { AppChip } from "@/shared/components/cards";
import { EmptyState } from "@/shared/components/feedback/states";
import { motion, type PanInfo } from "framer-motion";
import type { OrganizationalStructureItem } from "../../types/OrganizationalStructure";

interface Props {
  items: OrganizationalStructureItem[];
  loading?: boolean;
  permissions: {
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canApprove: boolean;
  };
  onView: (item: OrganizationalStructureItem) => void;
  onEdit: (item: OrganizationalStructureItem) => void;
  onReparent: (
    sourceItem: OrganizationalStructureItem,
    newParentId: number | null,
    swapWithTarget?: OrganizationalStructureItem,
  ) => Promise<void>;
  onAdd?: () => void;
  onAddChild?: (parentItem: OrganizationalStructureItem) => void;
}

interface DepartmentTreeNode {
  item: OrganizationalStructureItem;
  children: DepartmentTreeNode[];
}

function buildTree(items: OrganizationalStructureItem[]): DepartmentTreeNode[] {
  const itemMap = new Map<number, DepartmentTreeNode>();
  const rootNodes: DepartmentTreeNode[] = [];

  for (const item of items) {
    itemMap.set(item.id, { item, children: [] });
  }

  for (const item of items) {
    const node = itemMap.get(item.id)!;
    if (item.parentDepartmentId && itemMap.has(item.parentDepartmentId)) {
      const parentNode = itemMap.get(item.parentDepartmentId)!;
      parentNode.children.push(node);
    } else {
      rootNodes.push(node);
    }
  }

  return rootNodes;
}

function isNodeOrDescendant(
  sourceId: number,
  targetId: number,
  itemMap: Map<number, DepartmentTreeNode>,
): boolean {
  if (sourceId === targetId) return true;
  const sourceNode = itemMap.get(sourceId);
  if (!sourceNode) return false;

  const stack = [...sourceNode.children];
  const visited = new Set<number>();
  while (stack.length > 0) {
    const current = stack.pop()!;
    if (current.item.id === targetId) return true;
    if (!visited.has(current.item.id)) {
      visited.add(current.item.id);
      stack.push(...current.children);
    }
  }
  return false;
}

export default function DepartmentTreeDiagram({
  items,
  permissions,
  onView,
  onEdit,
  onReparent,
  onAdd,
  onAddChild,
}: Props) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isAr = i18n.resolvedLanguage?.startsWith("ar");

  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [hasInitializedExpanded, setHasInitializedExpanded] = useState(false);
  const draggingItemRef = useRef<OrganizationalStructureItem | null>(null);
  const descendantIdsRef = useRef<Set<number>>(new Set());
  const [draggingItem, setDraggingItem] = useState<OrganizationalStructureItem | null>(null);
  const [dragOverTargetId, setDragOverTargetId] = useState<number | "root" | null>(null);
  const [isInvalidTarget, setIsInvalidTarget] = useState(false);
  const [moveError, setMoveError] = useState<string | null>(null);
  const [moveNotice, setMoveNotice] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [zoom, setZoom] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [moveItem, setMoveItem] = useState<OrganizationalStructureItem | null>(null);
  const [selectedNewParent, setSelectedNewParent] = useState<number | "root">("root");
  const [pendingMove, setPendingMove] = useState<{
    source: OrganizationalStructureItem;
    target: OrganizationalStructureItem | null;
    isSwap?: boolean;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      try {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        }
      } catch {
        // Fallback to CSS fullscreen
      }
      setIsFullscreen(true);
    } else {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      } catch {
        // Fallback
      }
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const treeRoots = useMemo(() => buildTree(items), [items]);

  const itemMap = useMemo(() => {
    const map = new Map<number, DepartmentTreeNode>();
    function traverse(nodes: DepartmentTreeNode[]) {
      for (const node of nodes) {
        map.set(node.item.id, node);
        traverse(node.children);
      }
    }
    traverse(treeRoots);
    return map;
  }, [treeRoots]);

  if (!hasInitializedExpanded && items.length > 0) {
    const allIds = new Set<number>(items.map((i) => i.id));
    setExpandedIds(allIds);
    setHasInitializedExpanded(true);
  }

  const toggleExpand = useCallback((id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedIds(new Set(items.map((i) => i.id)));
  }, [items]);

  const collapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  const findDropTarget = useCallback(
    (point: { x: number; y: number }): { type: "root" } | { type: "department"; id: number; item: OrganizationalStructureItem } | null => {
      if (typeof document === "undefined") return null;
      const elements = document.elementsFromPoint(point.x, point.y);
      for (const el of elements) {
        if (el.getAttribute("data-drop-root") === "true") {
          return { type: "root" };
        }
        const depIdAttr = el.getAttribute("data-department-id");
        if (depIdAttr) {
          const depId = Number(depIdAttr);
          if (draggingItemRef.current && depId === draggingItemRef.current.id) continue;
          const depItem = items.find((i) => i.id === depId);
          if (depItem) {
            return { type: "department", id: depId, item: depItem };
          }
        }
      }
      return null;
    },
    [items],
  );

  const handleMotionDragStart = (item: OrganizationalStructureItem) => {
    if (!permissions.canEdit) return;
    draggingItemRef.current = item;
    setDraggingItem(item);

    // Precompute all descendant IDs once at start of drag
    const descendants = new Set<number>();
    const sourceNode = itemMap.get(item.id);
    if (sourceNode) {
      const stack = [...sourceNode.children];
      while (stack.length > 0) {
        const curr = stack.pop()!;
        descendants.add(curr.item.id);
        stack.push(...curr.children);
      }
    }
    descendantIdsRef.current = descendants;
  };

  const handleMotionDrag = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const target = findDropTarget(info.point);
    if (!target) {
      if (dragOverTargetId !== null) {
        setDragOverTargetId(null);
        setIsInvalidTarget(false);
      }
      return;
    }

    if (target.type === "root") {
      if (dragOverTargetId !== "root") {
        setDragOverTargetId("root");
        setIsInvalidTarget(false);
      }
      return;
    }

    if (target.type === "department") {
      if (dragOverTargetId === target.id) return;
      const source = draggingItemRef.current;
      if (!source) return;

      const isDeepDescendant =
        descendantIdsRef.current.has(target.id) && target.item.parentDepartmentId !== source.id;
      setIsInvalidTarget(isDeepDescendant);
      setDragOverTargetId(target.id);
    }
  };

  const handleMotionDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const source = draggingItemRef.current;
    const target = findDropTarget(info.point);

    setDragOverTargetId(null);
    setIsInvalidTarget(false);

    setTimeout(() => {
      draggingItemRef.current = null;
      descendantIdsRef.current.clear();
      setDraggingItem(null);
    }, 120);

    if (!source || !target) return;

    if (target.type === "root") {
      if (!source.parentDepartmentId) {
        setMoveNotice(
          isAr
            ? `«${source.nameAr}» هي بالفعل إدارة رئيسية عليا (بدون أب).`
            : `'${source.nameEn}' is already a top-level department.`,
        );
        return;
      }
      setMoveError(null);
      setPendingMove({ source, target: null, isSwap: false });
      return;
    }

    if (target.type === "department") {
      const targetItem = target.item;
      if (source.id === targetItem.id) return;

      // Already parent
      if (source.parentDepartmentId === targetItem.id) {
        setMoveNotice(
          t("organizationalStructure.tree.alreadyChildMessage", {
            source: isAr ? source.nameAr : source.nameEn,
            target: isAr ? targetItem.nameAr : targetItem.nameEn,
          }),
        );
        return;
      }

      // Direct child -> Offer Swap
      if (targetItem.parentDepartmentId === source.id) {
        setMoveError(null);
        setPendingMove({ source, target: targetItem, isSwap: true });
        return;
      }

      // Deep descendant -> cycle prevention
      if (descendantIdsRef.current.has(targetItem.id)) {
        return;
      }

      setMoveError(null);
      setPendingMove({ source, target: targetItem, isSwap: false });
    }
  };

  const handleConfirmMove = async () => {
    if (!pendingMove) return;
    try {
      setIsSubmitting(true);
      setMoveError(null);
      if (pendingMove.isSwap && pendingMove.target) {
        await onReparent(pendingMove.source, null, pendingMove.target);
      } else {
        await onReparent(pendingMove.source, pendingMove.target?.id ?? null);
      }
      setPendingMove(null);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to move department";
      setMoveError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDirectMove = async () => {
    if (!moveItem) return;
    try {
      setIsSubmitting(true);
      setMoveError(null);
      const newParentId = selectedNewParent === "root" ? null : Number(selectedNewParent);
      await onReparent(moveItem, newParentId);
      setMoveItem(null);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to move department";
      setMoveError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const matchesSearch = useCallback(
    (item: OrganizationalStructureItem) => {
      if (!searchQuery.trim()) return false;
      const q = searchQuery.toLowerCase();
      return (
        item.nameAr.toLowerCase().includes(q) ||
        item.nameEn.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q)
      );
    },
    [searchQuery],
  );

  const renderDepartmentCard = (node: DepartmentTreeNode, level: number = 0): React.ReactNode => {
    const { item, children } = node;
    const isExpanded = expandedIds.has(item.id);
    const hasChildren = children.length > 0;
    const isDragging = draggingItem?.id === item.id;
    const isTarget = dragOverTargetId === item.id;
    const isTargetInvalid = isTarget && isInvalidTarget;
    const isMatching = matchesSearch(item);

    const displayName = isAr ? item.nameAr : item.nameEn;
    const secondaryName = isAr ? item.nameEn : item.nameAr;
    const branchName = isAr ? item.branchNameAr : item.branchNameEn;

    return (
      <Box
        key={item.id}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          mx: { xs: 1, sm: 1.5 },
        }}
      >
        <motion.div
          drag={permissions.canEdit}
          dragSnapToOrigin={true}
          dragElastic={0.12}
          dragMomentum={false}
          whileDrag={{
            scale: 1.05,
            zIndex: 9999,
            cursor: "grabbing",
            filter: "drop-shadow(0 18px 28px rgba(0,0,0,0.28))",
          }}
          onDragStart={() => handleMotionDragStart(item)}
          onDrag={handleMotionDrag}
          onDragEnd={handleMotionDragEnd}
          style={{
            touchAction: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Card
            data-department-id={item.id}
            elevation={isTarget ? 8 : 2}
            sx={{
              width: { xs: 260, sm: 280 },
              borderRadius: 2.5,
              userSelect: "none",
              WebkitUserSelect: "none",
              cursor: permissions.canEdit ? "grab" : "default",
              border: isTargetInvalid
                ? `2.5px dashed ${theme.palette.error.main}`
                : isTarget
                  ? `2.5px dashed ${theme.palette.primary.main}`
                  : isMatching
                    ? `2px solid ${theme.palette.warning.main}`
                    : `1px solid ${alpha(theme.palette.divider, 0.8)}`,
            backgroundColor: isTargetInvalid
              ? alpha(theme.palette.error.main, 0.08)
              : isTarget
                ? alpha(theme.palette.primary.main, 0.08)
                : isMatching
                  ? alpha(theme.palette.warning.main, 0.05)
                  : theme.palette.background.paper,
            opacity: isDragging ? 0.35 : 1,
            transform: isTarget ? "translateY(-2px)" : "none",
            transition: "border 0.12s ease, background-color 0.12s ease, box-shadow 0.12s ease, transform 0.12s ease",
            position: "relative",
            overflow: "visible",
            boxShadow: isTarget ? theme.shadows[8] : undefined,
            "&:hover": {
              boxShadow: theme.shadows[6],
              borderColor: isTarget ? undefined : theme.palette.primary.main,
            },
          }}
        >
          <Box
            sx={{
              height: 4,
              backgroundColor:
                item.isCentralized || !item.branchId
                  ? theme.palette.secondary.main
                  : theme.palette.primary.main,
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
            }}
          />

          <CardContent sx={{ p: 1.75, pb: "14px !important", pointerEvents: draggingItem ? "none" : "auto" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
                mb: 1,
              }}
            >
              <Chip
                label={item.code}
                size="small"
                variant="outlined"
                sx={{
                  fontFamily: "monospace",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  borderColor: alpha(theme.palette.primary.main, 0.4),
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                }}
              />

              <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 0.5 }}>
                {permissions.canEdit && (
                  <Tooltip
                    title={
                      isAr
                        ? "اسحب لإعادة ربط هذه الإدارة"
                        : "Drag to reparent this department"
                    }
                  >
                    <Box
                      sx={{
                        cursor: "grab",
                        display: "flex",
                        alignItems: "center",
                        p: 0.25,
                        borderRadius: 1,
                        color: "text.secondary",
                        "&:hover": {
                          color: "primary.main",
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        },
                      }}
                    >
                      <DragIndicator fontSize="small" />
                    </Box>
                  </Tooltip>
                )}
                <IconButton
                  size="small"
                  onPointerDown={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => onView(item)}
                  sx={{ color: "text.secondary", p: 0.3 }}
                >
                  <Visibility fontSize="inherit" />
                </IconButton>
                {permissions.canEdit && (
                  <IconButton
                    size="small"
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() => onEdit(item)}
                    sx={{ color: "text.secondary", p: 0.3 }}
                  >
                    <Edit fontSize="inherit" />
                  </IconButton>
                )}
                {permissions.canEdit && (
                  <Tooltip title={t("organizationalStructure.tree.moveDepartment")}>
                    <IconButton
                      size="small"
                      onPointerDown={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={() => {
                        setMoveItem(item);
                        setSelectedNewParent(item.parentDepartmentId ?? "root");
                        setMoveError(null);
                      }}
                      sx={{
                        color: "primary.main",
                        p: 0.3,
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        "&:hover": { backgroundColor: alpha(theme.palette.primary.main, 0.2) },
                      }}
                    >
                      <SwapVert fontSize="inherit" />
                    </IconButton>
                  </Tooltip>
                )}
                {permissions.canCreate && onAddChild && (
                  <Tooltip title={t("organizationalStructure.tree.addSubDepartmentTo", { name: displayName })}>
                    <IconButton
                      size="small"
                      onPointerDown={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={() => onAddChild(item)}
                      sx={{
                        color: "primary.main",
                        p: 0.3,
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        "&:hover": { backgroundColor: alpha(theme.palette.primary.main, 0.2) },
                      }}
                    >
                      <Add fontSize="inherit" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>

            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                fontSize: "0.95rem",
                lineHeight: 1.3,
                color: "text.primary",
                mb: 0.25,
              }}
            >
              {displayName}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 1, fontSize: "0.78rem" }}
            >
              {secondaryName}
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "row", gap: 0.75, flexWrap: "wrap", mb: 1 }}>
              <AppChip
                label={
                  item.isCentralized || !item.branchId
                    ? isAr
                      ? "مركزية (عامة)"
                      : "Centralized"
                    : branchName || (isAr ? "فرع" : "Branch")
                }
                colorKey={
                  item.isCentralized || !item.branchId ? "secondary" : "info"
                }
                variant="soft"
                size="small"
              />

              {item.costCenterCode && (
                <AppChip
                  label={item.costCenterCode}
                  colorKey="primary"
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                pt: 1,
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                gap: 1,
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0 }}
              >
                {hasChildren
                  ? `${children.length} ${t("organizationalStructure.tree.subDepartments")}`
                  : isAr
                    ? "إدارة طرفية"
                    : "Terminal"}
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
                {hasChildren ? (
                  <Button
                    size="small"
                    variant="text"
                    color="inherit"
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() => toggleExpand(item.id)}
                    startIcon={isExpanded ? <Remove fontSize="small" /> : <Add fontSize="small" />}
                    sx={{
                      fontSize: "0.75rem",
                      py: 0.2,
                      px: 0.75,
                      minWidth: "auto",
                      color: theme.palette.text.secondary,
                      fontWeight: 700,
                    }}
                  >
                    {isExpanded ? (isAr ? "طي" : "Collapse") : (isAr ? "فرد" : "Expand")}
                  </Button>
                ) : (
                  permissions.canCreate && onAddChild && (
                    <Button
                      size="small"
                      variant="text"
                      color="primary"
                      onPointerDown={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={() => onAddChild(item)}
                      startIcon={<Add fontSize="small" />}
                      sx={{
                        fontSize: "0.75rem",
                        py: 0.2,
                        px: 0.75,
                        minWidth: "auto",
                        fontWeight: 700,
                      }}
                    >
                      {isAr ? "إضافة فرعية" : "Add Sub"}
                    </Button>
                  )
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </motion.div>

        {hasChildren && isExpanded && (
          <Box
            sx={{
              width: "2px",
              height: 20,
              backgroundColor: alpha(theme.palette.primary.main, 0.5),
            }}
          />
        )}

        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                justifyContent: "center",
                position: "relative",
              }}
            >
              {children.length > 1 && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: `calc(140px + 12px)`,
                    right: `calc(140px + 12px)`,
                    height: "2px",
                    backgroundColor: alpha(theme.palette.primary.main, 0.5),
                  }}
                />
              )}

              {children.map((childNode) => (
                <Box
                  key={childNode.item.id}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    position: "relative",
                  }}
                >
                  <Box
                    sx={{
                      width: "2px",
                      height: 20,
                      backgroundColor: alpha(theme.palette.primary.main, 0.5),
                    }}
                  />
                  {renderDepartmentCard(childNode, level + 1)}
                </Box>
              ))}
            </Box>
          </Collapse>
        )}
      </Box>
    );
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        width: "100%",
        backgroundColor: alpha(theme.palette.background.default, 0.6),
        overflow: "hidden",
        position: "relative",
        ...(isFullscreen && {
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 1300,
          backgroundColor: theme.palette.background.default,
        }),
      }}
    >
      <Paper
        elevation={1}
        sx={{
          p: { xs: 1, sm: 1.5 },
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          zIndex: 4,
          borderRadius: 0,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "row", gap: 1.5, alignItems: "center", flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder={t("organizationalStructure.tree.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" color="action" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ width: { xs: 200, sm: 260 } }}
          />

          <Button
            size="small"
            variant="outlined"
            onClick={expandAll}
            startIcon={<ExpandMore />}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            {t("organizationalStructure.tree.expandAll")}
          </Button>

          <Button
            size="small"
            variant="outlined"
            onClick={collapseAll}
            startIcon={<ChevronRight />}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            {t("organizationalStructure.tree.collapseAll")}
          </Button>

          {permissions.canCreate && onAdd && (
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={onAdd}
              startIcon={<Add />}
              sx={{ textTransform: "none", fontWeight: 700 }}
            >
              {t("organizationalStructure.tree.addDepartment")}
            </Button>
          )}
        </Box>

        <Box sx={{ display: "flex", flexDirection: "row", gap: 1, alignItems: "center" }}>
          <Chip
            icon={<AccountTree />}
            label={`${items.length} ${t("organizationalStructure.resources.departments")}`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />

          <Tooltip title={isAr ? "تكبير" : "Zoom in"}>
            <IconButton
              size="small"
              onClick={() => setZoom((z) => Math.min(1.4, Number((z + 0.1).toFixed(1))))}
              disabled={zoom >= 1.4}
            >
              <ZoomIn />
            </IconButton>
          </Tooltip>

          <Tooltip title={isAr ? "إعادة الضبط" : "Reset zoom"}>
            <Button
              size="small"
              variant="text"
              onClick={() => setZoom(1)}
              sx={{ minWidth: 40, px: 0.5, fontWeight: 700 }}
            >
              {Math.round(zoom * 100)}%
            </Button>
          </Tooltip>

          <Tooltip title={isAr ? "تصغير" : "Zoom out"}>
            <IconButton
              size="small"
              onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.1).toFixed(1))))}
              disabled={zoom <= 0.6}
            >
              <ZoomOut />
            </IconButton>
          </Tooltip>

          <Tooltip title={isFullscreen ? t("organizationalStructure.tree.exitFullscreen") : t("organizationalStructure.tree.fullscreen")}>
            <IconButton
              size="small"
              onClick={toggleFullscreen}
              color={isFullscreen ? "primary" : "default"}
            >
              {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {draggingItem && (
        <Paper
          data-drop-root="true"
          sx={{
            m: 1.5,
            p: 1.5,
            border: `2.5px dashed ${
              dragOverTargetId === "root"
                ? theme.palette.secondary.main
                : alpha(theme.palette.primary.main, 0.6)
            }`,
            backgroundColor:
              dragOverTargetId === "root"
                ? alpha(theme.palette.secondary.main, 0.12)
                : alpha(theme.palette.primary.main, 0.05),
            textAlign: "center",
            cursor: "pointer",
            borderRadius: 2,
            transition: "all 0.2s ease",
            boxShadow: dragOverTargetId === "root" ? theme.shadows[4] : undefined,
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "row", gap: 1, alignItems: "center", justifyContent: "center" }}>
            <North color="secondary" />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "secondary.main" }}>
              {t("organizationalStructure.tree.dropToRoot")}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {t("organizationalStructure.tree.dropToRootDesc")}
          </Typography>
        </Paper>
      )}

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: "auto",
          p: { xs: 2, md: 4 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          scrollbarGutter: "stable",
        }}
      >
        {items.length === 0 ? (
          <Box sx={{ my: "auto" }}>
            <EmptyState
              title={t("organizationalStructure.tree.noDepartments")}
              subtitle={t("organizationalStructure.empty")}
              actionText={permissions.canCreate && onAdd ? t("organizationalStructure.tree.addDepartment") : undefined}
              onAction={permissions.canCreate ? onAdd : undefined}
            />
          </Box>
        ) : (
          <Box
            sx={{
              transform: `scale(${zoom})`,
              transformOrigin: "top center",
              transition: "transform 0.15s ease-out",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minWidth: "max-content",
            }}
          >
            <Box
              data-drop-root="true"
              sx={{
                px: 2.5,
                py: 1,
                borderRadius: 3,
                cursor: draggingItem ? "pointer" : "default",
                backgroundColor:
                  dragOverTargetId === "root"
                    ? alpha(theme.palette.secondary.main, 0.2)
                    : alpha(theme.palette.primary.main, 0.1),
                border:
                  dragOverTargetId === "root"
                    ? `2px dashed ${theme.palette.secondary.main}`
                    : `1.5px solid ${theme.palette.primary.main}`,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                transition: "all 0.2s ease",
                boxShadow: dragOverTargetId === "root" ? theme.shadows[6] : undefined,
              }}
            >
              <Business color="primary" fontSize="small" />
              <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700 }}>
                {t("organizationalStructure.tree.rootNode")}
              </Typography>
              {permissions.canCreate && onAdd && (
                <Tooltip title={t("organizationalStructure.tree.addRootDepartment")}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={onAdd}
                    sx={{
                      p: 0.4,
                      backgroundColor: alpha(theme.palette.primary.main, 0.12),
                      "&:hover": { backgroundColor: alpha(theme.palette.primary.main, 0.25) },
                    }}
                  >
                    <Add fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            {treeRoots.length > 0 && (
              <Box
                sx={{
                  width: "2px",
                  height: treeRoots.length > 1 ? 20 : 24,
                  backgroundColor: alpha(theme.palette.primary.main, 0.5),
                }}
              />
            )}

            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                justifyContent: "center",
                position: "relative",
              }}
            >
              {treeRoots.length > 1 && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: `calc(140px + 12px)`,
                    right: `calc(140px + 12px)`,
                    height: "2px",
                    backgroundColor: alpha(theme.palette.primary.main, 0.5),
                  }}
                />
              )}

              {treeRoots.map((rootNode) => (
                <Box
                  key={rootNode.item.id}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    position: "relative",
                  }}
                >
                  {treeRoots.length > 1 && (
                    <Box
                      sx={{
                        width: "2px",
                        height: 20,
                        backgroundColor: alpha(theme.palette.primary.main, 0.5),
                      }}
                    />
                  )}
                  {renderDepartmentCard(rootNode)}
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>

      <Dialog
        open={pendingMove !== null}
        onClose={() => !isSubmitting && setPendingMove(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {pendingMove?.isSwap
            ? t("organizationalStructure.tree.swapHierarchyTitle")
            : t("organizationalStructure.tree.confirmMoveTitle")}
        </DialogTitle>
        <DialogContent>
          {moveError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {moveError}
            </Alert>
          )}
          <DialogContentText sx={{ color: "text.primary", mb: 2 }}>
            {pendingMove?.isSwap
              ? t("organizationalStructure.tree.swapHierarchyMessage", {
                  source: isAr ? pendingMove.source.nameAr : pendingMove.source.nameEn,
                  target: isAr ? pendingMove.target?.nameAr : pendingMove.target?.nameEn,
                })
              : pendingMove?.target
                ? t("organizationalStructure.tree.confirmMoveMessage", {
                    source: isAr ? pendingMove.source.nameAr : pendingMove.source.nameEn,
                    target: isAr ? pendingMove.target.nameAr : pendingMove.target.nameEn,
                  })
                : t("organizationalStructure.tree.confirmMoveToRootMessage", {
                    source: isAr
                      ? pendingMove?.source.nameAr ?? ""
                      : pendingMove?.source.nameEn ?? "",
                  })}
          </DialogContentText>
          <Alert severity={pendingMove?.isSwap ? "warning" : "info"}>
            {pendingMove?.isSwap
              ? isAr
                ? "سيتم ترقية الإدارة التابعة لتصبح إدارة عليا، ونقل الإدارة الحالية لتصبح تابعة لها."
                : "The sub-department will be promoted, and the current department will be nested underneath it."
              : t("organizationalStructure.tree.dragInstruction")}
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setPendingMove(null)}
            disabled={isSubmitting}
            color="inherit"
          >
            {t("actions.cancel")}
          </Button>
          <Button
            onClick={handleConfirmMove}
            disabled={isSubmitting}
            variant="contained"
            color={pendingMove?.isSwap ? "warning" : "primary"}
            autoFocus
          >
            {isSubmitting
              ? isAr
                ? "جارٍ النقل..."
                : "Moving..."
              : pendingMove?.isSwap
                ? t("organizationalStructure.tree.confirmSwap")
                : t("actions.confirm")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Direct Move / Reorganize Dialog */}
      <Dialog
        open={moveItem !== null}
        onClose={() => !isSubmitting && setMoveItem(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {t("organizationalStructure.tree.moveDepartment")}: {moveItem && (isAr ? moveItem.nameAr : moveItem.nameEn)}
        </DialogTitle>
        <DialogContent>
          {moveError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {moveError}
            </Alert>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t("organizationalStructure.tree.moveDepartmentDesc")}
          </Typography>
          <Box sx={{ mb: 2, p: 1.5, borderRadius: 1.5, backgroundColor: alpha(theme.palette.primary.main, 0.06) }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
              {t("organizationalStructure.tree.currentParent")}
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {moveItem?.parentNameAr ||
                moveItem?.parentNameEn ||
                (isAr ? "الشركة / الإدارة العامة (بدون أب)" : "Company / Top Level")}
            </Typography>
          </Box>
          <FormControl fullWidth size="small" sx={{ mt: 1 }}>
            <InputLabel id="select-new-parent-label">
              {t("organizationalStructure.tree.selectNewParent")}
            </InputLabel>
            <Select
              labelId="select-new-parent-label"
              value={selectedNewParent}
              label={t("organizationalStructure.tree.selectNewParent")}
              onChange={(e) => setSelectedNewParent(e.target.value as number | "root")}
            >
              <MenuItem value="root">
                🏢 {t("organizationalStructure.tree.rootNode")} ({isAr ? "إدارة رئيسية عليا بدون أب" : "Top-level root"})
              </MenuItem>
              {items
                .filter((d) => moveItem && !isNodeOrDescendant(moveItem.id, d.id, itemMap))
                .map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.code} - {isAr ? d.nameAr : d.nameEn}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setMoveItem(null)} disabled={isSubmitting} color="inherit">
            {t("actions.cancel")}
          </Button>
          <Button
            onClick={handleConfirmDirectMove}
            disabled={
              isSubmitting ||
              Boolean(
                moveItem &&
                  (selectedNewParent === "root"
                    ? !moveItem.parentDepartmentId
                    : selectedNewParent === moveItem.parentDepartmentId),
              )
            }
            variant="contained"
            color="primary"
          >
            {isSubmitting ? (isAr ? "جارٍ الحفظ..." : "Saving...") : t("organizationalStructure.tree.saveMove")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Helpful Toast / Notice */}
      <Snackbar
        open={Boolean(moveNotice)}
        autoHideDuration={4000}
        onClose={() => setMoveNotice(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setMoveNotice(null)} severity="info" sx={{ width: "100%", boxShadow: theme.shadows[6] }}>
          {moveNotice}
        </Alert>
      </Snackbar>
    </Box>
  );
}
