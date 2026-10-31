import { TestBed } from '@angular/core/testing';
import { DialogPanel } from './dialog-panel';
import { provideAppTheme } from '../../../../theme/public-api';

describe('Dialog return-focus ownership',()=>{
 beforeEach(()=>{TestBed.configureTestingModule({providers:[provideAppTheme()]});TestBed.overrideComponent(DialogPanel,{set:{template:''}});});
 afterEach(()=>{TestBed.resetTestingModule();document.querySelectorAll('[data-focus-fixture]').forEach(node=>node.remove());});
 it('restores an available trigger but preserves newer outside focus when closing completes late',async()=>{
  const fixture=TestBed.createComponent(DialogPanel),panel=fixture.componentInstance;
  fixture.componentRef.setInput('title','Focus fixture');fixture.componentRef.setInput('closeLabel','Close');fixture.componentRef.setInput('manualInitialFocus',true);
  const trigger=document.createElement('button'),search=document.createElement('input');
  for(const node of [trigger,search]){node.dataset['focusFixture']='';document.body.append(node);}
  trigger.focus();fixture.componentRef.setInput('open',true);TestBed.tick();
  search.focus();panel.restoreFocus();await Promise.resolve();expect(document.activeElement).toBe(search);
  trigger.focus();fixture.componentRef.setInput('open',false);TestBed.tick();fixture.componentRef.setInput('open',true);TestBed.tick();trigger.blur();
  panel.restoreFocus();await Promise.resolve();expect(document.activeElement).toBe(trigger);
 });
});
