import { Component, computed, DestroyRef, effect, inject, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Select } from 'primeng/select';
import { ContextBadge } from '../../layout/context-badge/context-badge';
import type { AppIconName } from '../../icons/app-icon/app-icon';
import { AppIcon } from '../../icons/app-icon/app-icon';

@Component({
  selector: 'erp-option-select',
  imports: [ReactiveFormsModule, Select, ContextBadge, AppIcon],
  host: {
    '[style.width.px]': 'controlWidth()',
    '[style.flex-basis.px]': 'controlWidth()',
    '[style.flex-shrink]': "controlWidth()===null?null:'0'",
    '[class.context-control]': "appearance()==='context'",
  },
  templateUrl: './option-select.html',
  styleUrl: './option-select.scss',
})
export class OptionSelect {
  private static sequence = 0;
  readonly id = 'erp-preference-select-' + ++OptionSelect.sequence;
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly labelVisibility = input<'visible' | 'sr-only'>('visible');
  readonly valueAlign = input<'start' | 'center'>('start');
  readonly valueAttributes = computed(() =>
    this.valueAlign() === 'center'
      ? {
          label: {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              paddingBlock: '0px',
              paddingInline: 'var(--p-select-dropdown-width)',
            },
          },
          dropdown: { style: { position: 'absolute', insetInlineEnd: '0px', insetBlock: '0px' } },
        }
      : {},
  );
  readonly controlHeight = input(40);
  readonly height = computed(() => {
    const height = this.controlHeight();
    return Number.isInteger(height) && height >= 28 && height <= 64 ? height : 40;
  });
  readonly overlayTarget = input<'body' | 'self'>('body');
  readonly options =
    input.required<
      readonly { value: string; label: string; description?: string; icon?: AppIconName }[]
    >();
  readonly menuLabel = input('');
  readonly controlWidth = input<number | null>(null);
  readonly appearance = input<'preference' | 'context'>('preference');
  readonly icon = input<AppIconName>('company');
  readonly disabled = input(false);
  readonly busy = input(false);
  readonly commitMode = input<'immediate' | 'external'>('immediate');
  readonly emptyLabel = input('');
  readonly invalid = input(false);
  readonly control = new FormControl('', { nonNullable: true });
  readonly selectedLabel = computed(
    () =>
      this.options().find((option) => option.value === this.value())?.label ?? this.emptyLabel(),
  );
  readonly selectableOptions = computed(() => [...this.options()]);
  readonly tokens = computed(() =>
    this.appearance() === 'context'
      ? {
          root: {
            color: 'var(--foreground)',
            background: 'transparent',
            borderColor: 'transparent',
            hoverBorderColor: 'transparent',
            focusBorderColor: 'var(--ring)',
            paddingX: '0px',
            paddingY: '0px',
          },
          dropdown: { color: 'var(--muted-foreground)', width: '18px' },
        }
      : {
          root: {
            color: 'currentColor',
            background: 'transparent',
            borderColor: 'color-mix(in srgb,currentColor 25%,transparent)',
            hoverBorderColor: 'currentColor',
            focusBorderColor: 'currentColor',
            ...(this.height() <= 32 ? { paddingX: '8px' } : {}),
          },
          dropdown: { color: 'currentColor', ...(this.height() <= 32 ? { width: '24px' } : {}) },
        },
  );
  readonly valueChange = output<string>();
  private readonly destroyRef = inject(DestroyRef);
  constructor() {
    effect(() => {
      this.control.setValue(this.value(), { emitEvent: false });
      if (this.disabled() || this.busy()) this.control.disable({ emitEvent: false });
      else this.control.enable({ emitEvent: false });
    });
    this.control.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => this.change(value));
  }
  change(value: unknown): void {
    const valid =
      typeof value === 'string' && this.options().some((option) => option.value === value);
    if (!valid || this.commitMode() === 'external' || this.disabled() || this.busy())
      this.control.setValue(this.value(), { emitEvent: false });
    if (valid && !this.disabled() && !this.busy()) this.valueChange.emit(value);
    // Select finishes its own model write after the CVA callback returns.
    // Reconcile the externally committed value after that stack, including denied requests.
    if (this.commitMode() === 'external')
      queueMicrotask(() => {
        if (!this.destroyRef.destroyed) this.control.setValue(this.value(), { emitEvent: false });
      });
  }
}
