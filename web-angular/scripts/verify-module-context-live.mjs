// Read/navigation smoke only. Uses the existing demo sign-in action and logs out its isolated session.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium,expect} from '@playwright/test';
import {readApiEnvironment,resolveApiOrigin} from './configure-api.mjs';
const origin=process.env.ANGULAR_PREVIEW_ORIGIN??'https://localhost:4210';
const api=process.env.ANGULAR_API_ORIGIN??resolveApiOrigin(readApiEnvironment()).origin;
const browser=await chromium.launch({channel:'chrome'}),context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
const page=await context.newPage(),statuses=[];let authenticated=false,loggedOut=false;
const control=()=>page.locator('erp-module-context [role=combobox]');
page.on('response',response=>{const url=new URL(response.url());if(url.origin===api&&(url.pathname.includes('browser-auth')||url.pathname.endsWith('/modules/accessible')))statuses.push({path:url.pathname,status:response.status()});});
async function post(action){return page.evaluate(async({api,action})=>{
 const base=api+'/api/v1/browser-auth';const csrf=await fetch(base+'/csrf',{credentials:'include'});
 if(!csrf.ok)return csrf.status;const token=(await csrf.json()).requestToken;
 return(await fetch(base+'/'+action,{method:'POST',credentials:'include',headers:{'X-ERP-XSRF':token}})).status;
},{api,action});}
try{
 await context.addCookies([{name:'i18next',value:'en',url:origin}]);await page.goto(origin+'/login');await page.locator('.demo-admin button').click();
 await expect(page).toHaveURL(origin+'/apps',{timeout:30000});authenticated=true;
 await expect(control()).toBeVisible();await expect(page.locator('.launcher-tile').first()).toBeVisible();
 const reads=()=>statuses.filter(result=>result.path.endsWith('/modules/accessible'));
 assert.equal(reads().length,1,'header/page share the initial real catalog read');assert.equal(reads()[0].status,200);
 const destination=await page.locator('.launcher-tile').first().getAttribute('href');assert.ok(destination?.startsWith('/apps/'));
 await control().click();await page.getByRole('option').nth(1).click();await expect(page).toHaveURL(origin+destination);
 await control().click();await page.getByRole('option').first().click();await expect(page).toHaveURL(origin+'/apps');assert.equal(reads().length,1,'navigation reuses the fresh catalog');
 await page.reload();await expect(control()).toBeVisible();await expect(page.locator('.launcher-tile').first()).toBeVisible();assert.equal(reads().length,2,'one real read on reload');
 assert.equal(await post('refresh'),200,'actual hosted refresh');await page.reload();await expect(control()).toBeVisible();await expect(page.locator('.launcher-tile').first()).toBeVisible();
 assert.equal(await post('logout'),204,'actual hosted cleanup logout');loggedOut=true;
 const report={frontend:origin,api,normalTlsValidation:true,actualApi:true,serverCatalog:true,sharedInitialRead:true,moduleAndOverview:true,reload:true,refresh:200,logout:204,statuses};
 const output=path.resolve(import.meta.dirname,'../../documentation/modules/platform/features/angular-module-context-navigation/verification');fs.mkdirSync(output,{recursive:true});
 fs.writeFileSync(path.join(output,'live-results.json'),JSON.stringify(report,null,2)+'\n');console.log('Actual Angular/API catalog, header navigation, reload, refresh and logout passed.');
}finally{try{if(authenticated&&!loggedOut)await post('logout');}finally{await context.close();await browser.close();}}
