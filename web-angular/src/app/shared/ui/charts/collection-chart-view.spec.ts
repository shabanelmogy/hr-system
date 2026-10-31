import { TestBed } from '@angular/core/testing';
import { provideAppTheme } from '../../../../theme/public-api';
import { LocalizationRuntime } from '../../../platform/localization/public-api';
import type { CollectionSource } from '../collections/collection.types';
import { CollectionChartView } from './collection-chart-view';
import { ChartPanel } from './chart-panel';
describe('Shared collection chart composition',()=>{
 beforeEach(async()=>{
  vi.stubGlobal('matchMedia',()=>({matches:false,media:'',addEventListener(){},removeEventListener(){},addListener(){},removeListener(){}}));vi.stubGlobal('ResizeObserver',class{observe(){}unobserve(){}disconnect(){}});
  TestBed.configureTestingModule({providers:[provideAppTheme()]});TestBed.overrideComponent(ChartPanel,{set:{template:''}});await TestBed.compileComponents();await TestBed.inject(LocalizationRuntime).loadNamespace('core');
 });
 afterEach(()=>{TestBed.resetTestingModule();vi.unstubAllGlobals();});
 it('reuses toolbar without a paging footer and removes metrics/plots immediately for loading or forbidden',async()=>{
  const fixture=TestBed.createComponent(CollectionChartView<{id:number}>),query={scopeKey:'actor',criteriaKey:'all',pageIndex:0,pageSize:10};
  const ready:CollectionSource<{id:number}>={query,kind:'ready',result:{query,rows:[{id:1}],total:21,hasNextPage:true}};
  for(const [key,value]of Object.entries({source:ready,rowId:(row:{id:number})=>row.id,label:'Chart fixture',metrics:[{id:'count',label:'Matching',value:'21',icon:'globe',accent:'var(--primary)'}],plots:[{id:'data',title:'Data',kind:'bar',labels:['A'],series:[{name:'Count',values:[1]}]}]}))fixture.componentRef.setInput(key,value);
  await fixture.whenStable();const root=fixture.nativeElement as HTMLElement;expect(root.querySelectorAll('erp-metric-card')).toHaveLength(1);expect(root.querySelectorAll('erp-chart-panel')).toHaveLength(1);expect(root.querySelector('erp-collection-footer')).toBeNull();
  fixture.componentRef.setInput('source',{...ready,kind:'loading'});await fixture.whenStable();expect(root.querySelector('erp-metric-card')).toBeNull();expect(root.querySelector('erp-chart-panel')).toBeNull();
  fixture.componentRef.setInput('source',{query,kind:'forbidden'});await fixture.whenStable();expect(root.querySelector('[role=alert]')).not.toBeNull();expect(root.textContent).not.toContain('Matching');
 });
});
