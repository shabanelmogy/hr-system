import { booleanAttribute,Component, ElementRef, input, signal, viewChild } from '@angular/core';
import { Popover } from 'primeng/popover';
import { ActionButton } from '../buttons/public-api';

@Component({ selector: 'erp-popover-panel', imports: [Popover, ActionButton], template: `
  <erp-button #trigger [label]="label()" [appearance]="triggerAppearance()" variant="text" [expanded]="opened()" hasPopup="dialog"
    [disabled]="disabled()" (activated)="toggle($event)"><ng-content select="[popoverTrigger]" ngProjectAs="[buttonIcon]" /></erp-button>
  <p-popover #panel appendTo="body" [ariaLabel]="label()" [style]="{width:'340px',maxWidth:'calc(100vw - 24px)'}"
    (onShow)="opened.set(true)" (onHide)="hidden()"><ng-content /></p-popover>
` })
export class PopoverPanel {
  readonly disabled=input(false,{transform:booleanAttribute});
  readonly triggerAppearance=input<'icon'|'quiet'>('icon');
  readonly label = input.required<string>(); readonly opened = signal(false);
  private readonly panel = viewChild.required<Popover>('panel');
  private readonly trigger = viewChild.required<ActionButton>('trigger');
  private readonly triggerElement = viewChild.required<ActionButton,ElementRef<HTMLElement>>('trigger',{read:ElementRef});
  open():void{if(!this.disabled())this.panel().show(new Event('click'),this.triggerElement().nativeElement);}
  toggle(event:MouseEvent):void{if(!this.disabled())this.panel().toggle(event);}
  close(): void { this.panel().hide(); }
  hidden(): void { this.opened.set(false); this.trigger().focus(); }
}
