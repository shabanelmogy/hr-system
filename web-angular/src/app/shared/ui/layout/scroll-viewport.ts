import { Component, input } from '@angular/core';
import { ScrollAreaModule } from 'primeng/scrollarea';

/** Shared PrimeNG scrolling surface; feature pages supply content, never another scrollbar shell. */
@Component({selector:'erp-scroll-viewport',imports:[ScrollAreaModule],template:`
  <p-scrollarea variant="auto" [dt]="tokens" [style]="{width:'100%',height:'100%'}">
    <p-scrollarea-viewport class="scroll-viewport" role="region" [attr.aria-label]="label()" [style.overflow-x]="'hidden'">
      <p-scrollarea-content class="scroll-content" [class.fill]="fillContent()"><ng-content /></p-scrollarea-content>
    </p-scrollarea-viewport>
    <p-scrollarea-scrollbar orientation="vertical" class="scroll-track"><p-scrollarea-handle class="scroll-handle" /></p-scrollarea-scrollbar>
  </p-scrollarea>`,styles:`
  :host{display:block;min-width:0;min-height:0;height:100%;width:100%}.scroll-viewport{height:100%;width:100%}
  .scroll-content{display:flex;flex-direction:column;min-height:100%;min-width:0}.scroll-content.fill{height:100%}
  .scroll-track{border-radius:999px}.scroll-handle{border-radius:999px;transition:background 150ms}.scroll-handle:hover{background:var(--primary)}
  @media(prefers-reduced-motion:reduce){.scroll-handle{transition:none}}
`})
export class ScrollViewport {
  readonly label=input.required<string>();readonly fillContent=input(false);
  readonly tokens={root:{background:'transparent',borderColor:'transparent',borderRadius:'0px',focusRing:{width:'2px',style:'solid',color:'var(--ring)',offset:'-2px',shadow:'none'}},viewport:{padding:'0px'},
    scrollbar:{background:'transparent',margin:'2px',size:'7px',transitionDuration:'150ms'},handle:{background:'color-mix(in srgb,var(--primary) 45%,var(--border))'},mask:{fadeSize:'40px'}};
}
