import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  Component,
  computed,
  input,
  model,
  type TemplateRef,
} from '@angular/core';
import { TabsModule } from 'primeng/tabs';

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
    if (typeof value === 'string' && this.tabs().some((tab) => tab.id === value))
      this.selected.set(value);
  }
}
