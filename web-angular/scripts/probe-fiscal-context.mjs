// Existing API readiness proof, not an Angular fiscal-year UI acceptance.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';
const origin='https://localhost:4210',api='https://localhost:7037';
const output=path.resolve(import.meta.dirname,'../../.codex-tmp/angular-fiscal-context');fs.mkdirSync(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome'});
const context=await browser.newContext({ignoreHTTPSErrors:true});let cleanup;
try{
  await context.addCookies([{name:'i18next',value:'en',url:origin}]);const page=await context.newPage();await page.goto(origin+'/login');
  await page.locator('.demo-admin button').click();await expect(page).toHaveURL(origin+'/apps',{timeout:30_000});
  const result=await page.evaluate(async api=>{
    const call=async(method='GET',body)=>{
      const token=method==='GET'?null:(await(await fetch(api+'/api/v1/browser-auth/csrf',{credentials:'include'})).json()).requestToken;
      const response=await fetch(api+'/api/v1/fiscal-years/context',{method,credentials:'include',signal:AbortSignal.timeout(15_000),
        ...(body!==undefined?{headers:{'Content-Type':'application/json','X-ERP-XSRF':token},body:JSON.stringify(body)}:{})});
      return {status:response.status,body:response.ok?await response.json():null};
    };
    const first=await call();if(first.status!==200)return {readStatus:first.status,mutationAttempted:false};
    const initial=first.body;const original=initial.hasUserOverride?initial.selectedFiscalYear?.id??null:null;
    const different=initial.availableFiscalYears.find(year=>year.id!==initial.selectedFiscalYear?.id);
    let changed=false,restored=false;
    if(different){
      try{
        const update=await call('PUT',{fiscalYearId:different.id});
        if(update.status!==200||update.body.selectedFiscalYear?.id!==different.id)throw Error('candidate not accepted');
        const reread=await call();if(reread.status!==200||reread.body.selectedFiscalYear?.id!==different.id)throw Error('selection did not persist');changed=true;
      }finally{
        const restore=await call('PUT',{fiscalYearId:original});const verified=await call();
        restored=restore.status===200&&verified.status===200&&verified.body.selectedFiscalYear?.id===initial.selectedFiscalYear?.id&&verified.body.hasUserOverride===initial.hasUserOverride;
        if(!restored)throw Error('original personal context restoration failed');
      }
    }
    const denied=await call('PUT',{fiscalYearId:2147483647});const retained=await call();
    if(denied.status===200||retained.status!==200||retained.body.selectedFiscalYear?.id!==initial.selectedFiscalYear?.id||retained.body.hasUserOverride!==initial.hasUserOverride)throw Error('unknown year did not preserve context');
    return {readStatus:first.status,availableCount:initial.availableFiscalYears.length,hasCurrent:initial.companyCurrentFiscalYear!==null,hasSelection:initial.selectedFiscalYear!==null,
      mutationAttempted:!!different,selectionPersisted:changed,originalPreferenceRestored:restored,unknownCandidateRejected:denied.status,contextRetainedAfterDenial:true};
  },api);
  cleanup=async()=>page.evaluate(async api=>{const csrf=await(await fetch(api+'/api/v1/browser-auth/csrf',{credentials:'include'})).json();return(await fetch(api+'/api/v1/browser-auth/logout',{method:'POST',credentials:'include',headers:{'X-ERP-XSRF':csrf.requestToken}})).status;},api);
  assert.equal(result.readStatus,200,'demo context read must be permitted');assert.ok(result.unknownCandidateRejected>=400);
  assert.equal(await cleanup(),204,'real logout');cleanup=null;
  fs.writeFileSync(path.join(output,'api-preflight.json'),JSON.stringify({evidence:'Existing local API and SQL; readiness only, no Angular year control',...result},null,2));
  console.log(JSON.stringify(result));
}finally{if(cleanup)await cleanup().catch(()=>{});await context.close();await browser.close();}
