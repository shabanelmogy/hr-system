import { booleanAttribute, Component, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ScrollViewport } from '../scroll-viewport/scroll-viewport';
@Component({
  selector: 'erp-report-workspace',
  imports: [NgTemplateOutlet, ScrollViewport],
  host: { '[class.contained]': "appearance()==='reference'" },
  templateUrl: './report-workspace.html',
  styleUrl: './report-workspace.scss',
})
export class ReportWorkspace {
  readonly appearance = input<'default' | 'reference'>('default');
  readonly label = input.required<string>();
  readonly criteriaLabel = input.required<string>();
  readonly criteriaVisible = input(true, { transform: booleanAttribute });
}
