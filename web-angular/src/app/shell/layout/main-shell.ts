import { Component, computed, effect, inject, isDevMode, signal, viewChild } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { SHELL_CONTEXT_COMPONENT,SHELL_APPLICATION_COMPONENT,SHELL_CONTEXT_FEEDBACK,SHELL_DATA_NAVIGATION } from '../context-slot';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { themePaletteOrder, type ThemePalette } from '@app/tokens';
import { AuthSession } from '../../platform/auth/session.public-api';
import { LocalizationRuntime, UiTextPipe } from '../../platform/localization/public-api';
import { tenantWorkspaceAllowed } from '../../platform/modules/public-api';
import { ActionButton, AppIcon, ApplicationFrame, ContextBadge, FeedbackState, IdentityAvatar, OptionSelect, PalettePicker, PopoverPanel, type NavigationEntry } from '../../shared/ui/public-api';
import { ThemeService } from '../../../theme/public-api';

@Component({ imports:[NgComponentOutlet,RouterOutlet,UiTextPipe,ApplicationFrame,ActionButton,AppIcon,ContextBadge,FeedbackState,IdentityAvatar,OptionSelect,PalettePicker,PopoverPanel],
  providers:[{provide:SHELL_DATA_NAVIGATION,useFactory:()=>inject(MainShell).dataNavigation}],
  templateUrl:'./main-shell.html',styleUrl:'./main-shell.scss' })
export class MainShell {
  readonly frame=viewChild.required<ApplicationFrame>('frame');
  private readonly dataOpened=signal(false);private readonly dataBranchIds=Object.freeze(['data','global-geography']);
  readonly dataAvailable=computed(()=>{const actor=this.auth.readIdentity();return isDevMode()&&actor!==null&&actor.roles.some(role=>role.trim().toLowerCase()==='super_admin')&&actor.permissions.includes('Countries:View');});
  readonly expandedEntries=computed(()=>this.dataOpened()?this.dataBranchIds:[]);
  readonly dataNavigation={available:this.dataAvailable,open:()=>{if(this.dataAvailable()&&!this.auth.pending()){this.dataOpened.set(true);this.frame().opened.set(true);}}};
  readonly contextComponent=inject(SHELL_CONTEXT_COMPONENT);readonly extraFeedback=inject(SHELL_CONTEXT_FEEDBACK);
  readonly applicationComponent=inject(SHELL_APPLICATION_COMPONENT);
  readonly auth=inject(AuthSession);readonly locale=inject(LocalizationRuntime);readonly theme=inject(ThemeService);private readonly router=inject(Router);
  readonly path=toSignal(this.router.events.pipe(filter((event):event is NavigationEnd=>event instanceof NavigationEnd),map(event=>event.urlAfterRedirects.split('?')[0])),{initialValue:this.router.url.split('?')[0]});
  readonly settings=viewChild.required<PopoverPanel>('settings');
  readonly name=computed(()=>{const u=this.auth.user();return [u?.firstName,u?.lastName].filter(Boolean).join(' ').trim() || u?.userName || '';});
  readonly role=computed(()=>this.auth.user()?.roles[0] ?? '');
  readonly global=computed(()=>this.auth.user()?.roles.some(r=>r.trim().toLowerCase()==='super_admin') ?? false);
  readonly company=computed(()=>{const u=this.auth.user();return(this.locale.language()==='ar'?u?.companyNameAr:u?.companyNameEn)?.trim()||u?.companyCode||'';});
  readonly companyOptions=computed(()=>this.auth.user()?.companies.map(c=>({value:String(c.id),label:(this.locale.language()==='ar'?c.nameAr:c.nameEn).trim()||(this.locale.language()==='ar'?c.nameEn:c.nameAr).trim()||c.companyCode,description:c.companyCode}))??[]);
  readonly navigation=computed<readonly NavigationEntry[]>(()=>[
    {id:'home',label:this.locale.translate('general.home'),icon:'home',selected:this.path()==='/home'},
    ...(this.dataAvailable()?[{id:'data',label:this.locale.translate('menu.basicData'),icon:'dataset' as const,children:[{id:'global-geography',label:this.locale.translate('menu.globalGeography'),icon:'globe' as const,children:[{id:'countries',label:this.locale.translate('menu.countries'),icon:'flag' as const,selected:this.path()==='/dev/countries'}]}]}]:[]),
    ...(tenantWorkspaceAllowed(this.auth.user())?[{id:'apps',label:this.locale.translate('modules.title'),icon:'apps' as const,selected:this.path().startsWith('/apps')}]:[]),
    {id:'preferences',label:this.locale.translate('menu.settings'),icon:'settings'},
  ]);
  readonly languages=[{value:'en',label:'English'},{value:'ar',label:'العربية'}];
  readonly paletteLabels=computed(()=>Object.fromEntries(themePaletteOrder.map(p=>[p,this.locale.translate('menu.palettes.'+p)])) as Readonly<Record<ThemePalette,string>>);
  constructor(){
    effect(()=>{this.auth.readIdentity();this.dataOpened.set(false);});
    void Promise.all([this.locale.loadNamespace('core'),this.locale.loadNamespace('platform-auth')]);
    effect(()=>{
      const user=this.auth.user();if(this.auth.pending()||this.auth.restoring())return;
      if(!user)void this.router.navigateByUrl('/login');
      else if(tenantWorkspaceAllowed(user)&&this.path()==='/home')void this.router.navigateByUrl('/apps');
    });
  }
  activate(id:string):void{if(!this.auth.user()||this.auth.pending())return;if(id==='countries'&&this.dataAvailable())void this.router.navigateByUrl('/dev/countries');else if(id==='preferences')this.settings().open();else if(id==='home'||id==='apps'&&tenantWorkspaceAllowed(this.auth.user()))void this.router.navigateByUrl(id==='home'?'/home':'/apps');}
  language(value:string):void{if(value==='en'||value==='ar'){this.locale.setLanguage(value);if(this.settings().opened())this.settings().close();}}
  async switchCompany(value:string):Promise<void>{await this.auth.switchCompany(Number(value));}
  async logout():Promise<void>{if(this.auth.pending())return;this.settings().close();await this.auth.logout();if(!this.auth.user())await this.router.navigateByUrl('/login');}
}
