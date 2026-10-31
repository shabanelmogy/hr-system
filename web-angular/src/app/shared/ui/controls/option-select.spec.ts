import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Select } from 'primeng/select';
import { provideAppTheme } from '../../../../theme/public-api';
import { OptionSelect } from './option-select';

describe('Shared preference selector', () => {
  beforeEach(()=>TestBed.configureTestingModule({providers:[provideAppTheme()]}));
  it('selects the initial RTL preference after options render and reflects a later change', async () => {
    const fixture = TestBed.createComponent(OptionSelect);
    fixture.componentRef.setInput('label', 'Language'); fixture.componentRef.setInput('value', 'ar');
    fixture.componentRef.setInput('options', [{ value: 'en', label: 'English' }, { value: 'ar', label: 'العربية' }]);
    const changed=vi.fn();fixture.componentInstance.valueChange.subscribe(changed);
    await fixture.whenStable(); const root=fixture.nativeElement as HTMLElement;
    expect(root.querySelector('p-select')).not.toBeNull();expect(root.querySelector('select')).toBeNull();
    expect(root.querySelector('.p-select-label')?.textContent?.trim()).toBe('العربية');
    fixture.componentRef.setInput('value', 'en'); await fixture.whenStable();expect(root.querySelector('.p-select-label')?.textContent?.trim()).toBe('English');expect(changed).not.toHaveBeenCalled();
  });

  it('emits only the user selected option without submitting a form', async () => {
    const fixture = TestBed.createComponent(OptionSelect); fixture.componentRef.setInput('label', 'Language'); fixture.componentRef.setInput('value', 'en');
    fixture.componentRef.setInput('options', [{ value: 'en', label: 'English' }, { value: 'ar', label: 'العربية' }]);
    const changed = vi.fn(); fixture.componentInstance.valueChange.subscribe(changed); await fixture.whenStable();
    fixture.componentInstance.control.setValue('unregistered');expect(changed).not.toHaveBeenCalled();
    fixture.componentInstance.control.setValue('ar');
    expect(changed).toHaveBeenCalledExactlyOnceWith('ar');
  });
  it('keeps an asynchronous context at its verified value until the caller commits and blocks busy selection',async()=>{
    const f=TestBed.createComponent(OptionSelect);for(const [k,v]of Object.entries({label:'Company',value:'1',options:[{value:'1',label:'First',description:'C1'},{value:'2',label:'Second',description:'C2'}],appearance:'context',commitMode:'external'}))f.componentRef.setInput(k,v);
    const changed=vi.fn();f.componentInstance.valueChange.subscribe(changed);await f.whenStable();
    f.componentInstance.control.setValue('2');await f.whenStable();expect(changed).toHaveBeenCalledExactlyOnceWith('2');expect(f.componentInstance.control.value).toBe('1');expect((f.nativeElement as HTMLElement).querySelector('.p-select-label')?.textContent).toContain('First');
    f.componentRef.setInput('value','2');await f.whenStable();expect((f.nativeElement as HTMLElement).querySelector('.p-select-label')?.textContent).toContain('Second');expect(changed).toHaveBeenCalledTimes(1);
    f.componentRef.setInput('busy',true);await f.whenStable();f.componentInstance.control.setValue('1');expect(changed).toHaveBeenCalledTimes(1);expect(f.componentInstance.control.value).toBe('2');
  });
  it('reconciles actual vendor CVA completion so a rejected external selection can be retried',async()=>{
    const fixture=TestBed.createComponent(OptionSelect);
    for(const [key,value]of Object.entries({label:'Company',value:'1',options:[{value:'1',label:'First'},{value:'2',label:'Second'}],commitMode:'external'}))fixture.componentRef.setInput(key,value);
    const changed=vi.fn();fixture.componentInstance.valueChange.subscribe(changed);await fixture.whenStable();
    const select=fixture.debugElement.query(By.directive(Select)).componentInstance as Select;
    select.onOptionSelect(new Event('click'),{value:'2',label:'Second'});await fixture.whenStable();
    expect(select.modelValue()).toBe('1');expect((fixture.nativeElement as HTMLElement).querySelector('.p-select-label')?.textContent).toContain('First');
    select.onOptionSelect(new Event('click'),{value:'2',label:'Second'});await fixture.whenStable();
    expect(changed).toHaveBeenCalledTimes(2);expect(select.modelValue()).toBe('1');
  });
});
