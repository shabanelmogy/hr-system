import React, { useState, useMemo, useCallback } from 'react';
import { StyleSheet, View, Pressable, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '@/src/core/theme';
import { useLocalization } from '@/src/core/localization';
import { AppText } from '@/src/shared/components/typography/AppText';
import { AppIcon, type AppIconName } from '@/src/shared/components/icons/AppIcon';
import { AppCard } from '@/src/shared/components/surfaces/AppCard';
import { AppStatusBadge } from '@/src/shared/components/feedback/AppStatusBadge';
import { AppButton } from '@/src/shared/components/controls/AppButton';
import { AppIconButton } from '@/src/shared/components/controls/AppIconButton';

export interface AppInteractiveChartItem<T> {
  /** Underlying domain entity */
  item: T;
  /** Unique key for the item */
  key: string;
  /** Primary label to display */
  label: string;
  /** Secondary label / subtitle (e.g. alternate language or description) */
  secondaryLabel?: string;
  /** Identifier/Code to display in a monospace badge */
  code?: string;
  /** Metric value represented by the chart column */
  value: number;
  /** Optional custom column color */
  color?: string;
  /** Optional status or category badge label */
  badgeLabel?: string;
  /** Optional status or category badge color */
  badgeColor?: string;
  /** Key-value details to display in the details card */
  details?: Array<{ label: string; value: string | number }>;
  /** Optional icon for the item */
  icon?: AppIconName;
}

export interface AppInteractiveEntityChartProps<T> {
  /** Title of the chart section */
  title: string;
  /** Subtitle or helper hint */
  subtitle?: string;
  /** Items to display in the chart */
  data: readonly AppInteractiveChartItem<T>[];
  /** Formatter for values (default: String) */
  formatValue?: (value: number) => string;
  /** Unit label displayed next to value (e.g. 'مراكز فرعية') */
  valueUnit?: string;
  /** Called when user taps to view the item's full profile */
  onViewItem?: (item: T) => void;
  /** Called when user taps to edit the item */
  onEditItem?: (item: T) => void;
  /** Empty state message */
  emptyMessage?: string;
  /** Entity singular display name (e.g. 'مركز تكلفة' / 'Cost Center') */
  entityName?: string;
  /** Custom extra details renderer in the details card */
  renderExtraDetails?: (item: T) => React.ReactNode;
  /** Chart plot height in pixels (default: 220) */
  height?: number;
}

export function AppInteractiveEntityChart<T>({
  title,
  subtitle,
  data,
  formatValue = String,
  valueUnit,
  onViewItem,
  onEditItem,
  emptyMessage = 'لا توجد بيانات متاحة للعرض',
  entityName,
  renderExtraDetails,
  height = 220,
}: AppInteractiveEntityChartProps<T>) {
  const { theme } = useAppTheme();
  const { isRTL } = useLocalization();
  const { t, i18n } = useTranslation();
  const isAr = Boolean((i18n?.resolvedLanguage ?? i18n?.language ?? '')?.startsWith('ar'));

  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const rawMax = useMemo(() => Math.max(0, ...data.map((d) => d.value)), [data]);
  const yMax = useMemo(() => Math.max(1, rawMax), [rawMax]);

  // 3 or 4 horizontal grid intervals like Web CartesianGrid
  const yTicks = useMemo(() => {
    if (yMax <= 2) return [0, 1, 2];
    if (yMax <= 5) return [0, Math.ceil(yMax / 2), yMax];
    const step = Math.ceil(yMax / 3);
    return [0, step, step * 2, yMax];
  }, [yMax]);

  const selectedItem = useMemo(
    () => (selectedKey ? data.find((d) => d.key === selectedKey) : null),
    [data, selectedKey]
  );

  const handleSelectItem = useCallback((item: AppInteractiveChartItem<T>) => {
    try {
      void Haptics.selectionAsync();
    } catch {
      // Haptics optional
    }
    setSelectedKey((prev) => (prev === item.key ? null : item.key));
  }, []);

  if (data.length === 0) {
    return (
      <AppCard style={styles.containerCard}>
        <AppText align="center" color="muted" variant="bodySmall">
          {emptyMessage}
        </AppText>
      </AppCard>
    );
  }

  const plotHeight = height - 50;

  return (
    <AppCard style={styles.containerCard} variant="outlined">
      {/* Web-Style ChartContainer Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View style={[styles.headerIconBadge, { backgroundColor: `${theme.colors.primary}16` }]}>
            <AppIcon color={theme.colors.primary} name="stats-chart-outline" size={18} />
          </View>
          <View style={styles.headerTextGroup}>
            <AppText style={styles.title} weight="700">
              {title}
            </AppText>
            {subtitle ? (
              <AppText color="muted" variant="caption">
                {subtitle}
              </AppText>
            ) : (
              <AppText color="muted" variant="caption">
                {isAr
                  ? 'اضغط على أي عمود لعرض تفاصيل المركز'
                  : 'Tap any column to view entity details'}
              </AppText>
            )}
          </View>
        </View>

        <View style={[styles.countBadge, { backgroundColor: theme.colors.surfaceMuted }]}>
          <AppText color="primary" variant="caption" weight="700">
            {data.length}
          </AppText>
        </View>
      </View>

      {/* Subtle Divider Line matching Web ChartContainer */}
      <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

      {/* Web BarChart Canvas with CartesianGrid and Vertical Columns */}
      <View style={[styles.chartCanvas, { height: plotHeight + 56 }]}>
        {/* Horizontal CartesianGrid lines & Y-Axis Labels */}
        <View pointerEvents="none" style={[styles.cartesianGrid, { height: plotHeight }]}>
          {yTicks.map((tick) => {
            const bottomPercent = (tick / yMax) * 100;
            return (
              <View
                key={tick}
                style={[
                  styles.gridRow,
                  { bottom: `${bottomPercent}%` as any },
                ]}
              >
                <AppText color="muted" style={styles.yAxisLabel}>
                  {tick}
                </AppText>
                <View
                  style={[
                    styles.dashedGridLine,
                    { borderColor: `${theme.colors.border}80` },
                  ]}
                />
              </View>
            );
          })}
        </View>

        {/* Columns Content Scroll Area */}
        <ScrollView
          contentContainerStyle={[
            styles.columnsScrollContent,
            data.length <= 5 && { flexGrow: 1, justifyContent: 'space-around' },
          ]}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {data.map((item) => {
            const isSelected = selectedKey === item.key;
            const barColor = item.color ?? theme.colors.primary;
            const formattedValue = formatValue(item.value);
            const columnHeightPercent = `${Math.max(6, Math.round((item.value / yMax) * 100))}%` as const;

            return (
              <Pressable
                accessibilityLabel={`${item.label}: ${formattedValue}`}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                key={item.key}
                onPress={() => handleSelectItem(item)}
                style={[
                  styles.columnWrapper,
                  isSelected && [
                    styles.columnSelectedWrapper,
                    { backgroundColor: `${theme.colors.primary}10`, borderColor: theme.colors.primary },
                  ],
                ]}
              >
                {/* Column Top: Value Label */}
                <View style={styles.columnValueContainer}>
                  <AppText
                    color={isSelected ? 'primary' : 'default'}
                    style={styles.columnValueText}
                    weight={isSelected ? '800' : '700'}
                  >
                    {formattedValue}
                  </AppText>
                </View>

                {/* Vertical Bar Track & Fill */}
                <View style={[styles.barPlotArea, { height: plotHeight - 28 }]}>
                  <View
                    style={[
                      styles.verticalTrack,
                      {
                        backgroundColor: isSelected
                          ? `${theme.colors.primary}20`
                          : theme.colors.surfaceMuted,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.verticalBarFill,
                        {
                          backgroundColor: isSelected
                            ? theme.colors.primary
                            : barColor,
                          height: columnHeightPercent as any,
                          borderRadius: 4,
                        },
                      ]}
                    />
                  </View>
                </View>

                {/* Column Bottom: X-Axis Label & Code */}
                <View style={styles.columnLabelContainer}>
                  {item.code ? (
                    <View style={[styles.codeBadge, { backgroundColor: theme.colors.surfaceMuted }]}>
                      <AppText style={[styles.codeText, { color: theme.colors.primary }]}>
                        {item.code}
                      </AppText>
                    </View>
                  ) : null}
                  <AppText
                    align="center"
                    color={isSelected ? 'primary' : 'default'}
                    numberOfLines={1}
                    style={styles.columnLabel}
                    weight={isSelected ? '700' : '500'}
                  >
                    {item.label}
                  </AppText>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Selected Entity Details Card (Web-Style CustomTooltip / Card) */}
      {selectedItem ? (
        <View
          style={[
            styles.detailsCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.primary,
            },
          ]}
        >
          {/* Details Header */}
          <View style={styles.detailsHeader}>
            <View style={styles.detailsTitleRow}>
              {selectedItem.icon ? (
                <View
                  style={[
                    styles.detailsIconBadge,
                    { backgroundColor: `${theme.colors.primary}18` },
                  ]}
                >
                  <AppIcon
                    color={theme.colors.primary}
                    name={selectedItem.icon}
                    size={20}
                  />
                </View>
              ) : null}
              <View style={styles.detailsTitleTextGroup}>
                <View style={styles.detailsCodeAndName}>
                  {selectedItem.code ? (
                    <View
                      style={[
                        styles.codeBadge,
                        { backgroundColor: theme.colors.surfaceMuted },
                      ]}
                    >
                      <AppText style={[styles.codeText, { color: theme.colors.primary }]}>
                        {selectedItem.code}
                      </AppText>
                    </View>
                  ) : null}
                  <AppText numberOfLines={1} style={styles.detailsName} weight="700">
                    {selectedItem.label}
                  </AppText>
                </View>
                {selectedItem.secondaryLabel ? (
                  <AppText color="muted" variant="caption">
                    {selectedItem.secondaryLabel}
                  </AppText>
                ) : null}
              </View>
            </View>

            <AppIconButton
              icon="close-outline"
              label={isAr ? 'إغلاق' : 'Close'}
              onPress={() => setSelectedKey(null)}
              size={20}
            />
          </View>

          {/* Details Key-Value Table */}
          {selectedItem.details && selectedItem.details.length > 0 ? (
            <View style={[styles.detailsPairsList, { backgroundColor: theme.colors.surfaceMuted }]}>
              {selectedItem.details.map((pair, idx) => (
                <View key={idx} style={styles.detailPairRow}>
                  <AppText color="muted" variant="caption">
                    {pair.label}
                  </AppText>
                  <AppText variant="caption" weight="700">
                    {String(pair.value)}
                  </AppText>
                </View>
              ))}
            </View>
          ) : null}

          {/* Custom Extra Details */}
          {renderExtraDetails ? renderExtraDetails(selectedItem.item) : null}

          {/* Action Buttons */}
          <View style={styles.detailsActionsRow}>
            {onViewItem ? (
              <AppButton
                icon="eye-outline"
                onPress={() => onViewItem(selectedItem.item)}
                size="sm"
                style={styles.actionBtn}
                variant="primary"
              >
                {isAr
                  ? `عرض تفاصيل ${entityName ?? 'العنصر'}`
                  : `View ${entityName ?? 'Item'} Details`}
              </AppButton>
            ) : null}

            {onEditItem ? (
              <AppButton
                icon="create-outline"
                onPress={() => onEditItem(selectedItem.item)}
                size="sm"
                style={styles.actionBtn}
                variant="outline"
              >
                {isAr ? 'تعديل' : 'Edit'}
              </AppButton>
            ) : null}
          </View>
        </View>
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  containerCard: {
    padding: 14,
    borderRadius: 14,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextGroup: {
    flex: 1,
    gap: 1,
  },
  title: {
    fontSize: 15,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  divider: {
    height: 1,
    opacity: 0.35,
    marginVertical: 2,
  },
  chartCanvas: {
    position: 'relative',
    width: '100%',
    marginTop: 6,
  },
  cartesianGrid: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 20,
    zIndex: 1,
  },
  gridRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  yAxisLabel: {
    fontSize: 10,
    width: 18,
    textAlign: 'right',
    fontFamily: 'monospace',
  },
  dashedGridLine: {
    flex: 1,
    borderBottomWidth: 1,
    borderStyle: 'dashed',
  },
  columnsScrollContent: {
    paddingLeft: 24,
    paddingRight: 12,
    alignItems: 'flex-end',
    gap: 10,
    zIndex: 2,
  },
  columnWrapper: {
    width: 58,
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 4,
    paddingVertical: 6,
    borderRadius: 8,
  },
  columnSelectedWrapper: {
    borderWidth: 1,
  },
  columnValueContainer: {
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  columnValueText: {
    fontSize: 11,
  },
  barPlotArea: {
    width: 32,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  verticalTrack: {
    width: 24,
    height: '100%',
    justifyContent: 'flex-end',
    borderRadius: 4,
    overflow: 'hidden',
  },
  verticalBarFill: {
    width: '100%',
  },
  columnLabelContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
  codeBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  codeText: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '800',
  },
  columnLabel: {
    fontSize: 10,
    width: 54,
  },
  detailsCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 10,
    marginTop: 8,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  detailsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  detailsIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsTitleTextGroup: {
    flex: 1,
    gap: 1,
  },
  detailsCodeAndName: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  detailsName: {
    fontSize: 14,
  },
  detailsPairsList: {
    padding: 8,
    borderRadius: 6,
    gap: 5,
  },
  detailPairRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailsActionsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  actionBtn: {
    flex: 1,
  },
});
