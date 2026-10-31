import type { ValidationErrors } from '@angular/forms';

export interface NumericOptions{
 readonly mode:'decimal'|'integer';
 readonly min:string|null;
 readonly max:string|null;
 readonly maxIntegerDigits:number|null;
 readonly maxFractionDigits:number|null;
}
export const numericTextCapacity=512;
const defaults:NumericOptions={mode:'decimal',min:null,max:null,maxIntegerDigits:null,maxFractionDigits:null};
interface Parts{negative:boolean;integer:string;fraction:string}

/** Invariant strings only. Never coerce a decimal amount through binary Number. */
function parts(value:unknown):Parts|null{
 if(typeof value!=='string'||value.length>numericTextCapacity||value.trim()!==value||!/^\-?\d+(?:\.\d+)?$/.test(value))return null;
 const [whole,fraction='']=value.replace(/^-/,'').split('.'),integer=whole!.replace(/^0+/,'')||'0';
 return{negative:value.startsWith('-')&&(integer!=='0'||/[1-9]/.test(fraction)),integer,fraction};
}
export function compareNumericText(left:unknown,right:unknown):-1|0|1|null{
 const a=parts(left),b=parts(right);if(!a||!b)return null;
 if(a.negative!==b.negative)return a.negative?-1:1;
 let magnitude:number;
 if(a.integer.length!==b.integer.length)magnitude=a.integer.length<b.integer.length?-1:1;
 else if(a.integer!==b.integer)magnitude=a.integer<b.integer?-1:1;
 else{const length=Math.max(a.fraction.length,b.fraction.length),af=a.fraction.padEnd(length,'0'),bf=b.fraction.padEnd(length,'0');magnitude=af===bf?0:af<bf?-1:1;}
 return magnitude===0?0:(a.negative?-magnitude:magnitude)<0?-1:1;
}
export function normalizeNumericText(value:string):string{
 return value.replace(/[٠-٩۰-۹]/g,digit=>String(digit.charCodeAt(0)-(digit>='۰'?0x6f0:0x660))).replace(/٫/g,'.').replace(/−/g,'-');
}
export function numericTextErrors(value:unknown,settings:Partial<NumericOptions>={}):ValidationErrors|null{
 const options={...defaults,...settings};
 const validLimit=(limit:unknown,min:number)=>limit===null||(typeof limit==='number'&&Number.isInteger(limit)&&limit>=min&&limit<=numericTextCapacity);
 if(!['integer','decimal'].includes(options.mode)||!validLimit(options.maxIntegerDigits,1)||!validLimit(options.maxFractionDigits,0)||
  (options.min!==null&&!parts(options.min))||(options.max!==null&&!parts(options.max))||
  (options.min!==null&&options.max!==null&&compareNumericText(options.min,options.max)===1))return{numericConfig:true};
 if(value===''||value===null||value===undefined)return null;
 if(typeof value==='string'&&value.length>numericTextCapacity)return{numericCapacity:{max:numericTextCapacity}};
 const parsed=parts(value);if(!parsed)return{numericText:true};
 if(options.mode==='integer'&&parsed.fraction.length)return{numericInteger:true};
 if(options.maxIntegerDigits!==null&&parsed.integer.length>options.maxIntegerDigits)return{numericPrecision:{digits:options.maxIntegerDigits}};
 if(options.maxFractionDigits!==null&&parsed.fraction.length>options.maxFractionDigits)return{numericScale:{digits:options.maxFractionDigits}};
 if((options.min!==null&&compareNumericText(value,options.min)===-1)||(options.max!==null&&compareNumericText(value,options.max)===1))return{numericRange:{min:options.min,max:options.max}};
 return null;
}
