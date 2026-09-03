"use client";

import React, { useState, useMemo, useRef, useCallback } from "react";
import {
  Box,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Tooltip,
  Collapse,
  Chip,
  alpha,
  useTheme,
  LinearProgress,
} from "@mui/material";
import {
  Search,
  ZoomIn,
  ZoomOut,
  Fullscreen,
  FullscreenExit,
  UnfoldMore,
  UnfoldLess,
  ViewSidebar,
  ViewSidebarOutlined,
  Business,
} from "@mui/icons-material";
import { motion, type PanInfo } from "framer-motion";
import HierarchicalTreeList from "./HierarchicalTreeList";
import type { SplitTreeViewProps, TreeNode } from "./types";

export default function SplitTreeView<T>({
  items,
  getId,
  getParentId,
  getCode,
  getName,
  getSecondaryName,
  getIsDeleted,
  variant = "tree-list",
  searchFilter,
  renderNode,
  renderDetailPanel,
  renderEmptyDetailPanel,
  onReparent,
  canDrag = true,
  onSelect,
  selectedId: controlledSelectedId,
  rootTitle,
  searchPlaceholder = "Search...",
  loading = false,
  detailPanelWidth = 420,
  initialDetailPanelOpen = true,
  onAddChild,
  onMove,
  onEdit,
}: SplitTreeViewProps<T>) {
  const theme = useTheme();
  const isRtl = theme.direction === "rtl";

  const [internalSelectedId, setInternalSelectedId] = useState<number | string | null>(null);
  const selectedId = controlledSelectedId !== undefined ? controlledSelectedId : internalSelectedId;

  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState<boolean>(initialDetailPanelOpen);
  const [expandedNodes, setExpandedNodes] = useState<Set<number | string>>(() => new Set(items.map(getId)));
  const [zoom, setZoom] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const [draggingItem, setDraggingItem] = useState<T | null>(null);
  const [dragOverTargetId, setDragOverTargetId] = useState<number | string | "root" | null>(null);
  const [dragOverTargetInvalid, setDragOverTargetInvalid] = useState<boolean>(false);

  const draggingItemRef = useRef<T | null>(null);
  const isDraggingActiveRef = useRef<boolean>(false);
  const descendantIdsRef = useRef<Set<number | string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  // Build tree hierarchy
  const { tree, itemMap } = useMemo(() => {
    const map = new Map<number | string, TreeNode<T>>();
    items.forEach((item) => {
      const id = getId(item);
      map.set(id, { item, children: [] });
    });

    const roots: TreeNode<T>[] = [];
    items.forEach((item) => {
      const id = getId(item);
      const parentId = getParentId(item);
      const node = map.get(id)!;
      if (parentId != null && parentId !== 0 && parentId !== "" && map.has(parentId)) {
        map.get(parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return { tree: roots, itemMap: map };
  }, [items, getId, getParentId]);

  // Selected item object
  const selectedItem = useMemo(() => {
    if (selectedId == null) return null;
    return items.find((x) => getId(x) === selectedId) ?? null;
  }, [items, getId, selectedId]);

  // Precompute descendants of a node for cycle avoidance
  const getDescendantIds = useCallback(
    (parentId: number | string): Set<number | string> => {
      const result = new Set<number | string>();
      const queue = [parentId];
      while (queue.length > 0) {
        const curr = queue.shift()!;
        items.forEach((item) => {
          const itemId = getId(item);
          const pId = getParentId(item);
          if (pId === curr && !result.has(itemId)) {
            result.add(itemId);
            queue.push(itemId);
          }
        });
      }
      return result;
    },
    [items, getId, getParentId],
  );

  // Search filter
  const matchingIds = useMemo(() => {
    if (!searchTerm.trim()) return new Set<number | string>();
    const term = searchTerm.trim().toLowerCase();
    const set = new Set<number | string>();
    items.forEach((item) => {
      if (searchFilter) {
        if (searchFilter(item, term)) set.add(getId(item));
      } else {
        const code = getCode ? getCode(item).toLowerCase() : "";
        const name = getName ? getName(item, false).toLowerCase() : "";
        if (code.includes(term) || name.includes(term)) set.add(getId(item));
      }
    });
    return set;
  }, [items, getId, searchTerm, searchFilter, getCode, getName]);

  // Auto-expand ancestors of matching items when searching
  React.useEffect(() => {
    if (matchingIds.size > 0) {
      setExpandedNodes((prev) => {
        const next = new Set(prev);
        matchingIds.forEach((id) => {
          let curr = items.find((x) => getId(x) === id);
          while (curr) {
            const pId = getParentId(curr);
            if (pId != null && pId !== 0 && pId !== "") {
              next.add(pId);
              curr = items.find((x) => getId(x) === pId);
            } else {
              break;
            }
          }
        });
        return next;
      });
    }
  }, [matchingIds, items, getId, getParentId]);

  const toggleExpand = (id: number | string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => setExpandedNodes(new Set(items.map(getId)));
  const collapseAll = () => setExpandedNodes(new Set());

  const handleSelect = (item: T | null) => {
    const id = item ? getId(item) : null;
    setInternalSelectedId(id);
    if (onSelect) onSelect(item);
    if (item) setIsDetailPanelOpen(true);
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      try {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } catch {
        setIsFullscreen((f) => !f);
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Drag target detection for diagram variant
  const findDropTarget = (point: { x: number; y: number }): { id: number | string | "root"; invalid: boolean } | null => {
    const dragged = draggingItemRef.current;
    if (!dragged) return null;

    const draggedId = getId(dragged);
    const draggedParentId = getParentId(dragged);

    const elements = document.elementsFromPoint(point.x, point.y);
    for (const el of elements) {
      if (el.getAttribute("data-tree-root") === "true") {
        const isAlreadyRoot = draggedParentId == null || draggedParentId === 0 || draggedParentId === "";
        return { id: "root", invalid: isAlreadyRoot };
      }

      const nodeAttr = el.getAttribute("data-tree-node-id");
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

  const handleMotionDragStart = (item: T) => {
    isDraggingActiveRef.current = true;
    setDraggingItem(item);
    draggingItemRef.current = item;
    descendantIdsRef.current = getDescendantIds(getId(item));
  };

  const handleMotionDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const target = findDropTarget(info.point);
    if (!target) {
      setDragOverTargetId(null);
      setDragOverTargetInvalid(false);
    } else {
      setDragOverTargetId(target.id);
      setDragOverTargetInvalid(target.invalid);
    }
  };

  const handleMotionDragEnd = async (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
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

  const renderRecursiveNode = (node: TreeNode<T>) => {
    if (!renderNode) return null;
    const id = getId(node.item);
    const isExpanded = expandedNodes.has(id);
    const hasKids = node.children.length > 0;
    const isSelected = selectedId === id;
    const isDragging = draggingItem ? getId(draggingItem) === id : false;
    const isTarget = dragOverTargetId === id;
    const isTargetInvalid = isTarget && dragOverTargetInvalid;
    const isMatching = matchingIds.has(id);

    return (
      <Box
        key={String(id)}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          mx: { xs: 1, sm: 1.5 },
        }}
      >
        <motion.div
          drag={canDrag && Boolean(onReparent)}
          dragSnapToOrigin={true}
          dragElastic={0.12}
          dragMomentum={false}
          whileDrag={{
            scale: 1.05,
            zIndex: 9999,
            filter: "drop-shadow(0 18px 28px rgba(0,0,0,0.28))",
            cursor: "grabbing",
          }}
          onDragStart={() => handleMotionDragStart(node.item)}
          onDrag={handleMotionDrag}
          onDragEnd={handleMotionDragEnd}
          onClick={() => {
            if (!isDraggingActiveRef.current) {
              handleSelect(node.item);
            }
          }}
          style={{
            touchAction: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box
            data-tree-node-id={String(id)}
            sx={{
              position: "relative",
              cursor: canDrag ? "grab" : "pointer",
              transition: "transform 0.12s ease",
              transform: isTarget ? "translateY(-3px)" : "none",
            }}
          >
            {renderNode({
              item: node.item,
              isSelected,
              isDragging,
              isDropTarget: isTarget,
              isDropTargetInvalid: isTargetInvalid,
              isMatchingSearch: isMatching,
              hasChildren: hasKids,
              childrenCount: node.children.length,
              isExpanded,
              toggleExpand: () => toggleExpand(id),
            })}
          </Box>
        </motion.div>

        {hasKids && isExpanded && (
          <Box
            sx={{
              width: "2px",
              height: 20,
              backgroundColor: alpha(theme.palette.primary.main, 0.5),
            }}
          />
        )}

        {hasKids && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  position: "relative",
                  pt: 0,
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: node.children.length > 1 ? "calc(100% - 280px)" : 0,
                    height: "2px",
                    backgroundColor: alpha(theme.palette.primary.main, 0.4),
                  },
                }}
              >
                {node.children.map((child) => (
                  <Box
                    key={String(getId(child.item))}
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
                        backgroundColor: alpha(theme.palette.primary.main, 0.4),
                      }}
                    />
                    {renderRecursiveNode(child)}
                  </Box>
                ))}
              </Box>
            </Box>
          </Collapse>
        )}
      </Box>
    );
  };

  const hasDetailPanel = Boolean(renderDetailPanel);

  return (
    <Box
      ref={containerRef}
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.palette.background.default,
        borderRadius: isFullscreen ? 0 : 2,
        border: isFullscreen ? "none" : `1px solid ${theme.palette.mode === "dark" ? theme.palette.divider : "#e2e8f0"}`,
        overflow: "hidden",
        position: isFullscreen ? "fixed" : "relative",
        top: isFullscreen ? 0 : undefined,
        left: isFullscreen ? 0 : undefined,
        right: isFullscreen ? 0 : undefined,
        bottom: isFullscreen ? 0 : undefined,
        zIndex: isFullscreen ? 1300 : undefined,
        minHeight: isFullscreen ? "100vh" : 520,
      }}
    >
      {loading && <LinearProgress sx={{ height: 2 }} />}

      {/* Toolbar */}
      <Paper
        elevation={0}
        sx={{
          p: 1.25,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
          borderBottom: `1px solid ${theme.palette.mode === "dark" ? theme.palette.divider : "#e2e8f0"}`,
          backgroundColor: theme.palette.mode === "dark" ? theme.palette.background.paper : "#ffffff",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1, minWidth: 200, maxWidth: 380 }}>
          <TextField
            size="small"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" color="action" />
                  </InputAdornment>
                ),
                sx: {
                  backgroundColor: theme.palette.mode === "dark" ? alpha(theme.palette.common.white, 0.05) : "#f8fafc",
                  borderRadius: 1.5,
                  fontSize: "0.85rem",
                  "& fieldset": {
                    borderColor: theme.palette.mode === "dark" ? alpha(theme.palette.common.white, 0.1) : "#e2e8f0",
                  },
                },
              },
            }}
            fullWidth
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Chip
            label={isRtl ? `${items.length} عنصر` : `${items.length} items`}
            size="small"
            color="default"
            variant="outlined"
            sx={{ fontWeight: 700, mr: 0.5 }}
          />

          <Tooltip title={isRtl ? "فرد الكل" : "Expand all"}>
            <IconButton size="small" onClick={expandAll}>
              <UnfoldMore />
            </IconButton>
          </Tooltip>
          <Tooltip title={isRtl ? "طي الكل" : "Collapse all"}>
            <IconButton size="small" onClick={collapseAll}>
              <UnfoldLess />
            </IconButton>
          </Tooltip>

          {variant === "diagram" && (
            <>
              <Box sx={{ width: 1, height: 24, backgroundColor: theme.palette.divider, mx: 0.5 }} />
              <Tooltip title={isRtl ? "تكبير" : "Zoom in"}>
                <IconButton
                  size="small"
                  onClick={() => setZoom((z) => Math.min(1.4, Number((z + 0.1).toFixed(1))))}
                  disabled={zoom >= 1.4}
                >
                  <ZoomIn />
                </IconButton>
              </Tooltip>

              <Tooltip title={isRtl ? "إعادة الضبط" : "Reset zoom"}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setZoom(1)}
                  sx={{ minWidth: 50, px: 0.8, py: 0.2, fontSize: "0.75rem" }}
                >
                  {Math.round(zoom * 100)}%
                </Button>
              </Tooltip>

              <Tooltip title={isRtl ? "تصغير" : "Zoom out"}>
                <IconButton
                  size="small"
                  onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.1).toFixed(1))))}
                  disabled={zoom <= 0.6}
                >
                  <ZoomOut />
                </IconButton>
              </Tooltip>

              <Tooltip title={isFullscreen ? (isRtl ? "خروج من ملء الشاشة" : "Exit Fullscreen") : (isRtl ? "ملء الشاشة" : "Fullscreen")}>
                <IconButton size="small" onClick={toggleFullscreen} color={isFullscreen ? "primary" : "default"}>
                  {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
                </IconButton>
              </Tooltip>
            </>
          )}

          {hasDetailPanel && (
            <>
              <Box sx={{ width: 1, height: 24, backgroundColor: theme.palette.divider, mx: 0.5 }} />
              <Tooltip title={isDetailPanelOpen ? (isRtl ? "إخفاء لوحة التفاصيل" : "Hide details") : (isRtl ? "عرض لوحة التفاصيل" : "Show details")}>
                <IconButton
                  size="small"
                  color={isDetailPanelOpen ? "primary" : "default"}
                  onClick={() => setIsDetailPanelOpen((prev) => !prev)}
                >
                  {isDetailPanelOpen ? <ViewSidebar /> : <ViewSidebarOutlined />}
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      </Paper>

      {/* Split Layout Body */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Tree List / Canvas Area */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            height: "100%",
            overflowY: "auto",
            overflowX: "auto",
            backgroundColor: variant === "tree-list"
              ? theme.palette.mode === "dark"
                ? alpha(theme.palette.background.default, 0.6)
                : "#ffffff"
              : alpha(theme.palette.action.hover, 0.4),
            p: variant === "tree-list" ? 1 : { xs: 2, sm: 4 },
            display: variant === "tree-list" ? "block" : "flex",
            justifyContent: variant === "tree-list" ? undefined : "center",
            alignItems: variant === "tree-list" ? undefined : "flex-start",
          }}
        >
          {variant === "tree-list" ? (
            <HierarchicalTreeList<T>
              tree={tree}
              getId={getId}
              getParentId={getParentId}
              getCode={getCode ?? ((item) => String(getId(item)))}
              getName={getName ?? ((item) => String(getId(item)))}
              getSecondaryName={getSecondaryName}
              getIsDeleted={getIsDeleted}
              selectedId={selectedId}
              onSelect={handleSelect}
              onReparent={onReparent}
              onAddChild={onAddChild}
              onMove={onMove}
              onEdit={onEdit}
              canDrag={canDrag}
              expandedNodes={expandedNodes}
              onToggleExpand={toggleExpand}
              matchingIds={matchingIds}
              getDescendantIds={getDescendantIds}
              rootTitle={typeof rootTitle === "string" ? rootTitle : undefined}
            />
          ) : (
            <Box
              sx={{
                transform: `scale(${zoom})`,
                transformOrigin: "top center",
                transition: "transform 0.15s ease",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: "max-content",
              }}
            >
              {/* Root anchor */}
              <Box
                data-tree-root="true"
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
                {typeof rootTitle === "string" || !rootTitle ? (
                  <Box sx={{ fontWeight: 700, color: "primary.main", fontSize: "0.95rem" }}>
                    {rootTitle ?? (isRtl ? "المستوى الرئيسي للشركة" : "Company Root Level")}
                  </Box>
                ) : (
                  rootTitle
                )}
              </Box>

              <Box
                sx={{
                  width: "2px",
                  height: 24,
                  backgroundColor: alpha(theme.palette.primary.main, 0.5),
                }}
              />

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  position: "relative",
                  pt: 0,
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: tree.length > 1 ? "calc(100% - 280px)" : 0,
                    height: "2px",
                    backgroundColor: alpha(theme.palette.primary.main, 0.4),
                  },
                }}
              >
                {tree.map((node) => renderRecursiveNode(node))}
              </Box>
            </Box>
          )}
        </Box>

        {/* Detail Inspection Side Panel */}
        {hasDetailPanel && isDetailPanelOpen && (
          <Paper
            elevation={3}
            sx={{
              width: { xs: "100%", md: detailPanelWidth },
              maxHeight: { xs: 380, md: "100%" },
              height: "100%",
              overflowY: "auto",
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              borderInlineStart: `1px solid ${theme.palette.mode === "dark" ? theme.palette.divider : "#e2e8f0"}`,
              borderRadius: 0,
              backgroundColor: theme.palette.mode === "dark" ? theme.palette.background.paper : "#ffffff",
              zIndex: 10,
              boxShadow: theme.palette.mode === "dark" ? "0 4px 24px rgba(0,0,0,0.6)" : "-4px 0 24px rgba(0,0,0,0.03)",
              transition: "width 0.2s ease",
            }}
          >
            {selectedItem ? (
              renderDetailPanel!({
                selectedItem,
                onClose: () => setIsDetailPanelOpen(false),
                onSelectNode: (targetItem) => handleSelect(targetItem),
              })
            ) : renderEmptyDetailPanel ? (
              renderEmptyDetailPanel()
            ) : (
              <Box sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
                {isRtl ? "اختر عنصراً من الشجرة لعرض تفاصيله" : "Select an item from the tree to inspect details."}
              </Box>
            )}
          </Paper>
        )}
      </Box>
    </Box>
  );
}
