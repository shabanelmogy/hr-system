import { fiscalContextFixture as fixture } from '../fiscal-context.fixture';
import { parseFiscalContext } from './fiscal-context';
describe('Accounting working-year wire contract',()=>{
 it('accepts actual current/default, personal Draft choice and empty context without adding lifecycle policy',()=>{
  expect(parseFiscalContext(fixture)).toEqual(fixture);
  expect(parseFiscalContext({...fixture,selectedFiscalYear:fixture.availableFiscalYears[1],hasUserOverride:true}).selectedFiscalYear?.status).toBe(1);
  expect(parseFiscalContext({companyCurrentFiscalYear:null,selectedFiscalYear:null,hasUserOverride:false,availableFiscalYears:[]})).toBeTruthy();
 });
 it('rejects invalid dates/status, duplicate identity, unlisted selection and conflicting default/override',()=>{
  for(const value of [{...fixture,availableFiscalYears:[...fixture.availableFiscalYears,fixture.availableFiscalYears[0]]},{...fixture,hasUserOverride:true},{...fixture,selectedFiscalYear:{...fixture.selectedFiscalYear,id:9}}, {...fixture,companyCurrentFiscalYear:null}, {...fixture,availableFiscalYears:[{...fixture.availableFiscalYears[0],startDate:'2026-02-30'}]}, {...fixture,availableFiscalYears:[{...fixture.availableFiscalYears[0],status:6}]}])expect(()=>parseFiscalContext(value)).toThrow();
 });
});
