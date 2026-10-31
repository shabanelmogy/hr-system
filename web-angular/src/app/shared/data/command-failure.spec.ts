import { HttpErrorResponse } from '@angular/common/http';
import { classifyCommandFailure } from './command-failure';
describe('Command uncertainty and field error boundary',()=>{
 it('distinguishes not-dispatched failures, authoritative rejections and uncertain dispatched outcomes',()=>{
  expect(classifyCommandFailure(Error('csrf'),false).outcome).toBe('not-sent');
  for(const status of [400,401,403,404,409,422])expect(classifyCommandFailure(new HttpErrorResponse({status}),true).outcome).toBe('rejected');
  for(const status of [0,408,499,500,502])expect(classifyCommandFailure(new HttpErrorResponse({status}),true).outcome).toBe('uncertain');
  expect(classifyCommandFailure(Error('malformed successful response'),true).outcome).toBe('uncertain');
 });
 it('maps only identified owned fields and never exposes unknown or oversized server details',()=>{
  const error=new HttpErrorResponse({status:400,error:{errors:{NameAr:['Name required'],NameEn:['x'.repeat(501)],Unknown:['internal detail']}}});
  expect(classifyCommandFailure(error,true,['nameAr','nameEn']).fieldErrors).toEqual({nameAr:'Name required'});
  expect(classifyCommandFailure(new HttpErrorResponse({status:500,error:error.error}),true,['nameAr']).fieldErrors).toEqual({});
 });
});
