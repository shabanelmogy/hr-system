import { FormControl,FormGroup,type ValidationErrors,type ValidatorFn } from '@angular/forms';
import * as z from 'zod/mini';

export const countryMutationFields=['nameAr','nameEn','alpha2Code','alpha3Code','phoneCode','currencyCode'] as const;
export type CountryMutationField=typeof countryMutationFields[number];
export const countryFieldLimits:Readonly<Record<CountryMutationField,number>>=Object.freeze({nameAr:100,nameEn:100,alpha2Code:2,alpha3Code:3,phoneCode:10,currencyCode:3});
export type CountryDraft=Record<CountryMutationField,string>;
export interface CountryMutation {readonly nameAr:string;readonly nameEn:string;readonly alpha2Code:string|null;readonly alpha3Code:string|null;readonly phoneCode:string|null;readonly currencyCode:string|null;}
export const emptyCountryDraft:CountryDraft={nameAr:'',nameEn:'',alpha2Code:'',alpha3Code:'',phoneCode:'',currencyCode:''};
const draftSchema=z.strictObject({nameAr:z.string(),nameEn:z.string(),alpha2Code:z.string(),alpha3Code:z.string(),phoneCode:z.string(),currencyCode:z.string()});
const printable=/[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/u;
export function countryFieldError(field:CountryMutationField,input:unknown):ValidationErrors|null{
 if(typeof input!=='string')return{pattern:true};
 const value=input.trim().normalize('NFC');
 if(field==='nameAr'||field==='nameEn'){
  if(!value)return{required:true};
  if(printable.test(value))return{invalidText:true};
  if(value.length<2)return{minlength:{requiredLength:2,actualLength:value.length}};
  if(value.length>countryFieldLimits[field])return{maxlength:{requiredLength:countryFieldLimits[field],actualLength:value.length}};
  return null;
 }
 if(!value)return null;
 const valid=field==='alpha2Code'?/^[a-z]{2}$/i.test(value):field==='phoneCode'?value.length<=countryFieldLimits.phoneCode&&/^\+?\d{1,10}$/.test(value):/^[a-z]{3}$/i.test(value);
 return valid?null:{pattern:true};
}
export const countryFieldValidator=(field:CountryMutationField):ValidatorFn=>control=>countryFieldError(field,control.value);
export function createCountryForm(){
 const control=(field:CountryMutationField)=>new FormControl('',{nonNullable:true,validators:[countryFieldValidator(field)]});
 return new FormGroup({nameAr:control('nameAr'),nameEn:control('nameEn'),alpha2Code:control('alpha2Code'),alpha3Code:control('alpha3Code'),phoneCode:control('phoneCode'),currencyCode:control('currencyCode')});
}
export function normalizeCountryDraft(input:CountryDraft):CountryMutation{
 const name=(value:string)=>value.trim().normalize('NFC'),code=(value:string)=>value.trim().toUpperCase()||null;
 return{nameAr:name(input.nameAr),nameEn:name(input.nameEn),alpha2Code:code(input.alpha2Code),alpha3Code:code(input.alpha3Code),phoneCode:input.phoneCode.trim()||null,currencyCode:code(input.currencyCode)};
}
export function parseCountryMutation(input:unknown):CountryMutation{
 const draft=draftSchema.parse(input);
 if(countryMutationFields.some(field=>countryFieldError(field,draft[field])))throw Error('Invalid country mutation');
 return normalizeCountryDraft(draft);
}
export const countryDraftKey=(input:CountryDraft)=>JSON.stringify(normalizeCountryDraft(input));
export function countryDetailDraft(input:CountryMutation):CountryDraft{
 return{nameAr:input.nameAr,nameEn:input.nameEn,alpha2Code:input.alpha2Code??'',alpha3Code:input.alpha3Code??'',phoneCode:input.phoneCode??'',currencyCode:input.currencyCode??''};
}
