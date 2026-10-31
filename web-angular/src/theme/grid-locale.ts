import { effect,inject,Injectable } from '@angular/core';
import { PrimeNG } from 'primeng/config';
import { LocalizationRuntime } from '../app/platform/localization/public-api';

/** Native Table filter menus use the same persisted SQL-backed captions as shared controls. */
@Injectable({providedIn:'root'})
export class GridLocale {
 private readonly runtime=inject(LocalizationRuntime);private readonly prime=inject(PrimeNG);
 constructor(){effect(()=>{
  const text=(key:string)=>this.runtime.translate('collections.'+key);
  this.prime.setTranslation({startsWith:text('startsWith'),contains:text('contains'),notContains:text('notContains'),endsWith:text('endsWith'),equals:text('equals'),notEquals:text('notEquals'),lt:text('lt'),lte:text('lte'),gt:text('gt'),gte:text('gte'),dateIs:text('dateIs'),dateIsNot:text('dateIsNot'),dateBefore:text('dateBefore'),dateAfter:text('dateAfter'),clear:text('clear'),apply:text('apply'),matchAll:text('matchAll'),matchAny:text('matchAny'),addRule:text('addRule'),removeRule:text('removeRule'),aria:{...this.prime.translation.aria,filterOperator:text('filterOperator'),filterConstraint:text('filterConstraint'),showFilterMenu:text('showFilterMenu'),hideFilterMenu:text('hideFilterMenu'),rowsPerPageLabel:this.runtime.translate('pagination.rowsPerPage'),pageLabel:this.runtime.translate('pagination.goToPage')+' {page}'}});
 });}
}
