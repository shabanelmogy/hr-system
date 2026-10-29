// Actual local Angular + existing API/SQL. Always restores the original personal preference.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium,expect} from '@playwright/test';
import {parseFiscalContext} from '../src/app/modules/accounting/fiscal-year-context/types/fiscal-context.ts';
const origin='https://localhost:4210',api='https://localhost:7037';
const out=path.resolve(import.meta.dirname,'../../.codex-tmp/angular-fiscal-context');fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome'}),context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:1440,height:900},reducedMotion:'reduce'});
let original,changed=false,loggedOut=false;
async function read(){const response=await context.request.get(api+'/api/v1/fiscal-years/context',{headers:{Origin:origin}});assert.equal(response.status(),200,'real context read');return parseFiscalContext(await response.json());}
async function post(action,method='POST',body){const csrf=await context.request.get(api+'/api/v1/browser-auth/csrf',{headers:{Origin:origin}});assert.equal(csrf.status(),200);const requestToken=(await csrf.json()).requestToken;return context.request.fetch(api+action,{method,headers:{Origin:origin,'X-ERP-XSRF':requestToken},...(body!==undefined?{data:body}:{})});}
try{
 await context.addCookies([{name:'i18next',value:'en',url:origin}]);const page=await context.newPage();await page.goto(origin+'/login');await page.locator('.demo-admin button').click();await expect(page).toHaveURL(origin+'/apps',{timeout:30_000});
 original=await read();const targetIndex=original.availableFiscalYears.findIndex(y=>y.id!==original.selectedFiscalYear?.id);assert.ok(targetIndex>=0,'existing second year is required; never create production test years');const target=original.availableFiscalYears[targetIndex];
 const control=p=>p.locator('erp-fiscal-context [role=combobox]');await expect(control(page)).toBeVisible();
 const other=await context.newPage();await other.goto(origin+'/apps');await expect(control(other)).toBeVisible();
 await control(page).click();changed=true;await page.getByRole('option').nth(targetIndex).click();
 await expect(control(page)).toContainText(target.nameEn.trim()||target.nameAr.trim()||target.code);await expect(control(other)).toContainText(target.nameEn.trim()||target.nameAr.trim()||target.code);
 assert.equal((await read()).selectedFiscalYear?.id,target.id,'SQL persistence');await page.reload();await expect(control(page)).toContainText(target.nameEn.trim()||target.nameAr.trim()||target.code);
 await page.screenshot({path:path.join(out,'live-working-year.png'),fullPage:true});
 const restored=await post('/api/v1/fiscal-years/context','PUT',{fiscalYearId:original.hasUserOverride?original.selectedFiscalYear?.id??null:null});assert.equal(restored.status(),200,'restore original preference');
 const current=await read();assert.equal(current.selectedFiscalYear?.id,original.selectedFiscalYear?.id);assert.equal(current.hasUserOverride,original.hasUserOverride);changed=false;
 assert.equal((await post('/api/v1/browser-auth/logout')).status(),204,'real logout');loggedOut=true;
 fs.writeFileSync(path.join(out,'live-ui-results.json'),JSON.stringify({actualAngular:true,actualApiSql:true,availableCount:original.availableFiscalYears.length,uiSelectionPersisted:true,crossTab:true,reload:true,originalPreferenceRestored:true,logout:204},null,2));console.log('Actual Angular fiscal-year UI / SQL / two-tab / reload passed; original preference restored.');
}finally{
 try{if(changed&&original){const restored=await post('/api/v1/fiscal-years/context','PUT',{fiscalYearId:original.hasUserOverride?original.selectedFiscalYear?.id??null:null});assert.equal(restored.status(),200,'mandatory preference cleanup');}}
 finally{if(!loggedOut)await post('/api/v1/browser-auth/logout').catch(()=>{});await context.close();await browser.close();}
}
