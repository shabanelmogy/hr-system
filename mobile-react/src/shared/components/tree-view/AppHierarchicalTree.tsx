import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { AppText } from '@/src/shared/components/typography/AppText';
import { AppIcon, type AppIconName } from '@/src/shared/components/icons/AppIcon';
import { AppStatusBadge } from '@/src/shared/components/feedback/AppStatusBadge';
import { AppButton } from '@/src/shared/components/controls/AppButton';
import { AppIconButton } from '@/src/shared/components/controls/AppIconButton';

export type TreeId = string | number;

export interface AppHierarchicalTreeNode<T> {
  id: string;
  item: T;
  children: AppHierarchicalTreeNode<T>[];
}

export interface AppHierarchicalTreeProps<T> {
  items: readonly T[];
  getId: (item: T) => TreeId;
  getParentId: (item: T) => TreeId | null | undefined;
  getLabel: (item: T) => string;
  getSecondaryLabel?: (item: T) => string | undefined;
  getCode?: (item: T) => string | undefined;
  getLeafIcon?: (item: T) => AppIconName;
  getParentIcon?: (item: T) => AppIconName;
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onAddChild?: (item: T) => void;
  onReparent?: (item: T, newParentId: TreeId | null) => Promise<void>;
  renderBadges?: (item: T, childrenCount: number) => React.ReactNode;
  entityName?: string;
  entityNamePlural?: string;
  canEdit?: boolean;
  canCreate?: boolean;
  canDelete?: boolean;
  rootLabel?: string;
  emptyMessage?: string;
  searchPlaceholder?: string;
  isItemDisabled?: (item: T) => boolean;
}

const INDENT_PX = 20;

