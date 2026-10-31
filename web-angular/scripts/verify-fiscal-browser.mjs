import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium,expect} from '@playwright/test';
import {sessionFixture} from '../src/app/platform/auth/auth.fixture.ts';
import {fiscalContextFixture as fixture} from '../src/app/modules/accounting/fiscal-year-context/fiscal-context.fixture.ts';
const root=path.resolve(import.meta.dirname,'..'),origin=process.env.ANGULAR_PREVIEW_ORIGIN??'https://localhost:4220',output=path.join(root,'../.codex-tmp/angular-fiscal-context');fs.mkdirSync(output,{recursive:true});
const apiOrigin=process.env.ANGULAR_API_ORIGIN??'https://localhost:7037';
const captions=JSON.parse(fs.readFileSync(path.join(root,'src/locales/generated/accounting.json'),'utf8'));
const core=JSON.parse(fs.readFileSync(path.join(root,'src/locales/generated/core.json'),'utf8'));
const version=fs.readFileSync(path.join(root,'src/app/platform/localization/catalog.generated.ts'),'utf8').match(/[a-f0-9]{64}/)[0];
const browser=await chromium.launch({channel:'chrome'}),results=[],errors=[];
const pendingFixtureReleases=[];
async function configure(language='en',mode='light',width=1440,action='ready'){
 const c=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width,height:900},reducedMotion:'reduce'});await c.addCookies(Object.entries({i18next:language,currentMode:mode}).map(([name,value])=>({name,value,url:origin})));
 const state={selected:1,writes:0,reads:0,authenticated:true,action};
 await c.route(apiOrigin+'/api/**',async route=>{
  const req=route.request(),p=new URL(req.url()).pathname;let status=200,body;const context=()=>({...fixture,selectedFiscalYear:fixture.availableFiscalYears[state.selected-1],hasUserOverride:state.selected!==1});
  if(p.endsWith('/csrf'))body={requestToken:'synthetic'};
  else if(p.endsWith('/session')||p.endsWith('/refresh')){status=state.authenticated?200:401;body={isAuthenticated:true,user:{...sessionFixture,permissions:state.action==='denied-permission'?[]:['FiscalYears:View']}};}
  else if(p.endsWith('/logout')){state.authenticated=false;status=204;}
  else if(p.endsWith('/fiscal-years/context')){
   if(req.method()==='PUT'){
    state.writes++;assert.equal(req.headers()['x-erp-xsrf'],'synthetic');if(state.action==='delay')await new Promise(resolve=>{state.release=resolve;pendingFixtureReleases.push(resolve);});
    if(!['rejected','unverifiable'].includes(state.action))state.selected=req.postDataJSON().fiscalYearId;
    if(['rejected','lost-response','unverifiable'].includes(state.action))status=503;
   }else{state.reads++;if(state.action==='unverifiable')status=503;}
   body=state.action==='empty'?{companyCurrentFiscalYear:null,selectedFiscalYear:null,hasUserOverride:false,availableFiscalYears:[]}:state.action==='malformed'?{}:context();
  }else if(p.endsWith('/modules/accessible'))body=[{code:'hr',name:'HR',isDefault:true,submodules:[{code:'basic-data',name:'Basic data',entryPath:null,requiredPermissions:[]}]}];
  else if(p.endsWith('/runtime'))body={tenantId:sessionFixture.tenantId,companyId:1,catalogVersion:version,revision:1,defaultLanguage:'en',overrides:[]};
  else throw Error('Unexpected fiscal API '+p);
  await route.fulfill({status,contentType:'application/json',...(body?{body:JSON.stringify(body)}:{})}).catch(()=>{});
 });
 const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(origin+'/apps');await expect(p.locator('.launcher-tile')).toHaveCount(1);
 return{c,p,state};
}
const control=p=>p.locator('erp-fiscal-context [role=combobox]');
async function choose(p,language='en'){await control(p).click();await p.getByRole('option',{name:new RegExp(language==='ar'?'السنة 2027':'Year 2027')}).click();}
try{
 for(const language of ['en','ar'])for(const mode of ['light','dark'])for(const width of [390,1440]){
  const{c,p,state}=await configure(language,mode,width);await expect(control(p)).toContainText(language==='ar'?'السنة 2026':'Year 2026');state.action='delay';await choose(p,language);
  await expect.poll(()=>state.writes).toBe(1);await expect(control(p)).toContainText(language==='ar'?'السنة 2026':'Year 2026');await expect(p.locator('.scope-view')).toBeHidden();state.release();
  await expect(control(p)).toContainText(language==='ar'?'السنة 2027':'Year 2027');await expect(p.locator('.scope-view')).toBeVisible();assert.equal(state.writes,1);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await p.reload();await expect(control(p)).toContainText(language==='ar'?'السنة 2027':'Year 2027');await p.screenshot({path:path.join(output,`fiscal-${language}-${mode}-${width}.png`),fullPage:true});results.push({language,mode,width,passed:true});console.log(`Fiscal passed ${language}/${mode}/${width}`);await c.close();
 }
 for(const action of ['lost-response','rejected','unverifiable','empty','malformed','denied-permission']){
  console.log(`Fiscal checking ${action}`);
  const {c,p,state}=await configure('en','light',1440,['lost-response','rejected','unverifiable'].includes(action)?'ready':action);
  if(['lost-response','rejected','unverifiable'].includes(action)){
   await expect(control(p)).toContainText('Year 2026');state.action=action;await choose(p);
   if(action==='lost-response')await expect(control(p)).toContainText('Year 2027');
   else if(action==='unverifiable')await expect(p).toHaveURL(origin+'/login');
   else{await expect(p.getByRole('alert')).toContainText(captions.en['fiscalYears.context.switchError']);await expect(control(p)).toContainText('Year 2026');await p.getByRole('alert').getByRole('button',{name:core.en['actions.close'],exact:true}).click();await expect(p.getByRole('alert')).toHaveCount(0);}
   assert.equal(state.writes,1);
  }else if(action==='empty'){await expect(control(p)).toContainText(captions.en['fiscalYears.context.noSelection']);await expect(control(p)).toHaveAttribute('aria-disabled','true');}
  else if(action==='denied-permission'){await expect(control(p)).toHaveCount(0);assert.equal(state.reads,0);}
  else{await expect(p.getByRole('alert')).toContainText(captions.en['fiscalYears.context.loadError']);state.action='ready';await p.locator('erp-fiscal-context').getByRole('button',{name:core.en['actions.retry'],exact:true}).click();await expect(control(p)).toContainText('Year 2026');}
  results.push({action,passed:true});console.log(`Fiscal passed ${action}`);await c.close();
 }
 {const{c,p,state}=await configure(),other=await c.newPage();await other.goto(origin+'/apps');await expect(control(other)).toContainText('Year 2026');await choose(p);await expect(control(other)).toContainText('Year 2027');assert.equal(state.writes,1);results.push({action:'cross-tab',passed:true});await c.close();}
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'production-results.json'),JSON.stringify(results,null,2));console.log(`Fiscal context passed: ${results.length} production browser scenarios.`);
}finally{for(const release of pendingFixtureReleases)release();await browser.close();}
