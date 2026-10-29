import { Component, input } from '@angular/core';

@Component({ selector: 'erp-page-header', template: '<header><div><h1>{{ title() }}</h1>@if(subtitle()){<p>{{ subtitle() }}</p>}</div><ng-content /></header>',
  styles: ':host{display:block;margin-bottom:24px}header{display:flex;align-items:center;justify-content:space-between;gap:16px;min-width:0}h1{font-size:24px;line-height:1.334;font-weight:700;color:var(--primary);margin:0;overflow-wrap:anywhere}p{margin:4px 0 0;color:var(--muted-foreground)}@media(max-width:899px){header{align-items:flex-start;flex-direction:column}}' })
export class PageHeader { readonly title = input.required<string>(); readonly subtitle = input(''); }
