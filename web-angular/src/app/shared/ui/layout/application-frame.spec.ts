import { BreakpointObserver, type BreakpointState } from '@angular/cdk/layout';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { provideAppTheme } from '../../../../theme/public-api';
import { ApplicationFrame } from './application-frame';

describe('Responsive shared application frame',()=>{
  it('resets expanded navigation across viewport changes and emits real navigation actions',async()=>{
    const viewport=new BehaviorSubject<BreakpointState>({matches:true,breakpoints:{}});
    TestBed.configureTestingModule({providers:[provideRouter([]),provideAppTheme(),{provide:BreakpointObserver,useValue:{observe:()=>viewport}}]});
    const f=TestBed.createComponent(ApplicationFrame);
    for(const [key,value]of Object.entries({title:'ERP',name:'Fixture User',navigationLabel:'Navigation',openLabel:'Open',closeLabel:'Close',searchLabel:'Search',homePath:'/home',entries:[{id:'home',label:'Home',icon:'home'}]}))f.componentRef.setInput(key,value);
    await f.whenStable();expect(f.componentInstance.desktop()).toBe(true);expect(f.componentInstance.opened()).toBe(false);
    f.componentInstance.opened.set(true);await f.whenStable();expect((f.nativeElement as HTMLElement).classList.contains('expanded')).toBe(true);
    viewport.next({matches:false,breakpoints:{}});await f.whenStable();expect(f.componentInstance.opened()).toBe(false);expect((f.nativeElement as HTMLElement).querySelector('aside')).toBeNull();
    const selected=vi.fn();f.componentInstance.activated.subscribe(selected);f.componentInstance.opened.set(true);f.componentInstance.activate('home');await f.whenStable();
    expect(selected).toHaveBeenCalledExactlyOnceWith('home');expect(f.componentInstance.opened()).toBe(false);
  });
});
