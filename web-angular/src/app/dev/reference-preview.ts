import { Component,computed,DestroyRef,inject,signal } from '@angular/core';
import { FormControl,FormGroup,ReactiveFormsModule,Validators } from '@angular/forms';
import { themePaletteOrder } from '@app/tokens';
import { LocalizationRuntime,UiTextPipe } from '../platform/localization/public-api';
import { ThemeService } from '../../theme/public-api';
import { ActionButton,applyServerFieldErrors,FormContainer,OptionSelect,PageHeader,ReferenceField,TextField,type ReferenceId,type ReferenceOption,type ReferenceSelection,type ReferenceSource } from '../shared/ui/public-api';

type Scenario='ready'|'error'|'forbidden'|'empty'|'loading'|'missing'|'archived';
@Component({imports:[ReactiveFormsModule,ActionButton,FormContainer,OptionSelect,PageHeader,ReferenceField,TextField,UiTextPipe],template:`
 <main><erp-page-header [title]="'reference.currentSelection'|uiText"><div class="preferences">
  <erp-button [label]="(runtime.language()==='en'?'common.arabic':'common.english')|uiText" data-testid="language" (activated)="runtime.setLanguage(runtime.language()==='en'?'ar':'en')" />
  <erp-button [label]="(theme.mode()==='light'?'general.darkMode':'general.lightMode')|uiText" (activated)="theme.setMode(theme.mode()==='light'?'dark':'light')" />
  @for(palette of palettes;track palette){<erp-button [label]="('menu.palettes.'+palette)|uiText" [attr.data-palette]="palette" (activated)="theme.setPalette(palette)" />}
 </div></erp-page-header>
 <div class="tools">
  <erp-option-select [label]="'collections.filters'|uiText" [options]="parents" [value]="parent()" (valueChange)="changeParent($event)" data-testid="parent" />
  @for(item of scenarios;track item.value){<erp-button [label]="item.label|uiText" [attr.data-scenario]="item.value" (activated)="changeScenario(item.value)" />}
  <erp-button [label]="'actions.viewOnly'|uiText" data-testid="readonly" [pressed]="readonly()" (activated)="readonly.set(!readonly())" />
  <erp-button [label]="'common.loading'|uiText" data-testid="disable" [pressed]="form.controls.reference.disabled" (activated)="toggleDisabled()" />
  <erp-button [label]="'general.reset'|uiText" data-testid="reset" (activated)="reset()" />
  <erp-button [label]="'actions.editInformation'|uiText" data-testid="patch" (activated)="patch()" />
  <erp-button [label]="'common.validationErrors'|uiText" data-testid="server-error" (activated)="serverError()" />
 </div>
 <erp-form [form]="form" [title]="'reference.currentSelection'|uiText" [submitLabel]="'common.save'|uiText" (validSubmit)="saved.update(increment)" data-testid="form">
  <div class="fields">
   <erp-reference-field [formControl]="form.controls.reference" [label]="('reference.currentSelection'|uiText)+' A'" [source]="source()" [selection]="selection()" [searchText]="search()" [readOnly]="readonly()" [messages]="messages()" required (searchChange)="searchFor($event)" (loadMore)="request(true)" (retry)="retry()" data-testid="remote" />
   <erp-reference-field [formControl]="form.controls.finite" [label]="('reference.currentSelection'|uiText)+' B'" [source]="finite()" [searchable]="false" [messages]="messages()" required data-testid="finite" />
   <erp-text-field [formControl]="form.controls.name" [label]="'general.nameEn'|uiText" [messages]="messages()" required data-testid="name" />
  </div>
 </erp-form>
 <output data-testid="state" [attr.data-kind]="source().kind" [attr.data-reference]="form.controls.reference.value" [attr.data-type]="typeofId()" [attr.data-count]="source().result?.options?.length??0" [attr.data-search]="search()" [attr.data-parent]="parent()" [attr.data-requests]="requests()" [attr.data-saved]="saved()"></output>
 </main>`,styles:`main{padding:24px;max-width:1300px;margin-inline:auto;min-width:0}.tools,.preferences{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:24px}.tools{--action-min-height:36px;--option-label-background:var(--background)}.fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;min-width:0}.fields erp-text-field{grid-column:1/-1}@media(max-width:599px){main{padding:12px}.fields{grid-template-columns:minmax(0,1fr)}.preferences{gap:4px}}`})