export function AppHierarchicalTree<T>({
  items,
  getId,
  getParentId,
  getLabel,
  getSecondaryLabel,
  getCode,
  getLeafIcon,
  getParentIcon,
  onView,
  onEdit,
  onDelete,
  onAddChild,
  onReparent,
  renderBadges,
  entityName = 'Element',
  entityNamePlural = 'Elements',
  canEdit = true,
  canCreate = true,
  canDelete = false,
  rootLabel,
  emptyMessage,
  searchPlaceholder,
  isItemDisabled,
}: AppHierarchicalTreeProps<T>) {
  const { t, i18n } = useTranslation();
  const { theme } = useAppTheme();
  const { isRTL } = useLocalization();
  const isAr = (i18n.resolvedLanguage ?? i18n.language).startsWith('ar');

  // Direct move modal state
  const [movingItem, setMovingItem] = useState<T | null>(null);
  const [selectedNewParentId, setSelectedNewParentId] = useState<TreeId | null>(null);
  const [isReparenting, setIsReparenting] = useState(false);
  const [reparentError, setReparentError] = useState<string | null>(null);

  // Normalization helper
  const normalizeParentId = useCallback(
    (item: T): string | null => {
      const itAny = item as any;
      const pid =
        getParentId(item) ??
        itAny.parentCostCenterId ??
        itAny.parentDepartmentId ??
        itAny.parentId ??
        itAny.ParentCostCenterId ??
        itAny.ParentDepartmentId ??
        itAny.ParentId;
      if (pid === null || pid === undefined || pid === 0 || pid === '' || pid === '0') {
        return null;
      }
      return String(pid);
    },
    [getParentId]
  );

  // Build tree data structure (FolderNode / DocNode pattern from ticket_managementsystem)
  const { tree, allIds, nodeMap } = useMemo(() => {
    const byId: Record<string, AppHierarchicalTreeNode<T>> = {};
    const childrenMap: Record<string, AppHierarchicalTreeNode<T>[]> = {};
    const roots: AppHierarchicalTreeNode<T>[] = [];
    const ids = new Set<string>();

    items.forEach((it) => {
      const id = String(getId(it));
      byId[id] = { id, item: it, children: [] };
      ids.add(id);
    });

    items.forEach((it) => {
      const id = String(getId(it));
      const node = byId[id];
      const pid = normalizeParentId(it) || '__root__';
      if (!childrenMap[pid]) childrenMap[pid] = [];
      childrenMap[pid].push(node);
    });

    Object.keys(childrenMap).forEach((pid) => {
      const arr = childrenMap[pid];
      if (pid === '__root__') {
        roots.push(...arr);
      } else {
        const parent = byId[pid];
        if (parent) {
          parent.children = arr;
        } else {
          // If parent is not in current dataset, promote to root
          roots.push(...arr);
        }
      }
    });

    return { tree: roots, allIds: ids, nodeMap: byId };
  }, [items, getId, normalizeParentId]);

  // Expansion state Record<string, boolean> matching ticket_managementsystem
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    allIds.forEach((id) => {
      initial[id] = true;
    });
    return initial;
  });

  // Re-expand all when new items load
  const lastItemsLengthRef = useRef<number>(0);
  useEffect(() => {
    if (items.length > 0 && items.length !== lastItemsLengthRef.current) {
      lastItemsLengthRef.current = items.length;
      const all: Record<string, boolean> = {};
      allIds.forEach((id) => {
        all[id] = true;
      });
      setExpanded(all);
    }
  }, [items.length, allIds]);

  const toggleExpand = useCallback((id: string) => {
    try {
      void Haptics.selectionAsync();
    } catch {}
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const expandAll = useCallback(() => {
    const all: Record<string, boolean> = {};
    allIds.forEach((id) => {
      all[id] = true;
    });
    setExpanded(all);
  }, [allIds]);

  const collapseAll = useCallback(() => {
    setExpanded({});
  }, []);

  // Precompute descendant IDs for safe reparenting
  const getDescendantIds = useCallback(
    (targetId: string): Set<string> => {
      const descendants = new Set<string>();
      const queue = [targetId];
      while (queue.length > 0) {
        const current = queue.shift()!;
        items.forEach((it) => {
          const pid = normalizeParentId(it);
          const itId = String(getId(it));
          if (pid === current && !descendants.has(itId)) {
            descendants.add(itId);
            queue.push(itId);
          }
        });
      }
      return descendants;
    },
    [items, getId, normalizeParentId]
  );

  // Reparent execution
  const handleConfirmReparent = useCallback(async () => {
    if (!movingItem || !onReparent) return;
    setIsReparenting(true);
    setReparentError(null);
    try {
      await onReparent(movingItem, selectedNewParentId);
      setMovingItem(null);
      setSelectedNewParentId(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('feedback.unknownError');
      setReparentError(message);
    } finally {
      setIsReparenting(false);
    }
  }, [movingItem, onReparent, selectedNewParentId, t]);

  // Single TreeRow component modeled on ticket_managementsystem TreeRow.tsx
  const renderTreeRow = (
    node: AppHierarchicalTreeNode<T>,
    depth: number
  ): React.ReactNode => {
    const { item, children, id } = node;
    const hasChildren = children.length > 0;
    const isExpanded = !!expanded[id];
    const label = getLabel(item);
    const secondaryLabel = getSecondaryLabel ? getSecondaryLabel(item) : undefined;
    const code = getCode ? getCode(item) : undefined;
    const isDeleted = isItemDisabled ? isItemDisabled(item) : false;

    // Indentation formula from ticket_managementsystem TreeRow:
    // rowPL = 12 + depth * INDENT_PX
    const rowPL = 12 + depth * INDENT_PX;

    return (
      <View key={id}>
        {/* position: relative so actions can be absolute end-side */}
        <View style={{ position: 'relative' }}>
          <Pressable
            accessibilityLabel={label}
            accessibilityRole="button"
            onPress={() => {
              if (hasChildren) {
                toggleExpand(id);
              } else if (onView) {
                onView(item);
              }
            }}
            style={({ pressed }) => ({
              flexDirection: isRTL ? 'row-reverse' : 'row',
              alignItems: 'center',
              ...(isRTL
                ? { paddingEnd: rowPL, paddingStart: 120 }
                : { paddingStart: rowPL, paddingEnd: 120 }),
              paddingVertical: 7,
              marginHorizontal: 4,
              marginVertical: 1.5,
              borderRadius: 8,
              minHeight: 38,
              backgroundColor: pressed
                ? theme.isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'
                : 'transparent',
            })}
          >
            {/* Folder chevron / expander */}
            {hasChildren ? (
              <Pressable
                accessibilityLabel={isExpanded ? 'Collapse' : 'Expand'}
                accessibilityRole="button"
                hitSlop={10}
                onPress={() => toggleExpand(id)}
                style={{
                  width: 24,
                  height: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginEnd: 4,
                }}
              >
                <AppText style={{ fontSize: 13, color: theme.colors.textMuted }}>
                  {isExpanded ? '▾' : isRTL ? '◂' : '▸'}
                </AppText>
              </Pressable>
            ) : (
              <View
                style={{
                  width: 24,
                  height: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginEnd: 4,
                }}
              >
                <View
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 2.5,
                    backgroundColor: theme.isDark ? '#94a3b8' : '#64748b',
                  }}
                />
              </View>
            )}

            {/* Folder / Entity icon */}
            <View style={{ marginEnd: 6, alignItems: 'center', justifyContent: 'center' }}>
              {hasChildren ? (
                <AppText style={{ fontSize: 16, lineHeight: 20 }}>
                  {isExpanded ? '📂' : '📁'}
                </AppText>
              ) : (
                <AppText style={{ fontSize: 15, lineHeight: 19 }}>
                  🗃️
                </AppText>
              )}
            </View>

            {/* Code Badge Pill */}
            {code ? (
              <View
                style={{
                  backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                  borderColor: theme.isDark ? 'rgba(255,255,255,0.18)' : '#e2e8f0',
                  borderWidth: 1,
                  borderRadius: 4,
                  paddingHorizontal: 6,
                  paddingVertical: 1.5,
                  marginEnd: 6,
                }}
              >
                <AppText
                  color="default"
                  style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: '800' }}
                >
                  {code}
                </AppText>
              </View>
            ) : null}

            {/* Title / Label */}
            <View
              style={{
                flex: 1,
                flexDirection: isRTL ? 'row-reverse' : 'row',
                alignItems: 'baseline',
                gap: 4,
                minWidth: 0,
              }}
            >
              <AppText
                numberOfLines={1}
                style={{
                  fontSize: 13,
                  fontWeight: hasChildren ? '700' : '500',
                  textDecorationLine: isDeleted ? 'line-through' : 'none',
                  opacity: isDeleted ? 0.6 : 1,
                }}
              >
                {label}
              </AppText>

              {/* Child Count Badge (Amber Circle centered on parent row) */}
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
            </View>
          </Pressable>

          {/* Actions — absolute end side, matching ticket_managementsystem TreeRow */}
          <View
            style={{
              position: 'absolute',
              ...(isRTL ? { left: 6 } : { right: 6 }),
              top: 0,
              bottom: 0,
              flexDirection: isRTL ? 'row-reverse' : 'row',
              alignItems: 'center',
              gap: 4,
            }}
          >

            {/* Action 1: Add Child (+) */}
            {canCreate && onAddChild ? (
              <Pressable
                accessibilityLabel={isAr ? 'إضافة فرعي' : 'Add Child'}
                accessibilityRole="button"
                hitSlop={6}
                onPress={() => onAddChild(item)}
                style={({ pressed }) => ({
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: pressed ? 'rgba(16,185,129,0.3)' : 'rgba(16,185,129,0.15)',
                })}
              >
                <AppText style={{ fontSize: 13, color: '#10b981', fontWeight: '800' }}>+</AppText>
              </Pressable>
            ) : null}

            {/* Action 2: View (👁️) */}
            {onView ? (
              <Pressable
                accessibilityLabel={isAr ? 'عرض' : 'View'}
                accessibilityRole="button"
                hitSlop={6}
                onPress={() => onView(item)}
                style={({ pressed }) => ({
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: pressed ? `${theme.colors.primary}30` : `${theme.colors.primary}18`,
                })}
              >
                <AppIcon color={theme.colors.primary} name="eye-outline" size={13} />
              </Pressable>
            ) : null}

            {/* Action 3: Delete (✕ / 🗑️) */}
            {canDelete && onDelete ? (
              <Pressable
                accessibilityLabel={isAr ? 'حذف' : 'Delete'}
                accessibilityRole="button"
                hitSlop={6}
                onPress={() => onDelete(item)}
                style={({ pressed }) => ({
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: pressed ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.15)',
                })}
              >
                <AppText style={{ fontSize: 12, color: '#ef4444', fontWeight: '800' }}>✕</AppText>
              </Pressable>
            ) : null}
          </View>
        </View>

        {/* Children — recursive render matching ticket_managementsystem */}
        {hasChildren && isExpanded && (
          <View>
            {children.map((child) => renderTreeRow(child, depth + 1))}
          </View>
        )}
      </View>
    );
  };

  if (items.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
        <AppText color="muted" variant="body">
          {emptyMessage ?? t('organizationalStructure.empty')}
        </AppText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        horizontal={false}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
      >
        {/* Web Replica Top Banner (Dashed border: Company / Root Cost Centers) */}
        <View
          style={[
            styles.webRootBanner,
            isRTL && styles.webRootBannerRTL,
            {
              backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
              borderColor: theme.isDark ? 'rgba(255,255,255,0.15)' : '#cbd5e1',
            },
          ]}
        >
          <View style={[styles.webRootBannerLeft, isRTL && styles.webRootBannerLeftRTL]}>
            <AppText style={{ fontSize: 15, marginEnd: 6 }}>📁</AppText>
            <AppText
              color={theme.isDark ? 'primary' : 'primary'}
              style={styles.webRootBannerText}
              weight="700"
            >
              {rootLabel ?? (isAr ? 'المستوى الرئيسي للشركة (بدون مركز أب)' : 'Company Top Level (No Parent)')}
            </AppText>
          </View>

          {/* Quick expand/collapse controls */}
          <View style={[styles.webRootBannerActions, isRTL && styles.webRootBannerActionsRTL]}>
            <Pressable
              accessibilityLabel={isAr ? 'فتح الكل' : 'Expand All'}
              hitSlop={8}
              onPress={expandAll}
              style={styles.bannerActionBtn}
              testID="btn-expand-all"
            >
              <AppIcon color={theme.colors.textMuted} name="chevron-down-outline" size={16} />
            </Pressable>
            <Pressable
              accessibilityLabel={isAr ? 'إغلاق الكل' : 'Collapse All'}
              hitSlop={8}
              onPress={collapseAll}
              style={styles.bannerActionBtn}
              testID="btn-collapse-all"
            >
              <AppIcon color={theme.colors.textMuted} name="chevron-up-outline" size={16} />
            </Pressable>
          </View>
        </View>

        {/* Tree Nodes List */}
        <View style={styles.treeList}>
          {tree.map((rootNode) => renderTreeRow(rootNode, 0))}
        </View>
      </ScrollView>

      {/* Reparent Move Dialog */}
      {movingItem ? (
        <Modal
          animationType="fade"
          onRequestClose={() => !isReparenting && setMovingItem(null)}
          transparent
          visible={Boolean(movingItem)}
        >
          <View style={styles.modalBackdrop}>
            <View
              style={[
                styles.modalCard,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              ]}
            >
              <AppText style={styles.modalTitle} weight="800">
                {isAr ? `نقل ${entityName}` : `Move ${entityName}`}
              </AppText>
              <AppText color="muted" variant="body" style={styles.modalSubtitle}>
                {isAr
                  ? `اختر المستوى الجديد للعنصر: "${getLabel(movingItem)}"`
                  : `Select new parent for: "${getLabel(movingItem)}"`}
              </AppText>

              {reparentError ? (
                <View style={styles.errorNoticeBox}>
                  <AppText color="danger" variant="caption">
                    {reparentError}
                  </AppText>
                </View>
              ) : null}

              <ScrollView style={styles.parentPickerScroll}>
                {/* Option 1: Top-level root */}
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setSelectedNewParentId(null)}
                  style={[
                    styles.parentOptionRow,
                    selectedNewParentId === null && {
                      backgroundColor: `${theme.colors.primary}15`,
                      borderColor: theme.colors.primary,
                    },
                  ]}
                >
                  <AppIcon
                    color={selectedNewParentId === null ? theme.colors.primary : theme.colors.textMuted}
                    name="business-outline"
                    size={18}
                  />
                  <AppText
                    color={selectedNewParentId === null ? 'primary' : 'default'}
                    weight={selectedNewParentId === null ? '700' : '400'}
                  >
                    {rootLabel ?? (isAr ? 'المستوى الرئيسي (بدون أب)' : 'Root (No parent)')}
                  </AppText>
                </Pressable>

                {/* Option 2: Existing valid nodes */}
                {(() => {
                  const movingId = String(getId(movingItem));
                  const invalidIds = getDescendantIds(movingId);
                  invalidIds.add(movingId);

                  return items
                    .filter((candidate) => !invalidIds.has(String(getId(candidate))))
                    .map((candidate) => {
                      const cid = getId(candidate);
                      const isCandidateSelected = selectedNewParentId !== null && String(selectedNewParentId) === String(cid);
                      return (
                        <Pressable
                          key={String(cid)}
                          accessibilityRole="button"
                          onPress={() => setSelectedNewParentId(cid)}
                          style={[
                            styles.parentOptionRow,
                            isCandidateSelected && {
                              backgroundColor: `${theme.colors.primary}15`,
                              borderColor: theme.colors.primary,
                            },
                          ]}
                        >
                          <AppIcon
                            color={isCandidateSelected ? theme.colors.primary : theme.colors.textMuted}
                            name="folder-outline"
                            size={18}
                          />
                          <View style={styles.parentOptionTextGroup}>
                            <AppText
                              color={isCandidateSelected ? 'primary' : 'default'}
                              weight={isCandidateSelected ? '700' : '400'}
                            >
                              {getLabel(candidate)}
                            </AppText>
                            {getCode && getCode(candidate) ? (
                              <AppText color="muted" variant="caption">
                                {getCode(candidate)}
                              </AppText>
                            ) : null}
                          </View>
                        </Pressable>
                      );
                    });
                })()}
              </ScrollView>

              <View style={styles.modalActionButtons}>
                <AppButton
                  disabled={isReparenting}
                  onPress={() => setMovingItem(null)}
                  variant="outline"
                >
                  {t('common.cancel')}
                </AppButton>
                <AppButton
                  disabled={isReparenting}
                  loading={isReparenting}
                  onPress={handleConfirmReparent}
                  variant="primary"
                >
                  {isAr ? 'تأكيد النقل' : 'Confirm Move'}
                </AppButton>
              </View>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

// Aliases for intuitive discovery
export const AppTreeView = AppHierarchicalTree;
export type AppTreeViewProps<T> = AppHierarchicalTreeProps<T>;

const styles = StyleSheet.create({
  container: { flex: 1, borderRadius: 10, padding: 8 },
  scrollContent: { paddingBottom: 40 },
  webRootBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 6, borderWidth: 1, borderStyle: 'dashed', marginBottom: 10 },
  webRootBannerRTL: { flexDirection: 'row-reverse' },
  webRootBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  webRootBannerLeftRTL: { flexDirection: 'row-reverse' },
  webRootBannerText: { fontSize: 13 },
  webRootBannerActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  webRootBannerActionsRTL: { flexDirection: 'row-reverse' },
  bannerActionBtn: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  treeList: { gap: 2 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalCard: { borderRadius: 16, borderWidth: 1, padding: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 17, marginBottom: 4 },
  modalSubtitle: { marginBottom: 16 },
  errorNoticeBox: { padding: 10, borderRadius: 8, backgroundColor: 'rgba(239,68,68,0.1)', marginBottom: 12 },
  parentPickerScroll: { maxHeight: 300, marginBottom: 16 },
  parentOptionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: 'transparent', marginBottom: 6 },
  parentOptionTextGroup: { flex: 1 },
  modalActionButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
});
