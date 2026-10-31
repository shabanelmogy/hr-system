import type { AppIconName } from '../icons/app-icon';

export type ChartPalette='primary'|'secondary'|'rainbow'|'success';
export interface ChartSeries { readonly name:string; readonly values:readonly number[]; }
export interface ChartDefinition {
 readonly id:string; readonly title:string; readonly subtitle?:string;
 readonly kind:'bar'|'horizontal-bar'|'pie'|'area';
 readonly labels:readonly string[]; readonly series:readonly ChartSeries[];
 readonly palette?:ChartPalette; readonly legend?:boolean; readonly sliceLabels?:boolean;
 readonly numberLocale?:string;
}
export interface ChartMetric {readonly id:string;readonly label:string;readonly value:string;readonly icon:AppIconName;readonly accent:string;}

export function validChartDefinition(value:ChartDefinition):boolean{
 return value.labels.length<=5000&&value.series.length<=20&&value.series.every(series=>series.values.length===value.labels.length&&series.values.every(item=>Number.isFinite(item)&&(value.kind!=='pie'||item>=0)))&&(value.kind!=='pie'||value.series.length===1);
}
export function chartHasData(value:ChartDefinition):boolean{
 return validChartDefinition(value)&&value.labels.length>0&&value.series.length>0&&(value.kind!=='pie'||value.series[0].values.some(item=>item>0));
}
