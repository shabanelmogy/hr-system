import { Component, computed, input, output } from '@angular/core';
import { getTheme, themePaletteOrder, type ResolvedThemeMode, type ThemePalette } from '@app/tokens';

@Component({ selector: 'erp-palette-picker', template: `
  <fieldset><legend>{{ label() }}</legend><div class="palette-options" role="radiogroup" [attr.aria-label]="label()">
    @for(option of options();track option.value){<label class="palette-option" [class.selected]="value() === option.value">
      <input type="radio" [name]="groupName" [value]="option.value" [checked]="value() === option.value" [attr.aria-label]="labels()[option.value]"
        (change)="valueChange.emit(option.value)" />
      <span class="palette-preview" [style.background]="option.colors.background" [style.border-color]="option.colors.border">
        <span class="primary-dot" [style.background]="option.colors.primary"></span><span class="secondary-dot" [style.background]="option.colors.brand2"></span>
      </span><span class="palette-name">{{ labels()[option.value] }}</span>
    </label>}
  </div></fieldset>`, styles: `
    :host{display:block}fieldset{border:0;padding:0;margin:0;min-width:0}legend{font-size:12px;font-weight:600;color:var(--muted-foreground);padding:0;margin-bottom:6px}
    .palette-options{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px}.palette-option{position:relative;cursor:pointer;padding:6px;border:1px solid var(--border);border-radius:12px;display:flex;flex-direction:column;gap:4px;min-width:0;text-align:center}
    .palette-option.selected{border-color:var(--primary);box-shadow:inset 0 0 0 1px var(--primary);background:var(--accent)}.palette-option:focus-within{outline:2px solid var(--ring);outline-offset:2px}
    input{position:absolute;width:1px;height:1px;opacity:0}.palette-preview{display:flex;align-items:center;justify-content:center;gap:4px;border:1px solid;border-radius:8px;padding:6px 0}
    .primary-dot{width:18px;height:18px;border-radius:50%;flex-shrink:0}.secondary-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}.palette-name{font-size:11px;line-height:1.2;overflow-wrap:anywhere}
  ` })
export class PalettePicker {
  private static sequence = 0; readonly groupName = 'erp-palette-' + ++PalettePicker.sequence;
  readonly label = input.required<string>(); readonly labels = input.required<Readonly<Record<ThemePalette,string>>>();
  readonly value = input.required<ThemePalette>(); readonly mode = input.required<ResolvedThemeMode>(); readonly valueChange = output<ThemePalette>();
  readonly options = computed(() => themePaletteOrder.map(value => ({ value, colors:getTheme(value,this.mode()).colors })));
}
