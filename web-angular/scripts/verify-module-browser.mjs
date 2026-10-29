import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';
import { sessionFixture } from '../src/app/platform/auth/auth.fixture.ts';

const root=path.resolve(import.meta.dirname,'..');
const origin=process.env.ANGULAR_PREVIEW_ORIGIN??'https://localhost:4210';
const output=path.join(root,'../.codex-tmp/angular-modules');fs.mkdirSync(output,{recursive:true});
const core=JSON.parse(fs.readFileSync(path.join(root,'src/locales/generated/core.json'),'utf8'));
const version=fs.readFileSync(path.join(root,'src/app/platform/localization/catalog.generated.ts'),'utf8').match(/[a-f0-9]{64}/)[0];
const fixture=[
  {code:'reference-data',name:'ReferenceData',isDefault:true,submodules:[{code:'addresses',name:'Addresses',entryPath:'https://untrusted.example',requiredPermissions:[]}]},
  {code:'hr',name:'HR',isDefault:true,submodules:[{code:'basic-data',name:'Basic data',entryPath:'/unported-business',requiredPermissions:['ViewEmployees']}]},
  {code:'acc',name:'Accounting',isDefault:false,submodules:[{code:'ledger-setup',name:'Ledger setup',entryPath:null,requiredPermissions:[]}]},
  {code:'crm',name:'CRM',isDefault:false,submodules:[{code:'appointments',name:'Appointments',entryPath:null,requiredPermissions:[]}]},
  {code:'reporting',name:'Reporting',isDefault:false,submodules:[{code:'analytics',name:'Analytics',entryPath:null,requiredPermissions:[]}]},
  {code:'unknown-module',name:'Unknown must stay hidden',isDefault:false,submodules:[]},
];
const browser=await chromium.launch({channel:'chrome'}),results=[],errors=[];
const text=(language,key)=>core[language][key];
async function context(language='en',width=1440,mode='light'){
  const c=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width,height:1000},reducedMotion:'reduce'});
  await c.addCookies(Object.entries({i18next:language,currentMode:mode,themePalette:'green'}).map(([name,value])=>({name,value,url:origin})));
  return c;
}
async function configure(c,state){
  await c.route('https://localhost:7037/api/**',async route=>{
    const request=route.request(),pathname=new URL(request.url()).pathname;let status=200,body;
    if(pathname.endsWith('/csrf'))body={requestToken:'synthetic-csrf'};
    else if(pathname.endsWith('/session')||pathname.endsWith('/refresh'))body={isAuthenticated:true,user:{...sessionFixture,roles:state.role==='super_admin'?['super_admin']:sessionFixture.roles}};
    else if(pathname.endsWith('/modules/accessible')){
      state.requests++;assert.equal(request.headers()['authorization'],undefined);
      if(state.action==='delay')await new Promise(resolve=>state.release=resolve);
      status=state.action==='error'?503:state.action==='forbidden'?403:200;
      body=state.action==='empty'?[]:state.action==='malformed'?{}:fixture;
    }else if(pathname.endsWith('/runtime'))body={tenantId:sessionFixture.tenantId,companyId:sessionFixture.companyId,defaultLanguage:'en',catalogVersion:version,revision:1,overrides:[]};
    else throw new Error('Unexpected module API: '+pathname);
    await route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)}).catch(()=>{});
  });
}
try{
  if(!process.argv.includes('--live-only')){
  for(const language of ['en','ar'])for(const mode of ['light','dark'])for(const width of [390,1440]){
    const c=await context(language,width,mode),state={action:'ready',requests:0};await configure(c,state);
    const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(origin+'/apps');
    await expect(p.getByRole('heading',{name:text(language,'modules.title'),exact:true})).toBeVisible();await expect(p.locator('.launcher-tile')).toHaveCount(5);
    await expect(p.locator('.workspace-sidebar')).toHaveCount(0);await expect(p.locator('.drawer-toggle')).toHaveCount(0);
    await p.evaluate(()=>document.fonts.ready);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    const card=await p.locator('.launcher-tile').first().boundingBox();assert.equal(Math.round(card.height),width<600?188:206);
    assert.ok(card.width>=168&&card.width<=196);
    assert.equal(await p.locator('a[href^="https://untrusted"]').count(),0);await p.screenshot({path:path.join(output,`launcher-${language}-${mode}-${width}.png`),fullPage:true});
    await p.locator('.launcher-tile[href="/apps/hr"]').click();await expect(p).toHaveURL(origin+'/apps/hr');await expect(p.locator('.launcher-tile')).toHaveCount(1);
    await p.locator('.launcher-tile').click();await expect(p).toHaveURL(origin+'/apps/hr/basic-data');await expect(p.locator('main')).toContainText(text(language,'modules.noAvailableFeatures'));
    assert.equal(await p.locator('a[href="/unported-business"]').count(),0);await p.reload();await expect(p.locator('main')).toContainText(text(language,'modules.noAvailableFeatures'));
    await p.locator('.browser-navigation button').click();await expect(p).toHaveURL(origin+'/apps/hr');await p.locator('.browser-navigation button').click();await expect(p).toHaveURL(origin+'/apps');
    await p.goto(origin+'/apps/hr/denied-area');await expect(p.getByRole('heading',{name:text(language,'authorization.forbidden.title'),exact:true})).toBeVisible();await expect(p.locator('.launcher-tile')).toHaveCount(0);
    await p.goto(origin+'/apps/unknown-module');await expect(p.getByRole('heading',{name:text(language,'authorization.forbidden.title'),exact:true})).toBeVisible();
    assert.equal(await p.evaluate(()=>localStorage.length+sessionStorage.length),0);results.push({kind:'navigation',language,mode,width,card,passed:true});await c.close();
  }
  for(const action of ['empty','error','forbidden','malformed','delay','global-role']){
    const c=await context(),state={action,role:action==='global-role'?'super_admin':'user',requests:0};await configure(c,state);const p=await c.newPage();await p.goto(origin+'/apps');
    if(action==='empty')await expect(p.getByRole('heading',{name:text('en','modules.empty'),exact:true})).toBeVisible();
    else if(action==='forbidden'||action==='global-role'){
      await expect(p.getByRole('heading',{name:text('en','authorization.forbidden.title'),exact:true})).toBeVisible();
      if(action==='global-role')assert.equal(state.requests,0);
    }
    else if(action==='delay'){
      await expect(p.getByRole('status',{name:text('en','common.loading'),exact:true})).toBeVisible();
      await expect.poll(()=>state.requests).toBe(1);await p.goto(origin+'/forgetPassword');await expect(p.locator('input[type=email]')).toBeVisible();state.release();await expect(p.locator('.launcher-tile')).toHaveCount(0);
    }else{
      await expect(p.getByRole('heading',{name:text('en','common.error'),exact:true})).toBeVisible();state.action='ready';
      await p.getByRole('button',{name:text('en','actions.retry'),exact:true}).click();await expect(p.locator('.launcher-tile')).toHaveCount(5);assert.equal(state.requests,2);
    }
    results.push({kind:'state',action,passed:true});await c.close();
  }
  }
  if(process.argv.includes('--live')){
    const c=await context(),p=await c.newPage();const statuses=[];let companyCount;
    p.on('response',r=>{if(new URL(r.url()).pathname.endsWith('/modules/accessible'))statuses.push(r.status());});
    await p.goto(origin+'/login');await p.locator('.demo-admin button').click();await expect(p).toHaveURL(origin+'/apps',{timeout:30_000});
    await expect(p.locator('.launcher-tile').first()).toBeVisible();await expect(p.locator('.workspace-topbar')).toBeVisible();assert.ok(statuses.includes(200));
    const session=await c.request.get('https://localhost:7037/api/v1/browser-auth/session',{headers:{Origin:origin}});assert.equal(session.status(),200);companyCount=(await session.json()).user.companies.length;
    await expect(p.locator('.context-group > erp-option-select')).toHaveCount(companyCount>1?1:0);
    const count=await p.locator('.launcher-tile').count();await p.locator('.launcher-tile').first().click();await expect(p.locator('.launcher-tile').first()).toBeVisible();
    await p.reload();await expect(p.locator('.launcher-tile').first()).toBeVisible();await p.screenshot({path:path.join(output,'live-api-module-overview.png'),fullPage:true});
    await p.locator('.workspace-actions erp-popover-panel>erp-button button').click();await p.getByRole('dialog',{name:text('en','menu.settings'),exact:true}).getByRole('button',{name:new RegExp('^'+text('en','auth.logout'))}).click();await expect(p).toHaveURL(origin+'/login');
    results.push({kind:'live-api-sql',count,companyCount,statuses,passed:true});await c.close();
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,process.argv.includes('--live-only')?'live-results.json':origin.endsWith(':4220')?'production-results.json':'results.json'),JSON.stringify(results,null,2));console.log(`Module navigation passed: ${results.length} scenarios; live API=${process.argv.includes('--live')}.`);
}finally{await browser.close();}
