import { Component,computed,DestroyRef,inject,input,signal } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { fontStack } from '@app/tokens';
import { ThemeService } from '../../../../theme/public-api';
import { LocalizationRuntime } from '../../../platform/localization/public-api';
import type { ChartDefinition } from './chart.types';
import { chartData,chartOptions } from './chart-presentation';
import { sliceLabelPlugin } from './chart-slice-labels';

@Component({selector:'erp-chart-renderer',imports:[ChartModule],template:`<p-chart [type]="type()" [data]="data()" [options]="options()" [plugins]="plugins()" [ariaLabel]="definition().title" [responsive]="true" />`,styles:':host{display:block;width:100%;height:100%;min-width:0;min-height:0}p-chart{display:block;position:relative;width:100%;height:100%}'})
export class ChartRenderer {
 readonly definition=input.required<ChartDefinition>();private readonly theme=inject(ThemeService);private readonly locale=inject(LocalizationRuntime);private readonly reducedMotion=signal(false);
 readonly type=computed(()=>{const kind=this.definition().kind;return kind==='area'?'line':kind==='horizontal-bar'?'bar':kind;});
 readonly data=computed(()=>chartData(this.definition(),this.theme.theme()));
 readonly options=computed(()=>chartOptions(this.definition(),this.theme.theme(),this.locale.language(),this.reducedMotion()));
 readonly plugins=computed(()=>[sliceLabelPlugin(this.definition(),this.theme.theme().colors.mutedForeground,fontStack.sans,this.locale.direction()==='rtl')]);
 constructor(){const preference=window.matchMedia('(prefers-reduced-motion: reduce)'),update=()=>this.reducedMotion.set(preference.matches);update();preference.addEventListener('change',update);inject(DestroyRef).onDestroy(()=>preference.removeEventListener('change',update));}
}
