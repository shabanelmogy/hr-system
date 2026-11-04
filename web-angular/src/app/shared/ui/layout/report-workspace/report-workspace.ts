import { booleanAttribute, Component, computed, input, model } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ScrollViewport } from '../scroll-viewport/scroll-viewport';
import { ContentTabs } from '../../navigation/content-tabs/content-tabs';
@Component({
  selector: 'erp-report-workspace',
  imports: [ContentTabs, NgTemplateOutlet, ScrollViewport],
  host: { '[class.contained]': "appearance()==='reference'" },
  templateUrl: './report-workspace.html',
  styleUrl: './report-workspace.scss',
})
export class ReportWorkspace {
  readonly appearance = input<'default' | 'reference'>('default');
  readonly label = input.required<string>();
  readonly criteriaLabel = input.required<string>();
  readonly criteriaVisible = input(true, { transform: booleanAttribute });
  readonly optionsLabel = input('');
  readonly selectedTab = model('criteria');
  readonly tabs = computed(() => [
    { id: 'criteria', label: this.criteriaLabel() },
    { id: 'options', label: this.optionsLabel() },
  ]);
}
