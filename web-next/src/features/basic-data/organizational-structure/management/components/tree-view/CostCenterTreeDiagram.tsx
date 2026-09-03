"use client";

import React, { useState, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Tooltip,
  Button,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Stack,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Add,
  Remove,
  Business,
  SwapVert,
  AccountBalanceWallet,
  Edit,
  Delete,
  RestoreFromTrash,
  CorporateFare,
  Domain,
  Close,
  ChevronRight,
  AccountTree,
  CalendarMonth,
  Layers,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { AppChip } from "@/shared/components/cards";
import { SplitTreeView } from "@/shared/components/tree-view";
import { useOrganizationalLookup } from "../../hooks/useOrganizationalStructure";
import type { OrganizationalStructureItem } from "../../types/OrganizationalStructure";

interface CostCenterTreeDiagramProps {
  items: OrganizationalStructureItem[];
  permissions: {
    canCreate: boolean;
    canEdit: boolean;
    canDelete?: boolean;
  };
  onReparent: (sourceItem: OrganizationalStructureItem, newParentId: number | null) => Promise<void>;
  onAddChild?: (parentItem: OrganizationalStructureItem) => void;
  onEdit: (item: OrganizationalStructureItem) => void;
  onView?: (item: OrganizationalStructureItem) => void;
  onLifecycle?: (item: OrganizationalStructureItem) => void;
  loading?: boolean;
}

export default function CostCenterTreeDiagram({
  items,
  permissions,
  onReparent,
  onAddChild,
  onEdit,
  onView,
  onLifecycle,
  loading = false,
}: CostCenterTreeDiagramProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isAr = i18n.language === "ar";

  const [selectedCostCenterId, setSelectedCostCenterId] = useState<number | null>(null);

  // Move Modal State
  const [moveItem, setMoveItem] = useState<OrganizationalStructureItem | null>(null);
  const [selectedNewParent, setSelectedNewParent] = useState<number | "root">("root");
  const [moveError, setMoveError] = useState<string | null>(null);
  const [isSubmittingMove, setIsSubmittingMove] = useState(false);

  // Active items
  const activeItems = useMemo(() => items.filter((x) => !x.isDeleted), [items]);

  // Lookups for linked departments and divisions
  const departmentsLookup = useOrganizationalLookup("departments", undefined, true);
  const divisionsLookup = useOrganizationalLookup("divisions", undefined, true);

  // Helper to compute node depth
  const getHierarchyDepth = (item: OrganizationalStructureItem): number => {
    let depth = 1;
    let current = item;
    const visited = new Set<number>([current.id]);
    while (current.parentCostCenterId) {
      const parent = items.find((x) => x.id === current.parentCostCenterId);
      if (!parent || visited.has(parent.id)) break;
      visited.add(parent.id);
      current = parent;
      depth++;
    }
    return depth;
  };

  // Helper to get all descendant IDs
  const getDescendantIds = (parentId: number): Set<number> => {
    const result = new Set<number>();
    const queue = [parentId];
    while (queue.length > 0) {
      const curr = queue.shift()!;
      items.forEach((item) => {
        if (item.parentCostCenterId === curr && !result.has(item.id)) {
          result.add(item.id);
          queue.push(item.id);
        }
      });
    }
    return result;
  };

  const handleExecuteDirectMove = async () => {
    if (!moveItem) return;
    setIsSubmittingMove(true);
    setMoveError(null);
    try {
      const newParent = selectedNewParent === "root" ? null : selectedNewParent;
      await onReparent(moveItem, newParent);
      setMoveItem(null);
    } catch (e: unknown) {
      setMoveError(e instanceof Error ? e.message : "Failed to move cost center");
    } finally {
      setIsSubmittingMove(false);
    }
  };

  // Node Card Renderer
  const renderCostCenterNode = ({
    item,
    isSelected,
    isDragging,
    isDropTarget,
    isDropTargetInvalid,
    isMatchingSearch,
    hasChildren,
    childrenCount,
    isExpanded,
    toggleExpand,
  }: {
    item: OrganizationalStructureItem;
    isSelected: boolean;
    isDragging: boolean;
    isDropTarget: boolean;
    isDropTargetInvalid: boolean;
    isMatchingSearch: boolean;
    hasChildren: boolean;
    childrenCount: number;
    isExpanded: boolean;
    toggleExpand: () => void;
  }) => {
    const displayName = isAr ? item.nameAr : item.nameEn;

    return (
      <Card
        elevation={isSelected ? 6 : isDropTarget ? 8 : 2}
        sx={{
          width: { xs: 260, sm: 280 },
          borderRadius: 2.5,
          userSelect: "none",
          WebkitUserSelect: "none",
          border: isDropTargetInvalid
            ? `2.5px dashed ${theme.palette.error.main}`
            : isDropTarget
              ? `2.5px dashed ${theme.palette.primary.main}`
              : isSelected
                ? `2.5px solid ${theme.palette.primary.main}`
                : isMatchingSearch
                  ? `2px solid ${theme.palette.warning.main}`
                  : `1px solid ${alpha(theme.palette.divider, 0.8)}`,
          backgroundColor: isDropTargetInvalid
            ? alpha(theme.palette.error.main, 0.08)
            : isDropTarget
              ? alpha(theme.palette.primary.main, 0.08)
              : isSelected
                ? alpha(theme.palette.primary.main, 0.04)
                : isMatchingSearch
                  ? alpha(theme.palette.warning.main, 0.05)
                  : theme.palette.background.paper,
          opacity: isDragging ? 0.4 : 1,
          boxShadow: isSelected ? theme.shadows[8] : undefined,
          transition: "border 0.12s ease, background-color 0.12s ease, box-shadow 0.12s ease",
          "&:hover": {
            boxShadow: theme.shadows[6],
            borderColor: isSelected || isDropTarget ? undefined : theme.palette.primary.main,
          },
        }}
      >
        <Box
          sx={{
            px: 1.5,
            py: 0.8,
            backgroundColor: isSelected
              ? alpha(theme.palette.primary.main, 0.12)
              : alpha(theme.palette.primary.main, 0.06),
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 0.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0 }}>
            <AccountBalanceWallet fontSize="small" color="primary" />
            <Typography
              variant="caption"
              sx={{
                fontFamily: "monospace",
                fontWeight: 700,
                color: "primary.main",
                backgroundColor: alpha(theme.palette.primary.main, 0.12),
                px: 0.8,
                py: 0.2,
                borderRadius: 1,
                letterSpacing: 0.5,
              }}
            >
              {item.code}
            </Typography>
            {isSelected && (
              <Chip
                label={isAr ? "محدد" : "Selected"}
                size="small"
                color="primary"
                sx={{ height: 18, fontSize: "0.65rem", fontWeight: 700 }}
              />
            )}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
            {permissions.canEdit && (
              <Tooltip title={isAr ? "نقل مركز التكلفة" : "Move Cost Center"}>
                <IconButton
                  size="small"
                  onPointerDown={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMoveItem(item);
                    setSelectedNewParent(item.parentCostCenterId ?? "root");
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
              <Tooltip title={isAr ? "إضافة مركز تكلفة فرعي" : "Add Sub-Cost Center"}>
                <IconButton
                  size="small"
                  onPointerDown={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddChild(item);
                  }}
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

        <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
          <Typography
            variant="subtitle2"
            noWrap
            title={displayName}
            sx={{
              fontWeight: isSelected ? 800 : 700,
              fontSize: "0.92rem",
              color: isSelected ? "primary.main" : "text.primary",
              mb: 0.5,
            }}
          >
            {displayName}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              pt: 1,
              mt: 0.75,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                fontWeight: 600,
              }}
            >
              <AccountBalanceWallet sx={{ fontSize: 13, color: "text.disabled" }} />
              {isAr ? `${childrenCount} مراكز فرعية` : `${childrenCount} sub-centers`}
            </Typography>

            {hasChildren ? (
              <Button
                size="small"
                variant="text"
                color="inherit"
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand();
                }}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddChild(item);
                  }}
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
        </CardContent>
      </Card>
    );
  };

  // Detail Panel Renderer (Split Pane)
  const renderDetailPanel = ({
    selectedItem,
    onClose,
    onSelectNode,
  }: {
    selectedItem: OrganizationalStructureItem;
    onClose: () => void;
    onSelectNode: (item: OrganizationalStructureItem) => void;
  }) => {
    const parent = items.find((x) => x.id === selectedItem.parentCostCenterId);
    const subCenters = activeItems.filter((x) => x.parentCostCenterId === selectedItem.id);
    const depth = getHierarchyDepth(selectedItem);

    // Find linked departments and divisions
    const linkedDepartments = (departmentsLookup.data ?? []).filter(
      (d) => d.code === selectedItem.costCenterCode || d.nameEn === selectedItem.code,
    );
    const linkedDivisions = (divisionsLookup.data ?? []).filter(
      (div) => div.code === selectedItem.costCenterCode || div.nameEn === selectedItem.code,
    );

    return (
      <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2.5 }}>
        {/* Panel Header */}
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AccountBalanceWallet />
            </Box>
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  {isAr ? selectedItem.nameAr : selectedItem.nameEn}
                </Typography>
                <AppChip
                  label={selectedItem.isDeleted ? (isAr ? "مؤرشف" : "Archived") : (isAr ? "نشط" : "Active")}
                  colorKey={selectedItem.isDeleted ? "error" : "success"}
                  variant="soft"
                  size="small"
                />
              </Box>
              <Typography variant="caption" sx={{ fontFamily: "monospace", fontWeight: 700, color: "text.secondary" }}>
                {selectedItem.code}
              </Typography>
            </Box>
          </Box>

          <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary" }}>
            <Close fontSize="small" />
          </IconButton>
        </Box>

        {/* Action Toolbar */}
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 0.75 }}>
          {permissions.canEdit && !selectedItem.isDeleted && (
            <Button
              size="small"
              variant="contained"
              color="primary"
              startIcon={<Edit fontSize="small" />}
              onClick={() => onEdit(selectedItem)}
              sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5 }}
            >
              {isAr ? "تعديل" : "Edit"}
            </Button>
          )}

          {permissions.canCreate && onAddChild && !selectedItem.isDeleted && (
            <Button
              size="small"
              variant="outlined"
              color="primary"
              startIcon={<Add fontSize="small" />}
              onClick={() => onAddChild(selectedItem)}
              sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5 }}
            >
              {isAr ? "إضافة فرعي" : "Add Sub-Center"}
            </Button>
          )}

          {permissions.canEdit && !selectedItem.isDeleted && (
            <Button
              size="small"
              variant="outlined"
              color="secondary"
              startIcon={<SwapVert fontSize="small" />}
              onClick={() => {
                setMoveItem(selectedItem);
                setSelectedNewParent(selectedItem.parentCostCenterId ?? "root");
                setMoveError(null);
              }}
              sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5 }}
            >
              {isAr ? "نقل المركز" : "Move"}
            </Button>
          )}

          {permissions.canDelete && onLifecycle && (
            <Button
              size="small"
              variant="outlined"
              color={selectedItem.isDeleted ? "success" : "warning"}
              startIcon={selectedItem.isDeleted ? <RestoreFromTrash fontSize="small" /> : <Delete fontSize="small" />}
              onClick={() => onLifecycle(selectedItem)}
              sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5 }}
            >
              {selectedItem.isDeleted ? (isAr ? "استعادة" : "Restore") : (isAr ? "أرشفة" : "Archive")}
            </Button>
          )}
        </Stack>

        <Divider />

        {/* Section: Breadcrumbs Path */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="overline" sx={{ fontWeight: 800, color: "text.secondary", letterSpacing: 0.5 }}>
            {isAr ? "المسار والتسلسل الهرمي" : "Hierarchy Trail"}
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 0.5,
              p: 1.25,
              borderRadius: 1.5,
              backgroundColor: theme.palette.mode === "dark" ? alpha(theme.palette.common.white, 0.04) : "#f8fafc",
              border: `1px solid ${theme.palette.mode === "dark" ? alpha(theme.palette.common.white, 0.1) : "#e2e8f0"}`,
            }}
          >
            <Chip
              size="small"
              icon={<CorporateFare sx={{ fontSize: "14px !important" }} />}
              label={isAr ? "الشركة" : "Company"}
              onClick={() => setSelectedCostCenterId(null)}
              clickable
              variant="outlined"
              sx={{
                height: 24,
                fontSize: "0.75rem",
                fontWeight: 700,
                borderColor: theme.palette.mode === "dark" ? alpha(theme.palette.common.white, 0.2) : "#cbd5e1",
                backgroundColor: theme.palette.mode === "dark" ? undefined : "#ffffff",
              }}
            />
            <ChevronRight sx={{ fontSize: 14, color: "text.disabled", transform: isAr ? "rotate(180deg)" : "none" }} />
            {(() => {
              const trail: OrganizationalStructureItem[] = [];
              let c: OrganizationalStructureItem | undefined = selectedItem;
              const seen = new Set<number>();
              while (c) {
                trail.unshift(c);
                seen.add(c.id);
                if (!c.parentCostCenterId) break;
                const p = items.find((x) => x.id === c?.parentCostCenterId);
                if (!p || seen.has(p.id)) break;
                c = p;
              }
              return trail.map((node, idx) => (
                <React.Fragment key={node.id}>
                  {idx > 0 && (
                    <ChevronRight sx={{ fontSize: 14, color: "text.disabled", transform: isAr ? "rotate(180deg)" : "none" }} />
                  )}
                  <Chip
                    size="small"
                    label={`${node.code} — ${isAr ? node.nameAr : node.nameEn}`}
                    color={node.id === selectedItem.id ? "primary" : "default"}
                    variant={node.id === selectedItem.id ? "filled" : "outlined"}
                    onClick={() => onSelectNode(node)}
                    clickable
                    sx={{
                      height: 24,
                      fontSize: "0.75rem",
                      fontWeight: node.id === selectedItem.id ? 800 : 500,
                      backgroundColor: node.id === selectedItem.id
                        ? undefined
                        : (theme.palette.mode === "dark" ? undefined : "#ffffff"),
                      borderColor: theme.palette.mode === "dark" && node.id !== selectedItem.id
                        ? alpha(theme.palette.common.white, 0.2)
                        : (node.id === selectedItem.id ? undefined : "#cbd5e1"),
                    }}
                  />
                </React.Fragment>
              ));
            })()}
          </Box>
        </Box>

        {/* Section: Hierarchy Position */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
          <Typography variant="overline" sx={{ fontWeight: 800, color: "text.secondary", letterSpacing: 0.5 }}>
            {isAr ? "الموقع في الهيكل التنظيمي" : "Hierarchy & Relationships"}
          </Typography>

          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: theme.palette.mode === "dark" ? alpha(theme.palette.common.white, 0.04) : "#f8fafc",
              border: `1px solid ${theme.palette.mode === "dark" ? alpha(theme.palette.common.white, 0.1) : "#e2e8f0"}`,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Layers sx={{ fontSize: 16 }} />
                {isAr ? "المستوى الهرمي:" : "Depth Level:"}
              </Typography>
              <Chip
                size="small"
                label={isAr ? `المستوى ${depth} ${depth === 1 ? "(رئيسي)" : ""}` : `Level ${depth} ${depth === 1 ? "(Root)" : ""}`}
                color={depth === 1 ? "primary" : "default"}
                sx={{ fontWeight: 700 }}
              />
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">
                {isAr ? "المركز الأب:" : "Parent Center:"}
              </Typography>
              {parent ? (
                <Button
                  size="small"
                  variant="text"
                  onClick={() => onSelectNode(parent)}
                  startIcon={<AccountBalanceWallet fontSize="small" />}
                  sx={{ fontWeight: 700, textTransform: "none", p: 0.2 }}
                >
                  {parent.code} — {isAr ? parent.nameAr : parent.nameEn}
                </Button>
              ) : (
                <Typography variant="body2" sx={{ fontWeight: 600, color: "primary.main" }}>
                  {isAr ? "مركز رئيسي للشركة" : "Company Root"}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        {/* Section: Sub-Cost Centers */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="overline" sx={{ fontWeight: 800, color: "text.secondary", letterSpacing: 0.5 }}>
              {isAr ? "مراكز التكلفة الفرعية" : "Sub-Cost Centers"}
            </Typography>
            <Chip size="small" label={String(subCenters.length)} color="primary" variant="outlined" sx={{ fontWeight: 700 }} />
          </Box>

          {subCenters.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
              {isAr ? "لا توجد مراكز تكلفة فرعية تابعة لهذا المركز." : "No sub-cost centers under this center."}
            </Typography>
          ) : (
            <Stack spacing={0.75}>
              {subCenters.map((sub) => (
                <Card
                  key={sub.id}
                  variant="outlined"
                  onClick={() => onSelectNode(sub)}
                  sx={{
                    p: 1.25,
                    cursor: "pointer",
                    borderRadius: 1.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transition: "all 0.15s ease",
                    backgroundColor: theme.palette.mode === "dark" ? alpha(theme.palette.common.white, 0.03) : "#ffffff",
                    borderColor: theme.palette.mode === "dark" ? alpha(theme.palette.common.white, 0.1) : "#e2e8f0",
                    "&:hover": {
                      borderColor: theme.palette.mode === "dark" ? theme.palette.primary.light : theme.palette.primary.main,
                      backgroundColor: theme.palette.mode === "dark" ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.primary.main, 0.03),
                      boxShadow: theme.palette.mode === "dark" ? undefined : "0 2px 8px rgba(0,0,0,0.04)",
                    },
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                      {isAr ? sub.nameAr : sub.nameEn}
                    </Typography>
                    <Typography variant="caption" sx={{ fontFamily: "monospace", color: "text.secondary" }}>
                      {sub.code}
                    </Typography>
                  </Box>
                  <ChevronRight sx={{ color: "text.secondary", transform: isAr ? "rotate(180deg)" : "none" }} />
                </Card>
              ))}
            </Stack>
          )}
        </Box>

        {/* Section: Linked Organizational Units */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="overline" sx={{ fontWeight: 800, color: "text.secondary", letterSpacing: 0.5 }}>
            {isAr ? "الوحدات التنظيمية المرتبطة بهذا المركز" : "Linked Organizational Units"}
          </Typography>

          {linkedDepartments.length > 0 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <CorporateFare sx={{ fontSize: 14 }} />
                {isAr ? "الإدارات:" : "Departments:"}
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {linkedDepartments.map((d) => (
                  <Chip key={d.id} size="small" label={`${d.code} — ${isAr ? d.nameAr : d.nameEn}`} color="primary" variant="outlined" />
                ))}
              </Box>
            </Box>
          )}

          {linkedDivisions.length > 0 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mt: 0.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Domain sx={{ fontSize: 14 }} />
                {isAr ? "الأقسام:" : "Divisions:"}
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {linkedDivisions.map((div) => (
                  <Chip key={div.id} size="small" label={`${div.code} — ${isAr ? div.nameAr : div.nameEn}`} color="secondary" variant="outlined" />
                ))}
              </Box>
            </Box>
          )}

          {linkedDepartments.length === 0 && linkedDivisions.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
              {isAr ? "لم يتم ربط هذا المركز بإدارات أو أقسام بعد." : "No departments or divisions currently linked."}
            </Typography>
          )}
        </Box>

        {/* Section: Description & Audit */}
        <Divider />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="overline" sx={{ fontWeight: 800, color: "text.secondary", letterSpacing: 0.5 }}>
            {isAr ? "الوصف وتفاصيل التدقيق" : "Description & Metadata"}
          </Typography>

          {(selectedItem.descriptionAr || selectedItem.descriptionEn) ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
              {selectedItem.descriptionAr && (
                <Typography variant="body2" color="text.secondary">
                  <strong>{isAr ? "الوصف (عربي):" : "Arabic Description:"}</strong> {selectedItem.descriptionAr}
                </Typography>
              )}
              {selectedItem.descriptionEn && (
                <Typography variant="body2" color="text.secondary">
                  <strong>{isAr ? "الوصف (إنجليزي):" : "English Description:"}</strong> {selectedItem.descriptionEn}
                </Typography>
              )}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
              {isAr ? "لا يوجد وصف مدخل لهذا المركز." : "No description provided."}
            </Typography>
          )}

          <Box sx={{ pt: 1, display: "flex", alignItems: "center", gap: 1, color: "text.secondary" }}>
            <CalendarMonth sx={{ fontSize: 14 }} />
            <Typography variant="caption">
              {isAr ? "تاريخ الإنشاء:" : "Created:"} {selectedItem.createdOn ? new Date(selectedItem.createdOn).toLocaleDateString() : "-"}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  // Empty Detail Panel (Company Overview)
  const renderEmptyDetailPanel = () => {
    const rootCount = activeItems.filter((x) => !x.parentCostCenterId).length;
    const subCount = activeItems.length - rootCount;

    return (
      <Box sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 2 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 3,
            backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.2 : 0.1),
            color: theme.palette.mode === "dark" ? theme.palette.primary.light : "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AccountTree fontSize="large" />
        </Box>

        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            {isAr ? "شجرة مراكز التكلفة" : "Cost Centers Tree"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {isAr
              ? "اضغط على أي بطاقة مركز تكلفة في الشجرة لعرض تفاصيل الارتباط الهرمي، الإدارات المرتبطة، والإجراءات المتاحة."
              : "Click on any cost center card in the tree to inspect hierarchy links, assigned units, and management actions."}
          </Typography>
        </Box>

        <Box
          sx={{
            width: "100%",
            p: 2,
            borderRadius: 2,
            backgroundColor: theme.palette.mode === "dark" ? alpha(theme.palette.common.white, 0.04) : "#f8fafc",
            border: `1px solid ${theme.palette.mode === "dark" ? alpha(theme.palette.common.white, 0.1) : "#e2e8f0"}`,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 1.5,
            textAlign: "center",
          }}
        >
          <Box>
            <Typography variant="h5" color={theme.palette.mode === "dark" ? "primary.light" : "primary.main"} sx={{ fontWeight: 800 }}>
              {activeItems.length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {isAr ? "إجمالي المراكز" : "Total Centers"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="h5" color={theme.palette.mode === "dark" ? "secondary.light" : "secondary.main"} sx={{ fontWeight: 800 }}>
              {rootCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {isAr ? "مراكز رئيسية" : "Root Centers"}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <>
      <SplitTreeView<OrganizationalStructureItem>
        items={activeItems}
        getId={(item) => item.id}
        getParentId={(item) => item.parentCostCenterId}
        getCode={(item) => item.code}
        getName={(item, isArabic) => isArabic ? item.nameAr : item.nameEn}
        getSecondaryName={(item, isArabic) => isArabic ? item.nameEn : item.nameAr}
        getIsDeleted={(item) => item.isDeleted}
        variant="tree-list"
        searchFilter={(item, term) =>
          Boolean(
            item.nameAr?.toLowerCase().includes(term) ||
            item.nameEn?.toLowerCase().includes(term) ||
            item.code?.toLowerCase().includes(term),
          )
        }
        onAddChild={permissions.canCreate && onAddChild ? (item) => onAddChild(item) : undefined}
        onMove={permissions.canEdit ? (item) => {
          setMoveItem(item);
          setSelectedNewParent(item.parentCostCenterId ?? "root");
          setMoveError(null);
        } : undefined}
        onEdit={permissions.canEdit ? onEdit : undefined}
        renderDetailPanel={renderDetailPanel}
        renderEmptyDetailPanel={renderEmptyDetailPanel}
        canDrag={permissions.canEdit}
        onReparent={onReparent}
        selectedId={selectedCostCenterId}
        onSelect={(item) => setSelectedCostCenterId(item ? item.id : null)}
        rootTitle={isAr ? "الشركة / مراكز التكلفة الرئيسية (بدون مركز أب)" : "Company / Root Cost Centers"}
        searchPlaceholder={isAr ? "بحث في شجرة مراكز التكلفة..." : "Search cost centers tree..."}
        loading={loading}
        detailPanelWidth={420}
      />

      {/* Direct Move Dialog */}
      {moveItem && (
        <Dialog
          open={Boolean(moveItem)}
          onClose={() => !isSubmittingMove && setMoveItem(null)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 700 }}>
            {isAr ? "نقل مركز التكلفة" : "Move Cost Center"}
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {isAr
                ? `اختر مركز التكلفة الأب الجديد للمركز: "${isAr ? moveItem.nameAr : moveItem.nameEn}" (${moveItem.code})`
                : `Select the new parent for: "${moveItem.nameEn}" (${moveItem.code})`}
            </Typography>

            {moveError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {moveError}
              </Alert>
            )}

            <FormControl fullWidth size="small">
              <InputLabel id="select-new-parent-label">
                {isAr ? "مركز التكلفة الأب الجديد" : "New Parent Cost Center"}
              </InputLabel>
              <Select
                labelId="select-new-parent-label"
                value={selectedNewParent}
                label={isAr ? "مركز التكلفة الأب الجديد" : "New Parent Cost Center"}
                onChange={(e) => setSelectedNewParent(e.target.value as number | "root")}
                disabled={isSubmittingMove}
              >
                <MenuItem value="root">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Business fontSize="small" color="primary" />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {isAr ? "الشركة / مركز تكلفة رئيسي" : "Company / Top-Level Cost Center"}
                    </Typography>
                  </Box>
                </MenuItem>

                {activeItems
                  .filter((x) => {
                    if (x.id === moveItem.id) return false;
                    const descendants = getDescendantIds(moveItem.id);
                    if (descendants.has(x.id)) return false;
                    return true;
                  })
                  .map((cand) => (
                    <MenuItem key={cand.id} value={cand.id}>
                      {cand.code} — {isAr ? cand.nameAr : cand.nameEn}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setMoveItem(null)} disabled={isSubmittingMove}>
              {t("actions.cancel")}
            </Button>
            <Button
              onClick={handleExecuteDirectMove}
              variant="contained"
              disabled={isSubmittingMove}
            >
              {isSubmittingMove ? t("general.loading") : (isAr ? "حفظ النقل" : "Save Move")}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}