export class ReferencePreview{
 readonly runtime=inject(LocalizationRuntime);readonly theme=inject(ThemeService);readonly palettes=themePaletteOrder;
 readonly parent=signal('A');readonly parents=[{value:'A',label:'A'},{value:'B',label:'B'}];readonly search=signal('');readonly readonly=signal(false);readonly scenario=signal<Scenario>('ready');
 readonly form=new FormGroup({reference:new FormControl<ReferenceId|null>(91,Validators.required),finite:new FormControl<ReferenceId|null>('0',Validators.required),name:new FormControl('',Validators.required)});
 readonly source=signal<ReferenceSource>({query:{scopeKey:'A',search:''},kind:'loading'});readonly selection=signal<ReferenceSelection|null>({scopeKey:'A',value:91,kind:'ready',option:{value:91,label:'A · 91'}});
 readonly messages=computed(()=>({required:this.runtime.translate('validation.required'),unavailable:this.runtime.translate('reference.unavailable')}));
 readonly finite=computed<ReferenceSource>(()=>{const query={scopeKey:'finite',search:''};return{query,kind:'ready',result:{query,options:[{value:'0',label:'0 · A'},{value:'1',label:'1 · B'},{value:'long',label:this.runtime.language()==='ar'?'مرجع تجريبي طويل للاختبار فقط · '.repeat(5):'Long technical fixture label · '.repeat(5)}],hasMore:false}};});
 readonly scenarios:readonly{value:Scenario;label:string}[]=[{value:'ready',label:'common.all'},{value:'error',label:'common.error'},{value:'forbidden',label:'authorization.forbidden.title'},{value:'empty',label:'common.noOptionsFound'},{value:'loading',label:'common.loading'},{value:'missing',label:'reference.unavailable'},{value:'archived',label:'actions.archive'}];
 readonly requests=signal(0);readonly saved=signal(0);readonly increment=(value:number)=>value+1;
 private generation=0;private timer:ReturnType<typeof setTimeout>|undefined;private debounce:ReturnType<typeof setTimeout>|undefined;
 constructor(){void this.runtime.loadNamespace('core');this.request();inject(DestroyRef).onDestroy(()=>{this.generation++;clearTimeout(this.timer);clearTimeout(this.debounce);});}
 typeofId(){return typeof this.form.controls.reference.value;}
 changeParent(value:string){if(value!=='A'&&value!=='B')return;this.parent.set(value);this.form.controls.reference.reset(null);this.selection.set(null);this.search.set('');clearTimeout(this.debounce);this.request();}
 searchFor(value:string){this.search.set(value);clearTimeout(this.debounce);this.debounce=setTimeout(()=>this.request(),180);}
 changeScenario(value:Scenario){this.scenario.set(value);this.request();if(value==='missing'||value==='archived')this.patch();}
 retry(){this.scenario.set('ready');this.request();}
 request(append=false){
  const generation=++this.generation;clearTimeout(this.timer);this.requests.update(value=>value+1);const query={scopeKey:this.parent(),search:this.search()},scenario=this.scenario();
  const previous=append&&this.source().kind==='ready'&&this.source().result?.query.scopeKey===query.scopeKey&&this.source().result?.query.search===query.search?[...this.source().result!.options]:[];
  this.source.update(source=>({...source,query,kind:'loading'}));if(scenario==='loading')return;
  this.timer=setTimeout(()=>{if(generation!==this.generation)return;if(scenario==='error'||scenario==='forbidden'){this.source.set({query,kind:scenario});return;}
   const all:ReferenceOption[]=Array.from({length:23},(_,i)=>({value:i,label:query.scopeKey+' · '+String(i).padStart(2,'0'),disabled:i===2})).filter(option=>scenario!=='empty'&&option.label.toLowerCase().includes(query.search.trim().toLowerCase()));
   const options=all.slice(0,previous.length+5);this.source.set({query,kind:'ready',result:{query,options,hasMore:options.length<all.length}});
  },250);
 }
 reset(){this.readonly.set(false);this.form.enable();this.form.reset({reference:null,finite:null,name:''});this.selection.set(null);this.search.set('');clearTimeout(this.debounce);this.scenario.set('ready');this.request();}
 patch(){const scopeKey=this.parent();const missing=this.scenario()==='missing',archived=this.scenario()==='archived';this.form.controls.reference.setValue(91);this.selection.set({scopeKey,value:91,kind:missing?'missing':'ready',option:missing?undefined:{value:91,label:scopeKey+' · 91',disabled:archived,description:archived?this.runtime.translate('actions.archive'):undefined}});if(missing)this.form.controls.reference.setErrors({unavailable:true});}
 toggleDisabled(){const control=this.form.controls.reference;if(control.disabled)control.enable();else control.disable();}
 serverError(){applyServerFieldErrors(this.form,{reference:this.runtime.translate('validation.required')});}
}
