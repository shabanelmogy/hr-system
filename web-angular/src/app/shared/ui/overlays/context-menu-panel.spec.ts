import { TestBed } from '@angular/core/testing';
import { providePrimeNG } from 'primeng/config';
import { ContextMenuPanel } from './context-menu-panel';
describe('Generic native context menu command guard',()=>{
 it('rejects disabled/removed/duplicate actions and separators before emitting an ID',()=>{
  TestBed.configureTestingModule({providers:[providePrimeNG({ripple:false})]});
  const fixture=TestBed.createComponent(ContextMenuPanel),component=fixture.componentInstance,callback=vi.fn();fixture.componentRef.setInput('label','Context fixture');fixture.componentRef.setInput('actions',[{id:'filter',label:'Filter'},{id:'disabled',label:'Disabled',disabled:true},{id:'separator',label:'',separator:true}]);component.activated.subscribe(callback);
  component.activate('disabled');component.activate('separator');component.activate('missing');expect(callback).not.toHaveBeenCalled();component.activate('filter');expect(callback).toHaveBeenCalledExactlyOnceWith('filter');
  fixture.componentRef.setInput('actions',[{id:'filter',label:'One'},{id:'filter',label:'Two'}]);component.activate('filter');expect(callback).toHaveBeenCalledOnce();fixture.destroy();TestBed.resetTestingModule();
 });
});
