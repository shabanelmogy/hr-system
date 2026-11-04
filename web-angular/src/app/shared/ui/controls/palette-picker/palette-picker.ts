import { Component, computed, effect, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RadioButton } from 'primeng/radiobutton';
import {
  getTheme,
  themePaletteOrder,
  type ResolvedThemeMode,
  type ThemePalette,
} from '@app/tokens';

@Component({
  selector: 'erp-palette-picker',
  imports: [ReactiveFormsModule, RadioButton],
  templateUrl: './palette-picker.html',
  styleUrl: './palette-picker.scss',
})
export class PalettePicker {
  private static sequence = 0;
  readonly groupName = 'erp-palette-' + ++PalettePicker.sequence;
  readonly label = input.required<string>();
  readonly labels = input.required<Readonly<Record<ThemePalette, string>>>();
  readonly value = input.required<ThemePalette>();
  readonly mode = input.required<ResolvedThemeMode>();
  readonly valueChange = output<ThemePalette>();
  readonly options = computed(() =>
    themePaletteOrder.map((value) => ({ value, colors: getTheme(value, this.mode()).colors })),
  );
  readonly control = new FormControl<ThemePalette>('green', { nonNullable: true });
  constructor() {
    effect(() => this.control.setValue(this.value(), { emitEvent: false }));
    this.control.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      if (themePaletteOrder.includes(value)) this.valueChange.emit(value);
    });
  }
}
