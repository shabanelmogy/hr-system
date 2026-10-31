import { getTheme } from '@app/tokens';
import { chartData,chartOptions,chartPalette } from './chart-presentation';
import { chartHasData,validChartDefinition,type ChartDefinition } from './chart.types';
const theme=getTheme('green','light');
const spec:ChartDefinition={id:'proof',title:'Proof',kind:'pie',labels:['Yes','No'],series:[{name:'Count',values:[0,3]}],palette:'rainbow',legend:true,sliceLabels:true};
describe('Shared native chart projection',()=>{
 it('retains a zero category and copies vendor data so native mutation cannot change owner rows',()=>{
  const data=chartData(spec,theme);expect(data.datasets[0].data).toEqual([0,3]);data.datasets[0].data[0]=5;expect(spec.series[0].values).toEqual([0,3]);expect(chartHasData(spec)).toBe(true);
 });
 it('rejects mismatched/nonfinite/negative pie data and treats all-zero pies as empty',()=>{
  expect(validChartDefinition({...spec,series:[{name:'Bad',values:[1]}]})).toBe(false);expect(validChartDefinition({...spec,series:[{name:'Bad',values:[NaN,2]}]})).toBe(false);expect(validChartDefinition({...spec,series:[{name:'Bad',values:[-1,2]}]})).toBe(false);expect(chartHasData({...spec,series:[{name:'Empty',values:[0,0]}]})).toBe(false);
 });
 it('uses selected palette and semantic theme colors instead of fixed canvas defaults',()=>{
  const dark=getTheme('navy','dark');expect(chartPalette(theme,'success')[0]).toBe(theme.colors.success);expect(chartPalette(theme,'rainbow')).not.toEqual(chartPalette(dark,'rainbow'));expect(chartPalette(theme,'secondary')[0]).toBe(theme.colors.brand2);
 });
 it('configures native RTL legend/tooltip, reduced motion and responsive fixed-container rendering',()=>{
  const options=chartOptions(spec,theme,'ar',true);expect(options.responsive).toBe(true);expect(options.maintainAspectRatio).toBe(false);expect(options.animation).toBe(false);expect(options.plugins?.legend?.rtl).toBe(true);expect(options.plugins?.tooltip?.textDirection).toBe('rtl');expect(options.plugins?.tooltip?.backgroundColor).toBe(theme.colors.surface);
 });
});
