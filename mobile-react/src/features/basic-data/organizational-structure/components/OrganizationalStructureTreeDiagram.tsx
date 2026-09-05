import React, { useMemo, useState, useCallback } from 'react';
import { StyleSheet, View, Pressable, ScrollView, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '@/src/core/theme';
import { useLocalization } from '@/src/core/localization';
import {
  AppButton,
  AppCard,
  AppIcon,
  AppIconButton,
  AppStatusBadge,
  AppText,
  AppTextField,
  AppStateView,
  ConfirmationDialog,
} from '@/src/shared/components';
import { AppHierarchicalTree } from '@/src/shared/components/tree-view/AppHierarchicalTree';
import type {
  OrganizationalResource,
  OrganizationalStructureItem,
} from '../types/organizational-structure';

interface TreeNode {
  item: OrganizationalStructureItem;
  children: TreeNode[];
}

export interface OrganizationalStructureTreeDiagramProps {
  items: readonly OrganizationalStructureItem[];
  resource: OrganizationalResource;
  onView: (item: OrganizationalStructureItem) => void;
  onEdit?: (item: OrganizationalStructureItem) => void;
  onDelete?: (item: OrganizationalStructureItem) => void;
  onAddChild?: (item: OrganizationalStructureItem) => void;
  onReparent?: (item: OrganizationalStructureItem, newParentId: number | null) => Promise<void>;
  onViewLogs?: (item: OrganizationalStructureItem) => void;
  canEdit?: boolean;
  canCreate?: boolean;
  canDelete?: boolean;
}

function DepartmentTreeDiagram({
  items,
  resource,
  onView,
  onEdit,
  onDelete,
  onAddChild,
  onReparent,
  onViewLogs,
  canEdit,
  canCreate,
  canDelete,
}: OrganizationalStructureTreeDiagramProps) {
  const { t, i18n } = useTranslation();
  const { theme } = useAppTheme();
  const { isRTL } = useLocalization();
  const isAr = (i18n.resolvedLanguage ?? i18n.language).startsWith('ar');

  // Drag & Move state
  const [draggingItem, setDraggingItem] = useState<OrganizationalStructureItem | null>(null);
  const [moveModalItem, setMoveModalItem] = useState<OrganizationalStructureItem | null>(null);
  const [moveSearchQuery, setMoveSearchQuery] = useState('');
  const [selectedTargetId, setSelectedTargetId] = useState<number | 'root' | null>(null);
  const [isConfirmingMove, setIsConfirmingMove] = useState(false);
  const [pendingMoveTarget, setPendingMoveTarget] = useState<{
    item: OrganizationalStructureItem;
    targetId: number | null;
    targetName: string;
  } | null>(null);

  const getParentId = useCallback(
    (item: OrganizationalStructureItem): number | null => {
      if (resource === 'departments') return item.parentDepartmentId ?? null;
      if (resource === 'cost-centers') return item.parentCostCenterId ?? null;
      return null;
    },
    [resource]
  );

  // Cycle detection: compute all descendants of an item
  const getDescendantIds = useCallback(
    (itemId: number): Set<number> => {
      const descendants = new Set<number>();
      const queue = [itemId];
      while (queue.length > 0) {
        const current = queue.shift()!;
        items.forEach((it) => {
          const parentId = getParentId(it);
          if (parentId === current && !descendants.has(it.id)) {
            descendants.add(it.id);
            queue.push(it.id);
          }
        });
      }
      return descendants;
    },
    [items, getParentId]
  );

  // Build recursive tree from flat items
  const { tree, allIds } = useMemo(() => {
    const itemMap = new Map<number, TreeNode>();
    const roots: TreeNode[] = [];
    const ids = new Set<number>();

    items.forEach((it) => {
      itemMap.set(it.id, { item: it, children: [] });
      ids.add(it.id);
    });

    items.forEach((it) => {
      const node = itemMap.get(it.id)!;
      const parentId = getParentId(it);

      if (parentId && itemMap.has(parentId)) {
        itemMap.get(parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return { tree: roots, allIds: ids };
  }, [items, getParentId]);

  const [expandedIds, setExpandedIds] = useState<Set<number>>(() => new Set(allIds));

  const toggleExpand = useCallback((id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedIds(new Set(allIds));
  }, [allIds]);

  const collapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  const startDrag = useCallback(
    (item: OrganizationalStructureItem) => {
      try {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {
        // Haptics fallback
      }
      setDraggingItem(item);
    },
    []
  );

  const cancelDrag = useCallback(() => {
    setDraggingItem(null);
  }, []);

  const executeReparent = useCallback(
    async (item: OrganizationalStructureItem, targetId: number | null) => {
      if (!onReparent) return;
      try {
        await onReparent(item, targetId);
      } finally {
        setDraggingItem(null);
        setPendingMoveTarget(null);
        setMoveModalItem(null);
        setMoveSearchQuery('');
      }
    },
    [onReparent]
  );

  const requestMove = useCallback(
    (item: OrganizationalStructureItem, targetId: number | null, targetName: string) => {
      setPendingMoveTarget({ item, targetId, targetName });
    },
    []
  );

  const openMoveModal = useCallback(
    (item: OrganizationalStructureItem) => {
      setMoveModalItem(item);
      setSelectedTargetId(getParentId(item) ?? 'root');
      setMoveSearchQuery('');
    },
    [getParentId]
  );

  const closeMoveModal = useCallback(() => {
    setMoveModalItem(null);
    setMoveSearchQuery('');
  }, []);

  if (!items.length) {
    return <AppStateView message={t('organizationalStructure.empty')} state="empty" />;
  }

  const draggingDescendantIds = draggingItem ? getDescendantIds(draggingItem.id) : new Set<number>();

  const renderNode = (node: TreeNode, depth: number = 0): React.ReactNode => {
    const { item, children } = node;
    const hasChildren = children.length > 0;
    const isExpanded = expandedIds.has(item.id);
    const displayName = isAr ? item.nameAr : item.nameEn;
    const secondaryName = isAr ? item.nameEn : item.nameAr;

    const isCurrentDragging = draggingItem?.id === item.id;
    const isInvalidTarget =
      draggingItem && (item.id === draggingItem.id || draggingDescendantIds.has(item.id));
    const isValidTarget = draggingItem && !isInvalidTarget;

    return (
      <View key={item.id} style={styles.nodeWrapper}>
        <AppCard
          style={[
            styles.nodeCard,
            {
              backgroundColor: isCurrentDragging
                ? `${theme.colors.primary}18`
                : theme.colors.surface,
              borderColor: isCurrentDragging
                ? theme.colors.primary
                : isValidTarget
                ? theme.colors.primary
                : hasChildren
                ? theme.colors.primary
                : theme.colors.border,
              borderWidth: isValidTarget ? 2 : 1,
              borderStyle: isValidTarget ? 'dashed' : 'solid',
            },
          ]}
        >
          {/* Row 1: Left controls (Drag Handle, Chevron, Icon, Code) & Right Status Badges */}
          <View style={styles.nodeHeaderRow}>
            <View style={styles.headerLeftControls}>
              {/* Drag Handle Button */}
              {canEdit && !item.isDeleted && onReparent ? (
                <Pressable
                  hitSlop={8}
                  onPress={() => (isCurrentDragging ? cancelDrag() : startDrag(item))}
                  style={[
                    styles.dragHandle,
                    {
                      backgroundColor: isCurrentDragging
                        ? theme.colors.primary
                        : theme.colors.surfaceMuted,
                      borderColor: isCurrentDragging
                        ? theme.colors.primary
                        : theme.colors.border,
                    },
                  ]}
                >
                  <AppIcon
                    color={isCurrentDragging ? theme.colors.onPrimary : theme.colors.primary}
                    name={isCurrentDragging ? 'close-outline' : 'reorder-two-outline'}
                    size={16}
                  />
                </Pressable>
              ) : null}

              {/* Chevron Toggle */}
              {hasChildren ? (
                <Pressable
                  hitSlop={8}
                  onPress={() => toggleExpand(item.id)}
                  style={styles.chevronButton}
                >
                  <AppIcon
                    color={theme.colors.primary}
                    name={
                      isExpanded
                        ? 'chevron-down-outline'
                        : isRTL
                        ? 'chevron-back-outline'
                        : 'chevron-forward-outline'
                    }
                    size={18}
                  />
                </Pressable>
              ) : (
                <View style={styles.bulletDot}>
                  <View style={[styles.dot, { backgroundColor: theme.colors.textMuted }]} />
                </View>
              )}

              {/* Folder / Resource Icon */}
              <View
                style={[
                  styles.iconBadge,
                  {
                    backgroundColor: hasChildren
                      ? isExpanded
                        ? `${theme.colors.primary}18`
                        : `${theme.colors.warning}18`
                      : theme.colors.surfaceMuted,
                  },
                ]}
              >
                <AppIcon
                  color={
                    hasChildren
                      ? isExpanded
                        ? theme.colors.primary
                        : theme.colors.warning
                      : theme.colors.textMuted
                  }
                  name={
                    hasChildren
                      ? isExpanded
                        ? 'folder-open-outline'
                        : 'folder-outline'
                      : resource === 'cost-centers'
                      ? 'wallet-outline'
                      : 'git-network-outline'
                  }
                  size={16}
                />
              </View>

              {/* Monospace Code Pill */}
              <View style={[styles.codePill, { backgroundColor: theme.colors.surfaceMuted }]}>
                <AppText style={[styles.codeText, { color: theme.colors.primary }]}>
                  {item.code}
                </AppText>
              </View>
            </View>

            {/* Badges on the right of row 1 */}
            <View style={styles.headerRightBadges}>

              {resource === 'departments' && item.isCentralized ? (
                <AppStatusBadge
                  color={theme.colors.secondary}
                  label={isAr ? 'مركزية' : 'Centralized'}
                />
              ) : null}
            </View>
          </View>

          {/* Row 2: Title Line + Child Count */}
          <Pressable onPress={() => onView(item)} style={styles.titleContainer}>
            <AppText style={styles.displayName} weight="700">
              {displayName}
            </AppText>
            {hasChildren ? (
              <View
                style={{
                  minWidth: 18,
                  height: 18,
                  paddingHorizontal: 4,
                  borderRadius: 9,
                  borderWidth: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.isDark ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.1)',
                  borderColor: theme.isDark ? 'rgba(245,158,11,0.6)' : 'rgba(245,158,11,0.35)',
                }}
              >
                <AppText
                  style={{
                    fontSize: 9.5,
                    fontWeight: '700',
                    color: '#b45309',
                    textAlign: 'center',
                    lineHeight: 13,
                  }}
                >
                  {children.length}
                </AppText>
              </View>
            ) : null}
          </Pressable>

          {/* Row 3: Action Buttons Bar */}
          <View style={styles.actionsBar}>
            {/* Move Button (Modal alternative) */}
            {canEdit && !item.isDeleted && onReparent ? (
              <Pressable
                onPress={() => openMoveModal(item)}
                style={[
                  styles.actionButtonChip,
                  { backgroundColor: `${theme.colors.primary}12`, borderColor: `${theme.colors.primary}33` },
                ]}
              >
                <AppIcon color={theme.colors.primary} name="swap-vertical-outline" size={14} />
                <AppText color="primary" style={styles.actionButtonText} weight="700">
                  {isAr ? 'نقل' : 'Move'}
                </AppText>
              </Pressable>
            ) : null}

            {/* View Button */}
            <Pressable
              onPress={() => onView(item)}
              style={[
                styles.actionButtonChip,
                { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border },
              ]}
            >
              <AppIcon color={theme.colors.textMuted} name="eye-outline" size={14} />
              <AppText color="muted" style={styles.actionButtonText}>
                {t('organizationalStructure.view')}
              </AppText>
            </Pressable>

            {/* Change Log Button */}
            {onViewLogs ? (
              <Pressable
                onPress={() => onViewLogs(item)}
                style={[
                  styles.actionButtonChip,
                  { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border },
                ]}
              >
                <AppIcon color={theme.colors.textMuted} name="time-outline" size={14} />
                <AppText color="muted" style={styles.actionButtonText}>
                  {t('actions.changeLog')}
                </AppText>
              </Pressable>
            ) : null}

            {/* Edit Button */}
            {canEdit && !item.isDeleted && onEdit ? (
              <Pressable
                onPress={() => onEdit(item)}
                style={[
                  styles.actionButtonChip,
                  { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border },
                ]}
              >
                <AppIcon color={theme.colors.primary} name="create-outline" size={14} />
                <AppText color="primary" style={styles.actionButtonText}>
                  {t('organizationalStructure.edit')}
                </AppText>
              </Pressable>
            ) : null}

            {/* Add Sub-Node Button */}
            {canCreate && !item.isDeleted && onAddChild ? (
              <Pressable
                onPress={() => onAddChild(item)}
                style={[
                  styles.actionButtonChip,
                  { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border },
                ]}
              >
                <AppIcon color={theme.colors.primary} name="add-circle-outline" size={14} />
                <AppText color="primary" style={styles.actionButtonText}>
                  {isAr ? 'فرع جديد' : 'Add child'}
                </AppText>
              </Pressable>
            ) : null}
          </View>

          {/* Drag Target Drop Button (Full Width, when Drag Mode is active) */}
          {isValidTarget && draggingItem ? (
            <Pressable
              onPress={() => requestMove(draggingItem, item.id, displayName)}
              style={[
                styles.dropTargetButton,
                { backgroundColor: `${theme.colors.primary}18`, borderColor: theme.colors.primary },
              ]}
            >
              <AppIcon color={theme.colors.primary} name="enter-outline" size={18} />
              <AppText color="primary" style={styles.dropTargetText} weight="700">
                {isAr
                  ? `إفلات هنا لتعيين كإدارة أب لـ (${draggingItem.code})`
                  : `Drop here as parent of (${draggingItem.code})`}
              </AppText>
            </Pressable>
          ) : isCurrentDragging ? (
            <View
              style={[
                styles.activeDragNotice,
                { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.primary },
              ]}
            >
              <AppText color="primary" style={styles.activeDragText} weight="700">
                {isAr ? 'جاري النقل... اختر الإدارة الأب أو ألغِ' : 'Moving... select new parent or cancel'}
              </AppText>
            </View>
          ) : null}
        </AppCard>

        {/* Children Branches (clean single-indent via container) */}
        {hasChildren && isExpanded ? (
          <View
            style={[
              styles.childrenContainer,
              {
                borderStartColor: `${theme.colors.primary}44`,
              },
            ]}
          >
            {children.map((child) => renderNode(child, depth + 1))}
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Banner Toolbar */}
      <AppCard style={[styles.toolbarCard, { backgroundColor: theme.colors.surfaceMuted }]}>
        <View style={styles.toolbarContent}>
          <View style={styles.toolbarSummary}>
            <AppIcon color={theme.colors.primary} name="business-outline" size={20} />
            <AppText style={styles.toolbarTitle} weight="700">
              {isAr
                ? `الهيكل الشجري (${items.length} ${
                    resource === 'departments' ? 'إدارة' : 'مركز تكلفة'
                  })`
                : `Tree Hierarchy (${items.length} items)`}
            </AppText>
          </View>

          <View style={styles.toolbarButtons}>
            <Pressable hitSlop={6} onPress={expandAll} style={styles.toolButton}>
              <AppIcon color={theme.colors.primary} name="expand-outline" size={16} />
              <AppText color="primary" variant="caption" weight="700">
                {isAr ? 'فرد الكل' : 'Expand'}
              </AppText>
            </Pressable>

            <View style={[styles.toolDivider, { backgroundColor: theme.colors.border }]} />

            <Pressable hitSlop={6} onPress={collapseAll} style={styles.toolButton}>
              <AppIcon color={theme.colors.textMuted} name="contract-outline" size={16} />
              <AppText color="muted" variant="caption" weight="700">
                {isAr ? 'طي الكل' : 'Collapse'}
              </AppText>
            </Pressable>
          </View>
        </View>
      </AppCard>

      {/* Root Drop Zone (Available when dragging a node) */}
      {draggingItem ? (
        <Pressable
          onPress={() =>
            requestMove(
              draggingItem,
              null,
              isAr ? 'المستوى الرئيسي للشركة' : 'Company Root Level'
            )
          }
          style={[
            styles.rootDropZone,
            {
              backgroundColor: `${theme.colors.primary}15`,
              borderColor: theme.colors.primary,
            },
          ]}
        >
          <AppIcon color={theme.colors.primary} name="home-outline" size={22} />
          <View style={styles.rootDropZoneTextGroup}>
            <AppText color="primary" weight="700">
              {isAr
                ? `إفلات هنا لتعيين (${draggingItem.code}) في المستوى الرئيسي للشركة`
                : `Drop here to set (${draggingItem.code}) as Company Root`}
            </AppText>
            <AppText color="muted" variant="caption">
              {isAr ? 'بدون إدارة أب (إدارة رئيسية مستقلة)' : 'No parent department (top-level)'}
            </AppText>
          </View>
        </Pressable>
      ) : null}

      {/* Tree Nodes */}
      <View style={styles.treeRoot}>{tree.map((rootNode) => renderNode(rootNode, 0))}</View>

      {/* Move Confirmation Dialog */}
      <ConfirmationDialog
        confirmLabel={isAr ? 'تأكيد النقل' : 'Confirm Move'}
        description={
          pendingMoveTarget
            ? isAr
              ? `هل أنت متأكد من نقل (${pendingMoveTarget.item.code} - ${
                  isAr ? pendingMoveTarget.item.nameAr : pendingMoveTarget.item.nameEn
                }) لتصبح تابعة لـ [${pendingMoveTarget.targetName}]؟`
              : `Are you sure you want to move (${pendingMoveTarget.item.code}) under [${pendingMoveTarget.targetName}]?`
            : ''
        }
        loading={isConfirmingMove}
        onCancel={() => setPendingMoveTarget(null)}
        onConfirm={async () => {
          if (!pendingMoveTarget) return;
          setIsConfirmingMove(true);
          try {
            await executeReparent(pendingMoveTarget.item, pendingMoveTarget.targetId);
          } finally {
            setIsConfirmingMove(false);
          }
        }}
        title={isAr ? 'نقل الإدارة' : 'Move Department'}
        tone="default"
        visible={pendingMoveTarget !== null}
      />

      {/* Move Modal (Accessible Picker Alternative with Real-Time Search) */}
      {moveModalItem ? (
        <Modal
          animationType="slide"
          onRequestClose={closeMoveModal}
          transparent
          visible={moveModalItem !== null}
        >
          <View style={styles.modalBackdrop}>
            <AppCard style={[styles.modalCard, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.modalHeader}>
                <AppText style={styles.modalTitle} weight="700">
                  {isAr
                    ? `نقل الإدارة: ${moveModalItem.code}`
                    : `Move Department: ${moveModalItem.code}`}
                </AppText>
                <AppIconButton
                  icon="close-outline"
                  label={isAr ? 'إغلاق' : 'Close'}
                  onPress={closeMoveModal}
                />
              </View>

              <AppText color="muted" style={styles.modalSubtitle} variant="caption">
                {isAr
                  ? 'اختر الإدارة الأب الجديدة من القائمة أدناه:'
                  : 'Select the new parent department below:'}
              </AppText>

              {/* Real-time Search Input */}
              <View style={styles.modalSearchContainer}>
                <AppTextField
                  compact
                  leadingIcon="search-outline"
                  label={isAr ? 'بحث في الإدارات' : 'Search departments'}
                  placeholder={isAr ? 'ابحث بالاسم أو الكود...' : 'Search by name or code...'}
                  value={moveSearchQuery}
                  onChangeText={setMoveSearchQuery}
                  showClearButton={Boolean(moveSearchQuery)}
                  onClear={() => setMoveSearchQuery('')}
                />
              </View>

              <ScrollView style={styles.modalList}>
                {(() => {
                  const query = moveSearchQuery.trim().toLowerCase();
                  const showRoot =
                    !query ||
                    (isAr
                      ? 'المستوى الرئيسي للشركة بدون إدارة أب'.toLowerCase().includes(query)
                      : 'company root level no parent'.includes(query));

                  const forbidden = getDescendantIds(moveModalItem.id);
                  forbidden.add(moveModalItem.id);

                  const filteredTargets = items.filter((target) => {
                    if (forbidden.has(target.id)) return false;
                    if (!query) return true;
                    return (
                      target.code.toLowerCase().includes(query) ||
                      target.nameAr.toLowerCase().includes(query) ||
                      target.nameEn.toLowerCase().includes(query)
                    );
                  });

                  if (!showRoot && filteredTargets.length === 0) {
                    return (
                      <View style={styles.modalEmptySearch}>
                        <AppIcon color={theme.colors.textMuted} name="search-outline" size={28} />
                        <AppText align="center" color="muted" variant="caption">
                          {isAr ? 'لا توجد إدارات مطابقة للبحث' : 'No matching departments found'}
                        </AppText>
                      </View>
                    );
                  }

                  return (
                    <>
                      {/* Option 1: Top Level */}
                      {showRoot ? (
                        <Pressable
                          onPress={() => setSelectedTargetId('root')}
                          style={[
                            styles.modalOption,
                            {
                              backgroundColor:
                                selectedTargetId === 'root'
                                  ? `${theme.colors.primary}18`
                                  : theme.colors.surfaceMuted,
                              borderColor:
                                selectedTargetId === 'root'
                                  ? theme.colors.primary
                                  : theme.colors.border,
                            },
                          ]}
                        >
                          <AppIcon color={theme.colors.primary} name="home-outline" size={18} />
                          <AppText weight={selectedTargetId === 'root' ? '700' : '500'}>
                            {isAr
                              ? 'المستوى الرئيسي للشركة (بدون إدارة أب)'
                              : 'Company Root Level (No Parent)'}
                          </AppText>
                        </Pressable>
                      ) : null}

                      {/* Filtered Candidate Parents */}
                      {filteredTargets.map((target) => (
                        <Pressable
                          key={target.id}
                          onPress={() => setSelectedTargetId(target.id)}
                          style={[
                            styles.modalOption,
                            {
                              backgroundColor:
                                selectedTargetId === target.id
                                  ? `${theme.colors.primary}18`
                                  : theme.colors.surfaceMuted,
                              borderColor:
                                selectedTargetId === target.id
                                  ? theme.colors.primary
                                  : theme.colors.border,
                            },
                          ]}
                        >
                          <AppIcon color={theme.colors.primary} name="folder-outline" size={18} />
                          <AppText weight={selectedTargetId === target.id ? '700' : '500'}>
                            {target.code} — {isAr ? target.nameAr : target.nameEn}
                          </AppText>
                        </Pressable>
                      ))}
                    </>
                  );
                })()}
              </ScrollView>

              <View style={styles.modalActions}>
                <AppButton
                  onPress={closeMoveModal}
                  style={styles.modalButton}
                  variant="outline"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </AppButton>
                <AppButton
                  onPress={async () => {
                    const newParentId = selectedTargetId === 'root' ? null : selectedTargetId;
                    await executeReparent(moveModalItem, newParentId);
                  }}
                  style={styles.modalButton}
                  variant="primary"
                >
                  {isAr ? 'حفظ النقل' : 'Save Move'}
                </AppButton>
              </View>
            </AppCard>
          </View>
        </Modal>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    gap: 8,
  },
  toolbarCard: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  toolbarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  toolbarSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toolbarTitle: {
    fontSize: 14,
  },
  toolbarButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toolButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  toolDivider: {
    width: 1,
    height: 14,
  },
  rootDropZone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: 'dashed',
    marginBottom: 4,
  },
  rootDropZoneTextGroup: {
    flex: 1,
    gap: 2,
  },
  treeRoot: {
    gap: 8,
  },
  nodeWrapper: {
    gap: 4,
  },
  nodeCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  nodeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  headerLeftControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  dragHandle: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronButton: {
    padding: 2,
  },
  bulletDot: {
    width: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  iconBadge: {
    width: 26,
    height: 26,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  codeText: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  headerRightBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  titleContainer: {
    gap: 2,
    paddingVertical: 2,
  },
  displayName: {
    fontSize: 15,
  },
  secondaryName: {
    fontSize: 12,
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
  },
  actionButtonChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 11,
  },
  dropTargetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginTop: 4,
  },
  dropTargetText: {
    fontSize: 12,
  },
  activeDragNotice: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 4,
  },
  activeDragText: {
    fontSize: 11,
  },
  childrenContainer: {
    borderStartWidth: 2,
    marginStart: 14,
    paddingStart: 10,
    gap: 8,
    marginTop: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 16,
    padding: 16,
    maxHeight: '85%',
    gap: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 16,
  },
  modalSubtitle: {
    fontSize: 13,
  },
  modalSearchContainer: {
    marginVertical: 4,
  },
  modalList: {
    maxHeight: 280,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  modalEmptySearch: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
  },
});


// ── COST CENTERS TREE VIEW (Hierarchical TreeView matching Web & ticket_managementsystem) ──
function CostCenterTreeView({
  items,
  onView,
  onEdit,
  onDelete,
  onAddChild,
  onReparent,
  canEdit,
  canCreate,
  canDelete,
}: OrganizationalStructureTreeDiagramProps) {
  const { i18n } = useTranslation();
  const isAr = (i18n.resolvedLanguage ?? i18n.language).startsWith('ar');

  return (
    <AppHierarchicalTree<OrganizationalStructureItem>
      canCreate={canCreate}
      canDelete={canDelete}
      canEdit={canEdit}
      entityName={isAr ? 'مركز تكلفة' : 'Cost Center'}
      entityNamePlural={isAr ? 'مراكز تكلفة' : 'Cost Centers'}
      getCode={(item) => item.code ?? item.costCenterCode}
      getId={(item) => item.id}
      getLabel={(item) => (isAr ? (item.nameAr || item.nameEn) : (item.nameEn || item.nameAr))}
      getLeafIcon={() => 'wallet-outline'}
      getParentId={(item) => item.parentCostCenterId ?? null}
      getSecondaryLabel={(item) => (isAr ? item.nameEn : item.nameAr)}
      isItemDisabled={(item) => item.isDeleted}
      items={items}
      onAddChild={onAddChild}
      onDelete={onDelete}
      onEdit={onEdit}
      onReparent={
        onReparent
          ? (item, newParentId) => onReparent(item, newParentId !== null ? Number(newParentId) : null)
          : undefined
      }
      onView={onView}
      rootLabel={isAr ? 'المستوى الرئيسي للشركة (بدون مركز أب)' : 'Company Root Cost Centers'}
    />
  );
}



export function OrganizationalStructureTreeDiagram(props: OrganizationalStructureTreeDiagramProps) {
  if (props.resource === 'cost-centers') {
    return <CostCenterTreeView {...props} />;
  }
  return <DepartmentTreeDiagram {...props} />;
}
