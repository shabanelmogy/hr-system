import { TestBed } from '@angular/core/testing';
import { provideAppTheme } from '../../../../theme/public-api';
import { NavigationList } from './navigation-list';

describe('Shared navigation search',()=>{
  it('filters only supplied entries, exposes a labeled search and preserves selected callbacks',async()=>{
    TestBed.configureTestingModule({providers:[provideAppTheme()]});const f=TestBed.createComponent(NavigationList);
    f.componentRef.setInput('label','Navigation');f.componentRef.setInput('searchLabel','Search navigation');f.componentRef.setInput('expanded',true);
    f.componentRef.setInput('entries',[{id:'home',label:'Home',icon:'home'},{id:'preferences',label:'Settings',icon:'settings'}]);
    await f.whenStable();f.componentInstance.search.setValue('  SET  ');await f.whenStable();const root=f.nativeElement as HTMLElement;
    expect(root.querySelector('input')?.getAttribute('placeholder')).toBe('Search navigation');expect(root.querySelector('label')?.textContent).toBe('Search navigation');
    expect(root.querySelectorAll('nav button')).toHaveLength(1);const selected=vi.fn();f.componentInstance.selected.subscribe(selected);root.querySelector<HTMLButtonElement>('nav button')!.click();
    expect(selected).toHaveBeenCalledExactlyOnceWith('preferences');f.componentInstance.search.setValue('unknown');await f.whenStable();expect(root.querySelectorAll('nav button')).toHaveLength(0);
  });
});
