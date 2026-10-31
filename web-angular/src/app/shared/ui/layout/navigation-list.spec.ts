import { TestBed } from '@angular/core/testing';
import { provideAppTheme } from '../../../../theme/public-api';
import { filterNavigationEntries, NavigationList, type NavigationEntry } from './navigation-list';

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
  const hierarchy:readonly NavigationEntry[]=[{id:'data',label:'Data',icon:'dataset',children:[{id:'geography',label:'Geography',icon:'globe',children:[{id:'countries',label:'Countries',icon:'flag'}]}]},{id:'settings',label:'Settings',icon:'settings'}];
  it('searches descendant labels without mutating the source or including unrelated siblings',()=>{
    const result=filterNavigationEntries(hierarchy,'  coun  ');
    expect(result).toHaveLength(1);expect(result[0].children?.[0].children?.map(item=>item.id)).toEqual(['countries']);
    expect(hierarchy).toHaveLength(2);expect(filterNavigationEntries(hierarchy,'missing')).toEqual([]);
  });
  it('expands groups without navigating and reveals matching nested leaves through one shared search',async()=>{
    TestBed.configureTestingModule({providers:[provideAppTheme()]});const f=TestBed.createComponent(NavigationList);
    for(const [key,value]of Object.entries({label:'Navigation',searchLabel:'Find',entries:hierarchy}))f.componentRef.setInput(key,value);
    await f.whenStable();const selected=vi.fn(),expanded=vi.fn();f.componentInstance.selected.subscribe(selected);f.componentInstance.expansionRequested.subscribe(expanded);
    const root=f.nativeElement as HTMLElement;
    root.querySelector<HTMLButtonElement>('button')!.click();await f.whenStable();expect(expanded).toHaveBeenCalledOnce();expect(selected).not.toHaveBeenCalled();
    f.componentRef.setInput('expanded',true);await f.whenStable();expect(root.textContent).toContain('Geography');
    f.componentInstance.search.setValue('Countries');await f.whenStable();
    expect(root.querySelectorAll('input')).toHaveLength(1);expect(root.textContent).not.toContain('Settings');
    Array.from(root.querySelectorAll<HTMLButtonElement>('button')).find(button=>button.textContent?.trim()==='Countries')!.click();
    expect(selected).toHaveBeenCalledExactlyOnceWith('countries');
  });
});
