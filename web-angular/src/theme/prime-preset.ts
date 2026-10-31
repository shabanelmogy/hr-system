import { contrastRatio, getTheme, parseHex, type AppTheme, type ThemePalette } from '@app/tokens';
import { definePreset, type Preset } from '@primeuix/themes';
import AuraButton from '@primeuix/themes/aura/button';
import AuraInputText from '@primeuix/themes/aura/inputtext';
import AuraDialog from '@primeuix/themes/aura/dialog';
import AuraDrawer from '@primeuix/themes/aura/drawer';
import AuraPopover from '@primeuix/themes/aura/popover';
import AuraTag from '@primeuix/themes/aura/tag';
import AuraProgressBar from '@primeuix/themes/aura/progressbar';
import AuraSelect from '@primeuix/themes/aura/select';
import AuraRadioButton from '@primeuix/themes/aura/radiobutton';
import AuraDataTable from '@primeuix/themes/aura/datatable';
import AuraPaginator from '@primeuix/themes/aura/paginator';
import AuraCheckbox from '@primeuix/themes/aura/checkbox';
import AuraDatePicker from '@primeuix/themes/aura/datepicker';
import AuraToggleSwitch from '@primeuix/themes/aura/toggleswitch';
import AuraTextarea from '@primeuix/themes/aura/textarea';
import AuraTabs from '@primeuix/themes/aura/tabs';
import AuraSelectButton from '@primeuix/themes/aura/selectbutton';
import AuraToggleButton from '@primeuix/themes/aura/togglebutton';
import type { ButtonDesignTokens, ButtonTokenSections } from '@primeuix/themes/types/button';

const rem = (value: number) => `${value / 16}rem`;

/** Matches MUI's default primary.dark derivation when the text still has AA contrast. */
export function actionHover(theme: AppTheme): string {
  const darker = '#' + parseHex(theme.colors.primary).map(channel => Math.floor(channel * 0.7).toString(16).padStart(2, '0')).join('');
  return contrastRatio(theme.colors.primaryForeground, darker) >= 4.5 ? darker : theme.colors.primary;
}

function solid(background: string, color: string, hoverBackground = background) {
  return { background, color, borderColor: background, hoverBackground, hoverColor: color,
    hoverBorderColor: hoverBackground, activeBackground: hoverBackground, activeColor: color,
    activeBorderColor: hoverBackground, focusRing: { color: '{focus.ring.color}', shadow: 'none' } };
}

export function buttonColors(theme: AppTheme): ButtonTokenSections.Root {
  const c = theme.colors;
  const hover = actionHover(theme);
  return {
    primary: { ...solid(c.primary, c.primaryForeground, hover), background: `linear-gradient(45deg, ${c.primary}, ${hover})` },
    secondary: solid(c.secondary, c.secondaryForeground, c.accent),
    success: solid(c.success, c.successForeground),
    warn: solid(c.warning, c.warningForeground),
    danger: solid(c.destructive, c.destructiveForeground),
    info: solid(c.info, c.infoForeground),
    help: solid(c.brand3, c.brand3Foreground),
    contrast: solid(c.foreground, c.background),
  };
}

function semantics(theme: AppTheme) {
  const c = theme.colors;
  return {
    primary: { color: c.primary, contrastColor: c.primaryForeground, hoverColor: actionHover(theme), activeColor: actionHover(theme) },
    text: { color: c.foreground, hoverColor: c.foreground, mutedColor: c.mutedForeground, hoverMutedColor: c.mutedForeground },
    content: { background: c.surface, hoverBackground: c.accent, borderColor: c.border, color: c.surfaceForeground, hoverColor: c.accentForeground },
    formField: { background: c.surface, disabledBackground: c.muted, filledBackground: c.muted,
      borderColor: c.input, hoverBorderColor: c.ring, focusBorderColor: c.ring, invalidBorderColor: c.destructive,
      color: c.foreground, disabledColor: c.disabled, placeholderColor: c.mutedForeground,
      floatLabelColor: c.mutedForeground, iconColor: c.mutedForeground },
    highlight: { background: c.accent, focusBackground: c.accent, color: c.accentForeground, focusColor: c.accentForeground },
    mask: { background: c.overlay, color: c.primaryForeground },
    overlay:{modal:{background:c.surface,borderColor:c.border,color:c.surfaceForeground},popover:{background:c.surface,borderColor:c.border,color:c.surfaceForeground},select:{background:c.surface,borderColor:c.border,color:c.surfaceForeground}},
  };
}

