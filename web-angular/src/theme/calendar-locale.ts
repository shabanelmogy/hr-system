import { effect,inject,Injectable } from '@angular/core';
import { PrimeNG } from 'primeng/config';
import { LocalizationRuntime } from '../app/platform/localization/public-api';

/** Adopted calendar captions follow the same SQL-backed text revision as the form. */
@Injectable({providedIn:'root'})
export class CalendarLocale{
 private readonly locale=inject(LocalizationRuntime);private readonly prime=inject(PrimeNG);
 constructor(){effect(()=>{
  const text=(key:string)=>this.locale.translate(`dateField.${key}`);
  const days=Array.from({length:7},(_,i)=>text(`day${i}`)),months=Array.from({length:12},(_,i)=>text(`month${i+1}`));
  this.prime.setTranslation({dayNames:days,dayNamesShort:days,dayNamesMin:Array.from({length:7},(_,i)=>text(`dayShort${i}`)),monthNames:months,monthNamesShort:months,firstDayOfWeek:0,dateFormat:'yy-mm-dd',chooseDate:text('chooseDate'),chooseMonth:text('chooseMonth'),chooseYear:text('chooseYear'),prevMonth:text('prevMonth'),nextMonth:text('nextMonth'),prevYear:text('prevYear'),nextYear:text('nextYear'),prevDecade:text('prevDecade'),nextDecade:text('nextDecade')});
 });}
}
