import { TestBed } from '@angular/core/testing';
import { provideAppTheme } from '../../../../theme/public-api';
import { LocalizationRuntime } from '../../../platform/localization/public-api';
import { SortDirectionButton } from './sort-direction-button';
describe('Shared compact sort direction',()=>{
 it('combines controlled direction, icon, short text and full bilingual accessible labels without emitting on repaint',async()=>{
  TestBed.configureTestingModule({providers:[provideAppTheme()]});const locale=TestBed.inject(LocalizationRuntime);locale.setLanguage('en');await locale.loadNamespace('core');
  const fixture=TestBed.createComponent(SortDirectionButton),changed=vi.fn();fixture.componentInstance.directionChange.subscribe(changed);await fixture.whenStable();
  const button=(fixture.nativeElement as HTMLElement).querySelector('button')!;expect(button.textContent?.trim()).toBe('Asc');expect(button.getAttribute('aria-label')).toBe('Sort ascending');const up=button.querySelector('path')?.getAttribute('d');button.click();expect(changed).toHaveBeenCalledExactlyOnceWith('desc');expect(fixture.componentInstance.direction()).toBe('asc');
  fixture.componentRef.setInput('direction','desc');locale.setLanguage('ar');await fixture.whenStable();expect(button.textContent?.trim()).toBe('تنازلي');expect(button.getAttribute('aria-label')).toBe('ترتيب تنازلي');expect(button.querySelector('path')?.getAttribute('d')).not.toBe(up);expect(changed).toHaveBeenCalledOnce();
  fixture.componentRef.setInput('disabled',true);await fixture.whenStable();button.click();fixture.componentInstance.toggle();expect(changed).toHaveBeenCalledOnce();fixture.destroy();TestBed.resetTestingModule();
 });
});
