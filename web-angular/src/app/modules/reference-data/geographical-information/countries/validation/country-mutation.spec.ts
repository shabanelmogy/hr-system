import { countryDraftKey,countryFieldError,createCountryForm,emptyCountryDraft,parseCountryMutation } from './country-mutation';
describe('Country write validation and semantic drafts',()=>{
 const draft={...emptyCountryDraft,nameAr:' مصر ',nameEn:' Egypt ',alpha2Code:' eg ',phoneCode:' +20 '};
 it('normalizes a snapshot without mutating its draft and sends optional blanks as null',()=>{
  expect(parseCountryMutation(draft)).toEqual({nameAr:'مصر',nameEn:'Egypt',alpha2Code:'EG',alpha3Code:null,phoneCode:'+20',currencyCode:null});expect(draft.alpha2Code).toBe(' eg ');
  expect(countryDraftKey(draft)).toBe(countryDraftKey({...draft,nameAr:'مصر',nameEn:'Egypt',alpha2Code:'EG'}));
 });
 it('enforces printable normalized names and the API phone length including plus',()=>{
  for(const value of ['', ' ', 'a','a'.repeat(101),'ab\ncd','a\u200Db'])expect(countryFieldError('nameEn',value)).not.toBeNull();
  expect(countryFieldError('nameEn','Cafe\u0301')).toBeNull();expect(countryFieldError('phoneCode','+1234567890')).not.toBeNull();expect(countryFieldError('phoneCode','+123456789')).toBeNull();
  expect(countryFieldError('alpha2Code','USA')).not.toBeNull();expect(countryFieldError('currencyCode','12A')).not.toBeNull();expect(()=>parseCountryMutation({...draft,extra:'unowned'})).toThrow();
 });
 it('keeps an invalid form actionable and marks both names invalid at submission',()=>{
  const form=createCountryForm();expect(form.enabled).toBe(true);form.markAllAsTouched();expect(form.controls.nameAr.errors).toEqual({required:true});expect(form.controls.nameEn.errors).toEqual({required:true});
 });
});
