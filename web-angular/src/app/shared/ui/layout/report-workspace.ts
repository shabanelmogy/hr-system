import { booleanAttribute, Component, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ScrollViewport } from './scroll-viewport';
@Component({
  selector: 'erp-report-workspace',
  imports:[NgTemplateOutlet,ScrollViewport],
  host:{'[class.contained]':"appearance()==='reference'"},
  template: `<section
    class="workspace"
    [class.reference]="appearance()==='reference'"
    [class.no-criteria]="!criteriaVisible()"
    [attr.aria-label]="label()"
  >
    @if (criteriaVisible()) {
      <aside [attr.aria-label]="criteriaLabel()">@if(appearance()==='reference'){<erp-scroll-viewport [label]="criteriaLabel()"><ng-container [ngTemplateOutlet]="criteria" /></erp-scroll-viewport>}@else{<ng-container [ngTemplateOutlet]="criteria" />}</aside>
    }
    <div class="document"><ng-content select="[reportDocument]" /></div>
  </section><ng-template #criteria><ng-content select="[reportCriteria]" /></ng-template>`,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    .workspace {
      display: grid;
      grid-template-columns: minmax(240px, 300px) minmax(0, 1fr);
      gap: 16px;
      align-items: start;
      min-width: 0;
    }
    .workspace.no-criteria {
      grid-template-columns: minmax(0, 1fr);
    }
    aside,
    .document {
      min-width: 0;
    }
    @media (max-width: 899px) {
      .workspace {
        grid-template-columns: minmax(0, 1fr);
      }
    }
    :host.contained{height:100%;min-height:0}
    .workspace.reference{height:100%;min-height:0;grid-template-columns:280px minmax(0,1fr);gap:64px;align-items:stretch}
    .reference aside{min-height:0;overflow:hidden;background:var(--surface);box-shadow:0 3px 3px -2px #0003,0 3px 4px #00000024,0 1px 8px #0000001f}
    .reference .document{min-height:0;overflow:hidden}
    .workspace.reference.no-criteria{grid-template-columns:minmax(0,1fr)}
    @media(max-width:599px){.workspace.reference{grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(0,auto) minmax(160px,1fr)}.workspace.reference.no-criteria{grid-template-rows:minmax(0,1fr)}.reference aside{max-height:60dvh}}
  `,
})
export class ReportWorkspace {
  readonly appearance=input<'default'|'reference'>('default');
  readonly label = input.required<string>();
  readonly criteriaLabel = input.required<string>();
  readonly criteriaVisible = input(true, { transform: booleanAttribute });
}
