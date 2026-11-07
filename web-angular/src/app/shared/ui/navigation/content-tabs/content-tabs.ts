import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  model,
  output,
  viewChild,
  type TemplateRef,
} from '@angular/core';
import { Tabs, TabsModule } from 'primeng/tabs';

export interface ContentTab {
  readonly id: string;
  readonly label: string;
}

@Component({
  imports: [NgTemplateOutlet, TabsModule],
  selector: 'erp-content-tabs',
  styleUrl: './content-tabs.scss',
  templateUrl: './content-tabs.html',
})
export class ContentTabs {
  readonly tabs = input.required<readonly ContentTab[]>();
  readonly content = input.required<TemplateRef<{ $implicit: string }>>();
  readonly selected = model('');
  readonly commitMode = input<'immediate' | 'external'>('immediate');
  readonly selectionRequested = output<string>();
  private readonly widget = viewChild(Tabs);
  private readonly destroy = inject(DestroyRef);
  /** Preserve mounted forms and controls while another panel is selected. */
  readonly keepAlive = input(false, { transform: booleanAttribute });
  // A tab-owned border follows RTL, translated labels and late font loading
  // without depending on PrimeNG's cached physical ink-bar measurements.
  readonly tokens = {
    activeBar: { height: '0px' },
    tab: { borderWidth: '0 0 2px 0', activeBorderColor: '{primary.color}' },
  };
  readonly active = computed(
    () => this.tabs().find((tab) => tab.id === this.selected())?.id ?? this.tabs()[0]?.id ?? '',
  );
  select(value: string | number | undefined): void {
    if (
      typeof value !== 'string' ||
      value === this.active() ||
      !this.tabs().some((tab) => tab.id === value)
    )
      return;
    if (this.commitMode() === 'immediate') {
      this.selected.set(value);
      return;
    }
    this.selectionRequested.emit(value);
    // PrimeNG writes its model before emitting the request. Restore the committed
    // value while an asynchronous owner decision is pending, including rejection.
    queueMicrotask(() => {
      if (!this.destroy.destroyed) this.widget()?.value.set(this.active());
    });
  }
}
