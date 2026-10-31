import type { ValidationErrors } from '@angular/forms';

export const firstDateOnly='0001-01-01';
export const lastDateOnly='9999-12-31';

/** A business day is validated arithmetically, never interpreted as an instant. */
export function isDateOnly(value:unknown):value is string{
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
 const year=Number(value.slice(0,4)),month=Number(value.slice(5,7)),day=Number(value.slice(8));
 const leap=year%4===0&&(year%100!==0||year%400===0);
 return year>=1&&month>=1&&month<=12&&day>=1&&day<=([31,leap?29:28,31,30,31,30,31,31,30,31,30,31][month-1]??0);
}
export function normalizeDateDigits(value:string):string{
 return value.replace(/[٠-٩۰-۹]/g,digit=>String(digit.charCodeAt(0)-(digit>='۰'?0x6f0:0x660)));
}
export function dateOnlyErrors(value:unknown,min=firstDateOnly,max=lastDateOnly):ValidationErrors|null{
 if(!isDateOnly(min)||!isDateOnly(max)||min>max)return{dateBounds:true};
 if(value===''||value===null||value===undefined)return null;
 if(!isDateOnly(value))return{dateOnly:true};
 return value<min||value>max?{dateRange:{min,max,actual:value}}:null;
}
/** Noon avoids ordinary DST midnight transitions; verify even historical skipped days. */
export function dateOnlyToLocal(value:unknown):Date|null{
 if(!isDateOnly(value))return null;
 const date=new Date(2000,0,1,12,0,0,0);
 date.setFullYear(Number(value.slice(0,4)),Number(value.slice(5,7))-1,Number(value.slice(8)));
 return localToDateOnly(date)===value?date:null;
}
export function localToDateOnly(value:unknown):string|null{
 if(!(value instanceof Date)||!Number.isFinite(value.getTime()))return null;
 const day=`${String(value.getFullYear()).padStart(4,'0')}-${String(value.getMonth()+1).padStart(2,'0')}-${String(value.getDate()).padStart(2,'0')}`;
 return isDateOnly(day)?day:null;
}
