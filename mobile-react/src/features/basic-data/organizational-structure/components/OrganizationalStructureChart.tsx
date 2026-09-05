import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/src/core/theme';
import {
  AppChartSummary,
  AppInteractiveEntityChart,
  AppStateView,
  AppText,
  type AppInteractiveChartItem,
} from '@/src/shared/components';
import type {
  OrganizationalResource,
  OrganizationalStructureItem,
} from '../types/organizational-structure';

export interface OrganizationalStructureChartProps {
  items: readonly OrganizationalStructureItem[];
  totalCount: number;
  resource: OrganizationalResource;
  onView?: (item: OrganizationalStructureItem) => void;
  onEdit?: (item: OrganizationalStructureItem) => void;
  canEdit?: boolean;
}

export function OrganizationalStructureChart({
  items,
  totalCount,
  resource,
  onView,
  onEdit,
  canEdit,
}: OrganizationalStructureChartProps) {
  const { i18n, t } = useTranslation();
  const { theme } = useAppTheme();
  const isAr = Boolean((i18n?.resolvedLanguage ?? i18n?.language ?? '')?.startsWith('ar'));

  // Compute child count for hierarchical resources (cost-centers, departments)
  const subCountsMap = useMemo(() => {
    const map = new Map<number, number>();
    items.forEach((it) => {
      const pid = resource === 'cost-centers' ? it.parentCostCenterId : it.parentDepartmentId;
      if (pid != null) {
        map.set(pid, (map.get(pid) ?? 0) + 1);
      }
    });
    return map;
  }, [items, resource]);

  const isCostCenter = resource === 'cost-centers';
  const isDepartment = resource === 'departments';
  const isHierarchical = isCostCenter || isDepartment;

  const { rootCount, subCount } = useMemo(() => {
    if (!isHierarchical) return { rootCount: 0, subCount: 0 };
    let roots = 0;
    items.forEach((it) => {
      const pid = isCostCenter ? it.parentCostCenterId : it.parentDepartmentId;
      if (pid == null) roots++;
    });
    return { rootCount: roots, subCount: items.length - roots };
  }, [items, isHierarchical, isCostCenter]);

  const chartData: AppInteractiveChartItem<OrganizationalStructureItem>[] = useMemo(() => {
    return items.map((item) => {
      const label = isAr ? item.nameAr : item.nameEn;
      const secondaryLabel = isAr ? item.nameEn : item.nameAr;
      const isRoot = isCostCenter
        ? item.parentCostCenterId == null
        : isDepartment
        ? item.parentDepartmentId == null
        : true;
      const subCountVal = subCountsMap.get(item.id) ?? 0;

      let value = 1;
      if (isCostCenter || isDepartment) {
        value = subCountVal;
      } else if (resource === 'positions') {
        value = item.targetHeadcount ?? 0;
      } else if (resource === 'job-levels') {
        value = item.levelOrder ?? 1;
      }

      const parentName = isAr
        ? (item.parentNameAr ?? item.parentNameEn)
        : (item.parentNameEn ?? item.parentNameAr);

      const details: Array<{ label: string; value: string | number }> = [];

      if (isCostCenter) {
        details.push({
          label: isAr ? 'نوع مركز التكلفة' : 'Center Type',
          value: isRoot
            ? (isAr ? 'مركز رئيسي' : 'Main Center')
            : (isAr ? 'مركز فرعي' : 'Sub Center'),
        });
        details.push({
          label: isAr ? 'المركز الأب' : 'Parent Center',
          value: parentName || (isAr ? 'مستوى رئيسي (بدون أب)' : 'Top Level (None)'),
        });
        details.push({
          label: isAr ? 'المراكز الفرعية التابعة' : 'Direct Sub-Centers',
          value: subCountVal,
        });
      } else if (isDepartment) {
        details.push({
          label: isAr ? 'نوع الإدارة' : 'Department Type',
          value: item.isCentralized
            ? (isAr ? 'مركزية (عامة لكل الفروع)' : 'Centralized')
            : isRoot
            ? (isAr ? 'إدارة رئيسية' : 'Main Department')
            : (isAr ? 'إدارة فرعية' : 'Sub Department'),
        });
        details.push({
          label: isAr ? 'الإدارة الأب' : 'Parent Department',
          value: parentName || (isAr ? 'إدارة رئيسية' : 'Top Level'),
        });
        details.push({
          label: isAr ? 'الفروع التابعة' : 'Direct Sub-Branches',
          value: subCountVal,
        });
      } else if (resource === 'positions') {
        details.push({
          label: isAr ? 'العدد المستهدف' : 'Target Headcount',
          value: item.targetHeadcount ?? 0,
        });
        if (item.jobTitleNameAr || item.jobTitleNameEn) {
          details.push({
            label: isAr ? 'المسمى الوظيفي' : 'Job Title',
            value: (isAr ? item.jobTitleNameAr : item.jobTitleNameEn) ?? '-',
          });
        }
      }

      details.push({
        label: isAr ? 'الحالة' : 'Status',
        value: item.isDeleted
          ? t('organizationalStructure.status.archived')
          : t('organizationalStructure.status.active'),
      });

      const desc = isAr ? item.descriptionAr : item.descriptionEn;
      if (desc) {
        details.push({
          label: isAr ? 'الوصف' : 'Description',
          value: desc,
        });
      }

      return {
        item,
        key: String(item.id),
        code: item.code,
        label,
        secondaryLabel,
        value,
        color: isRoot ? theme.colors.primary : theme.colors.secondary,
        badgeLabel: isHierarchical
          ? isRoot
            ? (isAr ? 'رئيسي' : 'Main')
            : (isAr ? 'فرعي' : 'Sub')
          : undefined,
        badgeColor: isRoot ? theme.colors.primary : theme.colors.secondary,
        icon: isCostCenter
          ? 'wallet-outline'
          : isDepartment
          ? 'git-network-outline'
          : 'business-outline',
        details,
      };
    });
  }, [items, isAr, isCostCenter, isDepartment, isHierarchical, resource, subCountsMap, theme.colors.primary, theme.colors.secondary, t]);

  const summaryItems = useMemo(() => {
    const base = [
      { key: 'matching', label: t('organizationalStructure.chart.totalMatching'), value: totalCount },
      { key: 'loaded', label: t('organizationalStructure.chart.visible'), value: items.length },
    ];
    if (isCostCenter) {
      base.push(
        { key: 'main', label: isAr ? 'مراكز رئيسية' : 'Main Centers', value: rootCount },
        { key: 'sub', label: isAr ? 'مراكز فرعية' : 'Sub Centers', value: subCount }
      );
    } else if (isDepartment) {
      base.push(
        { key: 'main', label: isAr ? 'إدارات رئيسية' : 'Main Depts', value: rootCount },
        { key: 'sub', label: isAr ? 'إدارات فرعية' : 'Sub Depts', value: subCount }
      );
    }
    return base;
  }, [totalCount, items.length, isCostCenter, isDepartment, isAr, rootCount, subCount, t]);

  const entityName = isCostCenter
    ? (isAr ? 'مركز التكلفة' : 'Cost Center')
    : isDepartment
    ? (isAr ? 'الإدارة' : 'Department')
    : t(`organizationalStructure.resources.${resource}`);

  const chartTitle = isCostCenter
    ? (isAr ? 'مخطط مراكز التكلفة والمراكز التابعة' : 'Cost Centers & Sub-Centers Chart')
    : isDepartment
    ? (isAr ? 'مخطط الإدارات وهيكلية الفروع' : 'Departments & Sub-Branches Chart')
    : t('organizationalStructure.chart.title');

  const valueUnit = isCostCenter
    ? (isAr ? 'مراكز فرعية' : 'sub-centers')
    : isDepartment
    ? (isAr ? 'فروع فرعية' : 'sub-branches')
    : undefined;

  if (!items.length) {
    return <AppStateView message={t('organizationalStructure.empty')} state="empty" />;
  }

  return (
    <View style={styles.root}>
      {/* Metric Cards Summary */}
      <AppChartSummary items={summaryItems} />

      {/* Interactive Entity Chart with Tap to View Details */}
      <AppInteractiveEntityChart<OrganizationalStructureItem>
        data={chartData}
        emptyMessage={t('organizationalStructure.empty')}
        entityName={entityName}
        onEditItem={canEdit ? onEdit : undefined}
        onViewItem={onView}
        subtitle={t('organizationalStructure.chart.pageScope')}
        title={chartTitle}
        valueUnit={valueUnit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 12,
    paddingHorizontal: 2,
  },
});
