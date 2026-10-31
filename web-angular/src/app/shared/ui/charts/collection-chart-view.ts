import { Component,computed,contentChild,input,output } from '@angular/core';
import { CollectionFrame } from '../collections/collection-frame';
import { CollectionFeedback } from '../collections/collection-feedback';
import { CollectionEmptyTemplate } from '../collections/collection-templates';
import { createCollectionController } from '../collections/collection-controller';
import type { CollectionId,CollectionSearch,CollectionSearchChange,CollectionSource } from '../collections/collection.types';
import { ScrollViewport } from '../layout/scroll-viewport';
import { MetricCard } from '../cards/metric-card';
import { ChartPanel } from './chart-panel';
import type { ChartDefinition,ChartMetric } from './chart.types';

@Component({selector:'erp-collection-chart-view',imports:[CollectionFrame,CollectionFeedback,ScrollViewport,MetricCard,ChartPanel],template:`
 <erp-collection-frame appearance="plain" [controller]="controller" [label]="label()" [search]="search()" [toolbarVisible]="toolbarVisible()" [toolbarLayout]="toolbarLayout()" [showFooter]="false" (searchChange)="searchChange.emit($event)">
  <div toolbarFilters><ng-content select="[toolbarFilters]" /></div>
  <div collectionBody class="analytics">
   @if(controller.view().kind==='ready'&&controller.view().rows.length){
    <div class="metrics">@for(metric of metrics();track metric.id){<erp-metric-card appearance="raised" [label]="metric.label" [value]="metric.value" [icon]="metric.icon" [accent]="metric.accent" />}</div>
    <div class="chart-scroll"><erp-scroll-viewport [label]="label()" [fillContent]="true"><div class="plots">@for(plot of plots();track plot.id){<erp-chart-panel [attr.data-chart-id]="plot.id" [definition]="plot" />}</div></erp-scroll-viewport></div>
   }@else{<erp-collection-feedback [kind]="controller.view().kind" [emptyTemplate]="empty()?.template" (retry)="retry.emit()" />}
  </div>
 </erp-collection-frame>`,styles:`:host{display:flex;flex-direction:column;min-height:0;min-width:0;height:100%}.analytics{display:flex;flex-direction:column;flex:1;min-height:0;min-width:0;padding:4px}.metrics{display:grid;grid-template-columns:minmax(0,1fr);gap:6px;margin-bottom:6px;flex-shrink:0}.chart-scroll{flex:1;min-height:0;min-width:0;container-type:size}.plots{display:grid;grid-template-columns:minmax(0,1fr);grid-auto-rows:minmax(280px,1fr);gap:6px;min-height:100%;padding:0 2px 12px}@media(min-width:600px){.metrics{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(min-width:900px){.analytics{padding:4px 6px 6px}.metrics{grid-template-columns:repeat(4,minmax(0,1fr))}.plots{grid-template-columns:repeat(2,minmax(0,1fr));height:100%;grid-auto-rows:max(280px,calc(100cqh - 12px))}}`})
export class CollectionChartView<T> {
 readonly toolbarLayout=input<'responsive'|'single-row'>('responsive');
 readonly source=input.required<CollectionSource<T>>();readonly rowId=input.required<(row:T)=>CollectionId>();readonly label=input.required<string>();readonly plots=input<readonly ChartDefinition[]>([]);readonly metrics=input<readonly ChartMetric[]>([]);readonly search=input<CollectionSearch>();readonly toolbarVisible=input(true);
 readonly retry=output<void>();readonly searchChange=output<CollectionSearchChange>();readonly empty=contentChild(CollectionEmptyTemplate);
 readonly controller=createCollectionController(this.source,this.rowId,computed(()=>()=>false),{page:()=>{},active:()=>{},selected:()=>{}});
}
