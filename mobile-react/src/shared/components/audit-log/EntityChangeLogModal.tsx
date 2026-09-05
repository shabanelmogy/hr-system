import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/src/core/theme';
import { useLocalization } from '@/src/core/localization';
import { AppStateView } from '@/src/shared/components/feedback/AppStateView';
import { AppIcon } from '@/src/shared/components/icons/AppIcon';
import { AppCard } from '@/src/shared/components/surfaces/AppCard';
import { AppModal } from '@/src/shared/components/surfaces/AppModal';
import { AppText } from '@/src/shared/components/typography/AppText';

export interface EntityChangeLogEntry {
  id?: string | number;
  changeLogId: string | number;
  entityName?: string;
  key: string;
  oldValue?: string;
  newValue?: string;
  changedBy: string;
  changedAt: string;
  changedByPc?: string;
}

export interface EntityChangeLogModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  entityName?: string;
  entityCode?: string;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  logs?: EntityChangeLogEntry[];
}

interface GroupedChangeLog {
  changeLogId: string | number;
  changedBy: string;
  changedAt: string;
  changedByPc: string;
  items: EntityChangeLogEntry[];
}

export function EntityChangeLogModal({
  visible,
  onClose,
  title,
  subtitle,
  entityName,
  entityCode,
  loading: isLoading = false,
  error,
  onRetry,
  logs = [],
}: EntityChangeLogModalProps) {
  const { t, i18n } = useTranslation();
  const { theme } = useAppTheme();
  const { direction, isRTL } = useLocalization();
  const isAr = (i18n.resolvedLanguage ?? i18n.language).startsWith('ar');

  const groupedLogs = useMemo<GroupedChangeLog[]>(() => {
    if (!logs || !Array.isArray(logs)) return [];

    const map = new Map<string | number, GroupedChangeLog>();

    for (const log of logs) {
      const gId = log.changeLogId || (log.id ? String(log.id) : `${log.changedAt}_${log.changedBy}`);
      if (!map.has(gId)) {
        map.set(gId, {
          changeLogId: gId,
          changedBy: log.changedBy || (isAr ? 'مستخدم النظام' : 'System User'),
          changedAt: log.changedAt,
          changedByPc: log.changedByPc || '',
          items: [],
        });
      }
      map.get(gId)!.items.push(log);
    }

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
    );
  }, [isAr, logs]);

  const formatDate = (isoString: string) => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return d.toLocaleString(isAr ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const formatKeyName = (key: string) => {
    if (!key) return '-';
    const translationKey = `organizationalStructure.fields.${key.charAt(0).toLowerCase() + key.slice(1)}`;
    const translated = t(translationKey);
    if (translated && translated !== translationKey) return translated;
    return key.replace(/([A-Z])/g, ' $1').trim();
  };

  const subtitleText = subtitle || [entityCode ? `[${entityCode}]` : null, entityName].filter(Boolean).join(' ');

  return (
    <AppModal
      animationType="slide"
      closeLabel={t('common.close')}
      icon="time-outline"
      onClose={onClose}
      subtitle={subtitleText || undefined}
      title={title || (isAr ? 'سجل التعديلات والتدقيق' : 'Change History & Audit Trail')}
      variant="fullScreen"
      visible={visible}
    >
      {isLoading ? (
        <AppStateView message={t('feedback.loading')} state="loading" />
      ) : error ? (
        <AppStateView message={t('feedback.unknownError')} onRetry={onRetry} state="error" />
      ) : groupedLogs.length === 0 ? (
        <AppStateView
          message={
            isAr
              ? 'لم يتم تسجيل أي تعديل على هذا العنصر حتى الآن'
              : 'No modifications have been recorded for this item yet'
          }
          state="empty"
          title={isAr ? 'لا توجد حركات تعديل' : 'No Changes Found'}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {groupedLogs.map((group, groupIdx) => (
            <AppCard key={group.changeLogId || groupIdx} padding="md" style={styles.groupCard}>
              {/* Group Header */}
              <View style={[styles.groupHeader, { direction }]}>
                <View style={styles.userSection}>
                  <AppIcon color={theme.colors.primary} name="person-outline" size={18} />
                  <AppText style={{ color: theme.colors.text }} variant="bodySmall" weight="700">
                    {group.changedBy}
                  </AppText>
                </View>

                <View style={styles.metaSection}>
                  <View style={styles.metaItem}>
                    <AppIcon color={theme.colors.textMuted} name="time-outline" size={14} />
                    <AppText color="muted" variant="caption">
                      {formatDate(group.changedAt)}
                    </AppText>
                  </View>
                  {group.changedByPc ? (
                    <View style={styles.metaItem}>
                      <AppIcon color={theme.colors.textMuted} name="desktop-outline" size={14} />
                      <AppText color="muted" variant="caption">
                        {group.changedByPc}
                      </AppText>
                    </View>
                  ) : null}
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

              {/* Changed Properties List */}
              <View style={styles.diffList}>
                {group.items.map((item, itemIdx) => (
                  <View
                    key={item.id || itemIdx}
                    style={[
                      styles.diffRow,
                      {
                        backgroundColor: theme.colors.surfaceMuted,
                        borderColor: theme.colors.border,
                      },
                    ]}
                  >
                    <View style={styles.fieldHeader}>
                      <AppText color="primary" variant="caption" weight="700">
                        {formatKeyName(item.key)}
                      </AppText>
                    </View>

                    <View style={[styles.valuesComparison, { direction }]}>
                      {/* Old Value */}
                      <View style={styles.valueBox}>
                        <AppText color="muted" style={styles.valueLabel} variant="caption">
                          {isAr ? 'السابقة:' : 'Old:'}
                        </AppText>
                        {item.oldValue ? (
                          <View
                            style={[
                              styles.diffBadge,
                              {
                                backgroundColor: `${theme.colors.danger}18`,
                                borderColor: `${theme.colors.danger}40`,
                              },
                            ]}
                          >
                            <AppText
                              numberOfLines={2}
                              style={{ color: theme.colors.danger, textDecorationLine: 'line-through' }}
                              variant="caption"
                            >
                              {item.oldValue}
                            </AppText>
                          </View>
                        ) : (
                          <AppText color="muted" variant="caption">
                            {isAr ? 'فارغ' : 'Empty'}
                          </AppText>
                        )}
                      </View>

                      {/* Direction Arrow */}
                      <View style={styles.arrowContainer}>
                        <AppIcon
                          color={theme.colors.textMuted}
                          name={isRTL ? 'arrow-back-outline' : 'arrow-forward-outline'}
                          size={16}
                        />
                      </View>

                      {/* New Value */}
                      <View style={styles.valueBox}>
                        <AppText color="muted" style={styles.valueLabel} variant="caption">
                          {isAr ? 'الجديدة:' : 'New:'}
                        </AppText>
                        {item.newValue ? (
                          <View
                            style={[
                              styles.diffBadge,
                              {
                                backgroundColor: `${theme.colors.success}18`,
                                borderColor: `${theme.colors.success}40`,
                              },
                            ]}
                          >
                            <AppText
                              numberOfLines={2}
                              style={{ color: theme.colors.success }}
                              variant="caption"
                              weight="700"
                            >
                              {item.newValue}
                            </AppText>
                          </View>
                        ) : (
                          <AppText color="muted" variant="caption">
                            {isAr ? 'فارغ' : 'Empty'}
                          </AppText>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </AppCard>
          ))}
        </ScrollView>
      )}
    </AppModal>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: 12,
    paddingBottom: 24,
  },
  groupCard: {
    gap: 10,
    borderRadius: 12,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  diffList: {
    gap: 8,
  },
  diffRow: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valuesComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  valueBox: {
    flex: 1,
    gap: 2,
  },
  valueLabel: {
    fontSize: 10,
  },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  arrowContainer: {
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