/** One framework adapter; values always come from the public shared package. */
export function createPrimePreset(palette: ThemePalette): Preset {
  const light = getTheme(palette, 'light');
  const dark = getTheme(palette, 'dark');
  const variants = (theme: AppTheme) => {
    const c = theme.colors;
    const entries = {
      primary: c.primary, secondary: c.foreground, success: c.success, warn: c.warning,
      danger: c.destructive, info: c.info, help: c.brand3, contrast: c.foreground,
    };
    return {
      outlined: Object.fromEntries(Object.entries(entries).map(([name, color]) => [name, {
        color, borderColor: color, hoverBackground: c.accent, hoverColor: color,
        activeBackground: c.accent, activeColor: color,
      }])),
      text: Object.fromEntries(Object.entries(entries).map(([name, color]) => [name, {
        color, hoverBackground: c.accent, hoverColor: color, activeBackground: c.accent, activeColor: color,
      }])),
    };
  };
  const button = {
    root: { borderRadius: rem(light.radius.xl), paddingX: rem(light.spacing.xl), paddingY: '0.5625rem',
      gap: rem(light.spacing.sm), fontSize: rem(light.text.body.fontSize),
      label: { fontWeight: light.text.title.fontWeight },
      raisedShadow: '0 4px 12px color-mix(in srgb, var(--primary) 40%, transparent)',
      focusRing: { width: '2px', style: 'solid', offset: '2px' }, transitionDuration: `${light.motion.duration.fast}ms` },
    colorScheme: {
      light: { root: buttonColors(light), ...variants(light) },
      dark: { root: buttonColors(dark), ...variants(dark) },
    },
  } satisfies ButtonDesignTokens;
  // Import only the adopted component's preset; absent controls own their later adapters.
  return definePreset({ components: { button: AuraButton, inputtext: AuraInputText, dialog: AuraDialog,drawer:AuraDrawer,popover:AuraPopover,tag:AuraTag,progressbar:AuraProgressBar,select:AuraSelect,radiobutton:AuraRadioButton,datatable:AuraDataTable,paginator:AuraPaginator,checkbox:AuraCheckbox,datepicker:AuraDatePicker,toggleswitch:AuraToggleSwitch,textarea:AuraTextarea,tabs:AuraTabs,selectbutton:AuraSelectButton,togglebutton:AuraToggleButton } }, {
    semantic: {
      disabledOpacity: '0.6', iconSize: rem(light.iconSize.sm),
      mask:{transitionDuration:`${light.motion.duration.fast}ms`},
      transitionDuration: `${light.motion.duration.normal}ms`,
      focusRing: { width: '2px', style: 'solid', color: 'var(--ring)', offset: '2px', shadow: 'none' },
      typography: { fontFamily: 'var(--app-font-sans)', fontSize: rem(light.text.bodySmall.fontSize), fontWeight: light.text.bodySmall.fontWeight, lineHeight: '1.5' },
      formField: { borderRadius: rem(light.radius.md) },
      overlay: { modal: { borderRadius: rem(light.radius.md), padding: rem(light.spacing.xxl), shadow: light.elevation.lg.css },popover:{borderRadius:'16px',padding:'6px',shadow:light.elevation.lg.css},select:{borderRadius:'6px',shadow:light.elevation.lg.css} },
      colorScheme: { light: semantics(light), dark: semantics(dark) },
    },
    components: { button,
      togglebutton:{root:{background:'{content.background}',checkedBackground:'{content.background}',hoverBackground:'{content.hover.background}',borderColor:'{content.border.color}',checkedBorderColor:'{content.border.color}',color:'{text.muted.color}',hoverColor:'{text.color}',checkedColor:'{primary.color}'},content:{checkedBackground:'{highlight.background}'}},
      select:{
      root:{fontSize:'1rem',fontWeight:'400',shadow:'none',paddingX:'12px',paddingY:'8px',borderRadius:'8px',transitionDuration:`${light.motion.duration.fast}ms`,focusRing:{width:'2px',style:'solid',color:'var(--ring)',offset:'2px',shadow:'none'}},
      overlay:{background:'{content.background}',color:'{content.color}',borderColor:'{content.border.color}',borderRadius:'14px',shadow:light.elevation.lg.css},
      list:{padding:'6px',gap:'4px'},
      option:{padding:'10px 12px',fontSize:'14px',fontWeight:'400',borderRadius:'10px',selectedFontWeight:'600',color:'{text.color}',focusColor:'{text.color}',focusBackground:'{content.hover.background}',selectedBackground:'{highlight.background}',selectedColor:'{highlight.color}',selectedFocusBackground:'{highlight.focus.background}',selectedFocusColor:'{highlight.focus.color}'}
    }, drawer:{header:{padding:'12px 16px'},content:{padding:'0px'}}, dialog: { colorScheme: {
      light: { root: { background: light.colors.surface, color: light.colors.surfaceForeground, borderColor: light.colors.border } },
      dark: { root: { background: dark.colors.surface, color: dark.colors.surfaceForeground, borderColor: dark.colors.border } },
    } }, textarea: { root: { paddingX: rem(light.spacing.md), paddingY: '0.5625rem',
      borderRadius: rem(light.radius.md), fontSize: rem(light.text.body.fontSize), shadow: 'none' } }, inputtext: { root: { paddingX: rem(light.spacing.md), paddingY: '0.5625rem',
      borderRadius: rem(light.radius.md), fontSize: rem(light.text.body.fontSize), shadow: 'none' } } },
  });
}
