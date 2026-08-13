import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import {
  themeCatalog,
  themePaletteOrder,
  type ThemePalette,
  useAppTheme,
} from '@/src/core/theme';
import { AppIcon } from '@/src/shared/components/icons/AppIcon';
import { AppText } from '@/src/shared/components/typography/AppText';

interface AppThemePalettePickerProps {
  compact?: boolean;
  onChange: (palette: ThemePalette) => void;
  value: ThemePalette;
}

export function AppThemePalettePicker({
  compact = false,
  onChange,
  value,
}: AppThemePalettePickerProps) {
  const { t } = useTranslation();
  const { direction } = useLocalization();
  const { theme } = useAppTheme();

  return (
    <View
      accessibilityLabel={t('settings.colorPalette')}
      style={[styles.grid, compact ? styles.gridCompact : null]}>
      {themePaletteOrder.map((palette) => {
        const selected = palette === value;
        const preview = themeCatalog[palette].light.colors;

        return (
          <Pressable
            accessibilityLabel={t(`settings.palettes.${palette}`)}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            key={palette}
            onPress={() => onChange(palette)}
            style={({ pressed }) => [
              styles.option,
              compact ? styles.optionCompact : null,
              {
                direction,
                backgroundColor: theme.colors.surface,
                borderColor: selected ? theme.colors.primary : theme.colors.border,
                borderRadius: theme.radius.md,
                opacity: pressed ? 0.78 : 1,
              },
            ]}>
            <View
              style={[
                styles.preview,
                compact ? styles.previewCompact : null,
                { backgroundColor: preview.background },
              ]}>
              <View
                style={[
                  styles.swatchLarge,
                  compact ? styles.swatchLargeCompact : null,
                  { backgroundColor: preview.primary },
                ]}
              />
              <View
                style={[
                  styles.swatch,
                  compact ? styles.swatchCompact : null,
                  { backgroundColor: preview.secondary },
                ]}
              />
              <View
                style={[
                  styles.swatch,
                  compact ? styles.swatchCompact : null,
                  { backgroundColor: preview.accent },
                ]}
              />
            </View>
            <View style={styles.label}>
              <AppText variant="label" weight="700">
                {t(`settings.palettes.${palette}`)}
              </AppText>
              {!compact ? (
                <AppText color="muted" variant="caption">
                  {t(`settings.paletteDescriptions.${palette}`)}
                </AppText>
              ) : null}
            </View>
            {selected ? (
              <AppIcon color={theme.colors.primary} name="checkmark-circle" size={22} />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridCompact: { gap: 8 },
  option: {
    minHeight: 82,
    flexGrow: 1,
    flexBasis: 155,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    padding: 10,
  },
  optionCompact: { minHeight: 64, flexBasis: 130, gap: 7, padding: 8 },
  preview: {
    width: 48,
    height: 48,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    borderRadius: 6,
    padding: 6,
  },
  previewCompact: { width: 40, height: 40, padding: 4 },
  swatchLarge: { width: 14, height: 34, borderRadius: 3 },
  swatchLargeCompact: { width: 12, height: 30 },
  swatch: { width: 8, height: 24, borderRadius: 3 },
  swatchCompact: { width: 7, height: 20 },
  label: { flex: 1, minWidth: 0, gap: 1 },
});
