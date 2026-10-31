import { Component,computed,inject,input } from '@angular/core';
import { LocalizationRuntime,UiTextPipe } from '../../../platform/localization/public-api';
import { SurfaceCard } from '../layout/surface-card';
import { FeedbackState } from '../feedback/feedback-state';
import { ChartRenderer } from './chart-renderer';
import { chartHasData,validChartDefinition,type ChartDefinition } from './chart.types';
import { chartNumber } from './chart-presentation';

@Component({selector:'erp-chart-panel',imports:[SurfaceCard,FeedbackState,ChartRenderer,UiTextPipe],template:`
 <erp-surface-card appearance="chart" [title]="definition().title" [subtitle]="definition().subtitle??''" icon="trend" fill>
  @if(!valid()){<erp-feedback-state [compact]="true" kind="error" [title]="'chartCommon.errorTitle'|uiText" [message]="'chartCommon.errorMessage'|uiText" />}
  @else if(!hasData()){<erp-feedback-state [compact]="true" kind="empty" icon="chart" [title]="'chartCommon.emptyTitle'|uiText" [message]="'chartCommon.emptyMessage'|uiText" />}
  @else{
   <div class="plot">@defer(on immediate){<erp-chart-renderer [definition]="definition()" />}@placeholder{<erp-feedback-state [compact]="true" kind="loading" [title]="'common.loading'|uiText" />}</div>
   <table class="sr-only"><caption>{{definition().title}}</caption><thead><tr><th scope="col">{{'chartCommon.category'|uiText}}</th>@for(series of definition().series;track $index){<th scope="col">{{series.name}}</th>}</tr></thead><tbody>@for(label of definition().labels;track $index;let row=$index){<tr><th scope="row">{{label}}</th>@for(series of definition().series;track $index){<td>{{number(series.values[row])}}</td>}</tr>}</tbody></table>
  }
 </erp-surface-card>`,styles:`:host{display:block;height:100%;min-width:0;min-height:280px}.plot{position:relative;width:100%;height:100%;min-height:180px}erp-feedback-state{display:flex;height:100%;align-items:center;justify-content:center}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}`})
export class ChartPanel {
 readonly definition=input.required<ChartDefinition>();private readonly locale=inject(LocalizationRuntime);
 readonly valid=computed(()=>validChartDefinition(this.definition()));readonly hasData=computed(()=>chartHasData(this.definition()));
 number(value:number){return chartNumber(value,this.definition().numberLocale??this.locale.language());}
}
