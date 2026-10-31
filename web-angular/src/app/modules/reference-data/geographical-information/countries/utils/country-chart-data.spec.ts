import { countryChartData } from './country-chart-data';
import { countryFixture } from '../country.fixture';
const text=(key:string)=>key;
const row=(id:number,extra:Partial<typeof countryFixture>={})=>({...countryFixture,id,...extra});
describe('Countries loaded-page charts',()=>{
 it('keeps matching totals separate and counts exact currency groups and positive states only',()=>{
  const data=countryChartData([row(1,{currencyCode:'USD',statesCount:2}),row(2,{currencyCode:'EGP',statesCount:0}),row(3,{currencyCode:'USD',statesCount:3}),row(4,{currencyCode:null,statesCount:0})],101,'en',text);
  expect(data.metrics.map(metric=>metric.value)).toEqual(['101','4','5','2']);expect(data.plots.map(plot=>plot.id)).toEqual(['states','coverage','currencies','timeline']);
  expect(data.plots[0].series[0].values).toEqual([3,2]);expect(data.plots[1].series[0].values).toEqual([2,2]);expect(data.plots[2].labels).toEqual(['USD','EGP']);expect(data.plots[2].series[0].values).toEqual([2,1]);
 });
 it('uses stable top10 ordering and active-language Unicode names without mutating input',()=>{
  const rows=Array.from({length:12},(_,i)=>row(i+1,{nameAr:'دولة '+i,nameEn:'Country '+i,statesCount:12-i,currencyCode:'C'+i}));const data=countryChartData(rows,12,'ar-EG',text);
  expect(data.plots[0].labels).toEqual(rows.slice(0,10).map(item=>item.nameAr));expect(data.plots[2].labels).toEqual(rows.slice(0,10).map(item=>item.currencyCode));expect(data.metrics[3].value).toBe('10');expect(rows[0].statesCount).toBe(12);
 });
 it('groups creation dates by UTC month, skips invalid dates and computes cumulative counts',()=>{
  const data=countryChartData([row(1,{createdOn:'2026-02-01T00:10:00+02:00'}),row(2,{createdOn:'2026-03-01T00:00:00Z'}),row(3,{createdOn:'2026-01-01T00:00:00Z'}),row(4,{createdOn:'invalid'})],4,'en',text),timeline=data.plots.find(plot=>plot.id==='timeline')!;
  expect(timeline.labels).toEqual(['2026-01','2026-03']);expect(timeline.series[0].values).toEqual([2,3]);
 });
 it('preserves zero coverage and omits unavailable time/currency samples instead of inventing groups',()=>{
  const data=countryChartData([row(1,{createdOn:'invalid',currencyCode:'',statesCount:0}),row(2,{createdOn:'invalid',currencyCode:null,statesCount:0})],2,'en',text);
  expect(data.plots[0].labels).toEqual([]);expect(data.plots[1].series[0].values).toEqual([0,2]);expect(data.plots[2].labels).toEqual([]);expect(data.plots.some(plot=>plot.id==='timeline')).toBe(false);
 });
});
