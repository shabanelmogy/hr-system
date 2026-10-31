import type { ChartDefinition,ChartMetric } from '../../../../../shared/ui/charts/public-api';
import type { CountryListItem } from '../types/country';

/** Page-only projections. Server matching totals are never used as chart samples. */
export function countryChartData(rows:readonly CountryListItem[],total:number,language:string,text:(key:string)=>string):{metrics:readonly ChartMetric[];plots:readonly ChartDefinition[]}{
 const currencies=new Map<string,number>(),months=new Map<string,number>();
 let withStates=0,totalStates=0;
 for(const country of rows){
  if(country.currencyCode)currencies.set(country.currencyCode,(currencies.get(country.currencyCode)??0)+1);
  const date=new Date(country.createdOn);if(Number.isFinite(date.getTime())){const month=date.toISOString().slice(0,7);months.set(month,(months.get(month)??0)+1);}
  if(country.statesCount>0)withStates++;totalStates+=country.statesCount;
 }
 const currencyData=[...currencies].sort((a,b)=>b[1]-a[1]).slice(0,10);
 const statesData=rows.filter(row=>row.statesCount>0).map(row=>({name:language.toLowerCase().startsWith('ar')?row.nameAr:row.nameEn,count:row.statesCount})).sort((a,b)=>b.count-a.count).slice(0,10);
 let cumulative=0;const timeline=[...months].sort((a,b)=>a[0].localeCompare(b[0])).map(([month,count])=>({month,value:cumulative+=count}));
 const metrics:readonly ChartMetric[]=[
  {id:'matching',label:text('countries.dashboard.totalMatching'),value:String(total),icon:'globe',accent:'var(--primary)'},
  {id:'loaded',label:text('countries.dashboard.visibleCountries'),value:String(rows.length),icon:'view',accent:'var(--info)'},
  {id:'states',label:text('countries.dashboard.statesOnPage'),value:String(totalStates),icon:'location',accent:'var(--brand-2)'},
  {id:'currencies',label:text('countries.dashboard.currenciesOnPage'),value:String(currencyData.length),icon:'assessment',accent:'var(--success)'},
 ];
 const valueLabel=text('chartCommon.value');
 const plots:ChartDefinition[]=[
  {id:'states',title:text('countries.charts.statesByCountry'),subtitle:text('countries.charts.statesByCountryDesc'),kind:'bar',labels:statesData.map(item=>item.name),series:[{name:text('countries.charts.activeStates'),values:statesData.map(item=>item.count)}],legend:true,numberLocale:'en-US'},
  {id:'coverage',title:text('countries.charts.statesCoverage'),kind:'pie',labels:[text('countries.charts.withStates'),text('countries.charts.withoutStates')],series:[{name:valueLabel,values:[withStates,rows.length-withStates]}],palette:'rainbow',legend:true,sliceLabels:true,numberLocale:'en-US'},
  {id:'currencies',title:text('countries.charts.topCurrencies'),kind:'horizontal-bar',labels:currencyData.map(item=>item[0]),series:[{name:valueLabel,values:currencyData.map(item=>item[1])}],palette:'secondary',numberLocale:'en-US'},
 ];
 if(timeline.length)plots.push({id:'timeline',title:text('countries.charts.timeline'),kind:'area',labels:timeline.map(item=>item.month),series:[{name:valueLabel,values:timeline.map(item=>item.value)}],palette:'success',numberLocale:'en-US'});
 return {metrics,plots};
}
