import { fontStack,parseHex,type AppTheme } from '@app/tokens';
import type { ChartData,ChartOptions } from 'chart.js';
import type { ChartDefinition,ChartPalette } from './chart.types';

export function chartPalette(theme:AppTheme,name:ChartPalette='primary'):string[]{
 if(name==='success')return[theme.colors.success];
 const colors=[...new Set([...theme.chart,...Object.values(theme.modules),theme.colors.info,theme.colors.destructive])];
 const start=colors.findIndex(color=>color.toLowerCase()===(name==='secondary'?theme.colors.brand2:name==='rainbow'?theme.colors.brand3:theme.colors.primary).toLowerCase());
 return start<=0?colors:[...colors.slice(start),...colors.slice(0,start)];
}
export function chartAlpha(color:string,alpha:number):string{return `rgba(${parseHex(color).join(',')},${alpha})`;}
export function chartNumber(value:number,locale='en-US'):string{return new Intl.NumberFormat(locale,{maximumFractionDigits:2}).format(value);}
function areaGradient(color:string){
 let gradient:CanvasGradient|undefined,extent='';
 return (context:{chart:{ctx:CanvasRenderingContext2D;chartArea?:{left:number;top:number;right:number;bottom:number}}})=>{
  const {ctx,chartArea}=context.chart;if(!chartArea)return chartAlpha(color,.3);
  const next=[chartArea.left,chartArea.top,chartArea.right,chartArea.bottom].join(':');
  if(!gradient||next!==extent){extent=next;gradient=ctx.createLinearGradient(0,chartArea.top,0,chartArea.bottom);gradient.addColorStop(0,chartAlpha(color,.3));gradient.addColorStop(1,chartAlpha(color,.03));}
  return gradient;
 };
}
export function chartData(definition:ChartDefinition,theme:AppTheme):ChartData{
 const colors=chartPalette(theme,definition.palette);
 return {labels:[...definition.labels],datasets:definition.series.map((series,index)=>{
  const color=colors[index%colors.length],polar=definition.kind==='pie';
  return {label:series.name,data:[...series.values],backgroundColor:polar||definition.kind==='horizontal-bar'?definition.labels.map((_,i)=>colors[i%colors.length]):definition.kind==='area'?areaGradient(color):color,
   borderColor:polar?theme.colors.surface:color,borderWidth:polar?2:definition.kind==='area'?2:0,
   borderRadius:definition.kind==='horizontal-bar'?{topLeft:0,bottomLeft:0,topRight:4,bottomRight:4}:4,
   fill:definition.kind==='area',tension:definition.kind==='area'?.35:0,pointRadius:definition.kind==='area'?0:3,pointHoverRadius:4};
 })};
}
export function chartOptions(definition:ChartDefinition,theme:AppTheme,language:string,reducedMotion:boolean):ChartOptions{
 const rtl=language.toLowerCase().startsWith('ar'),colors=theme.colors,polar=definition.kind==='pie',numberLocale=definition.numberLocale??language;
 const font={family:fontStack.sans,size:12};
 const number=(value:unknown)=>typeof value==='number'?chartNumber(value,numberLocale):String(value??'');
 return {responsive:true,maintainAspectRatio:false,animation:reducedMotion?false:{duration:350},locale:numberLocale,color:colors.mutedForeground,font,
  indexAxis:definition.kind==='horizontal-bar'?'y':'x',
  layout:{padding:polar&&definition.sliceLabels?{left:35,right:35,top:8,bottom:0}:{left:4,right:12,top:8,bottom:0}},
  plugins:{legend:{display:definition.legend??false,position:'bottom',rtl,textDirection:rtl?'rtl':'ltr',labels:{color:colors.mutedForeground,font,boxWidth:12,boxHeight:12,padding:12}},
   tooltip:{enabled:true,rtl,textDirection:rtl?'rtl':'ltr',backgroundColor:colors.surface,titleColor:colors.foreground,bodyColor:colors.foreground,borderColor:colors.border,borderWidth:1,cornerRadius:8,titleFont:font,bodyFont:font,padding:10,
    callbacks:{label:context=>{
     const value=typeof context.raw==='number'?context.raw:0;
     if(polar){const total=definition.series[0].values.reduce((sum,item)=>sum+item,0);return `${context.label}: ${number(value)} (${(total?value/total*100:0).toFixed(1)}%)`;}
     return `${context.dataset.label}: ${number(value)}`;
    }}},
  },
  ...(polar?{radius:'75%'}:{scales:{x:{beginAtZero:definition.kind==='horizontal-bar',grid:{color:chartAlpha(colors.border,.4)},border:{color:colors.border},ticks:{color:colors.mutedForeground,font,maxRotation:0,autoSkip:true,...(definition.kind==='horizontal-bar'?{callback:value=>number(value),precision:0}:{})}},
   y:{beginAtZero:true,grid:{color:chartAlpha(colors.border,.4)},border:{color:colors.border},ticks:{color:colors.mutedForeground,font,...(definition.kind!=='horizontal-bar'?{callback:value=>number(value),precision:0}:{})}}}}),
 };
}
