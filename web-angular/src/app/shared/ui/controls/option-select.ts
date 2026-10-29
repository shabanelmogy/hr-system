import { Component, computed, effect, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Select } from 'primeng/select';
import { ContextBadge } from '../layout/context-badge';
import type { AppIconName } from '../icons/app-icon';

@Component({ selector: 'erp-option-select', imports:[ReactiveFormsModule,Select,ContextBadge],host:{'[class.context-control]':"appearance()==='context'"}, template: `
  <div class="preference-select">
    <p-select [inputId]="id" [options]="selectableOptions()" optionLabel="label" optionValue="value" [ariaLabel]="appearance()==='context'?label()+': '+selectedLabel():label()"
      [formControl]="control" appendTo="body" [fluid]="appearance()!=='context'" [loading]="busy()" [placeholder]="emptyLabel()" [invalid]="invalid()"
      [dt]="tokens()" [style]="{height:appearance()==='context'?'36px':'40px',color:'inherit',maxWidth:'100%'}">
      <ng-template #selectedItem let-option>@if(appearance()==='context'){<erp-context-badge [label]="label()" [value]="selectedLabel()" [icon]="icon()" />}@else{ {{ option?.label }} }</ng-template>
      <ng-template #item let-option><span class="option-copy"><span>{{ option.label }}</span>@if(option.description){<small>{{ option.description }}</small>}</span></ng-template>
    </p-select>
    @if(appearance()!=='context'){<label [for]="id">{{ label() }}</label>}
  </div>`, styles: `
    :host{display:inline-block;min-inline-size:7.8125rem}.preference-select{position:relative}
    label{position:absolute;z-index:1;inset-inline-start:0.625rem;top:-0.5rem;padding-inline:0.25rem;background:var(--option-label-background,var(--primary));font-size:0.75rem;line-height:1rem;color:inherit}
    :host(.context-control){min-inline-size:0;max-inline-size:240px}.option-copy{display:flex;flex-direction:column;gap:2px}small{font-size:12px;color:var(--muted-foreground)}
  ` })
export class OptionSelect {
  private static sequence=0;readonly id='erp-preference-select-'+ ++OptionSelect.sequence;
  readonly label = input.required<string>(); readonly value = input.required<string>();
  readonly options = input.required<readonly { value: string; label: string; description?:string }[]>();
  readonly appearance=input<'preference'|'context'>('preference');readonly icon=input<AppIconName>('company');
  readonly disabled=input(false);readonly busy=input(false);readonly commitMode=input<'immediate'|'external'>('immediate');
  readonly emptyLabel=input('');readonly invalid=input(false);
  readonly control=new FormControl('',{nonNullable:true});
  readonly selectedLabel=computed(()=>this.options().find(option=>option.value===this.value())?.label??this.emptyLabel());
  readonly selectableOptions=computed(()=>[...this.options()]);
  readonly tokens=computed(()=>this.appearance()==='context'?{root:{color:'var(--foreground)',background:'transparent',borderColor:'transparent',hoverBorderColor:'transparent',focusBorderColor:'var(--ring)',paddingX:'0px',paddingY:'0px'},dropdown:{color:'var(--muted-foreground)',width:'18px'}}:{root:{color:'currentColor',background:'transparent',borderColor:'color-mix(in srgb,currentColor 25%,transparent)',hoverBorderColor:'currentColor',focusBorderColor:'currentColor'},dropdown:{color:'currentColor'}});
  readonly valueChange = output<string>();
  constructor(){
    effect(()=>{this.control.setValue(this.value(),{emitEvent:false});if(this.disabled()||this.busy())this.control.disable({emitEvent:false});else this.control.enable({emitEvent:false});});
    this.control.valueChanges.pipe(takeUntilDestroyed()).subscribe(value=>this.change(value));
  }
  change(value:unknown):void{
    const valid=typeof value==='string'&&this.options().some(option=>option.value===value);
    if(!valid||this.commitMode()==='external'||this.disabled()||this.busy())this.control.setValue(this.value(),{emitEvent:false});
    if(valid&&!this.disabled()&&!this.busy())this.valueChange.emit(value);
  }
}
