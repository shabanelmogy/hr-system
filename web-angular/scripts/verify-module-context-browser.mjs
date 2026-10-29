import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';
import { sessionFixture } from '../src/app/platform/auth/auth.fixture.ts';
import { fiscalContextFixture } from '../src/app/modules/accounting/fiscal-year-context/fiscal-context.fixture.ts';

const root=path.resolve(import.meta.dirname,'..'),origin=process.env.ANGULAR_PREVIEW_ORIGIN??'https://localhost:4220';
const api=process.env.ANGULAR_API_ORIGIN??'https://localhost:7037';
const output=path.join(root,'../.codex-tmp/angular-module-context');fs.mkdirSync(output,{recursive:true});
const core=JSON.parse(fs.readFileSync(path.join(root,'src/locales/generated/core.json'),'utf8'));
const version=fs.readFileSync(path.join(root,'src/app/platform/localization/catalog.generated.ts'),'utf8').match(/[a-f0-9]{64}/)[0];
const catalog=[
 {code:'reference-data',name:'ReferenceData',isDefault:true,submodules:[{code:'addresses',name:'Addresses',entryPath:'https://untrusted.invalid',requiredPermissions:[]}]},
 {code:'hr',name:'HR',isDefault:true,submodules:[{code:'basic-data',name:'Basic',entryPath:null,requiredPermissions:[]}]},
 {code:'acc',name:'Accounting',isDefault:false,submodules:[{code:'ledger-setup',name:'Ledger',entryPath:null,requiredPermissions:[]}]},
];
const browser=await chromium.launch({channel:'chrome'}),results=[],errors=[];
const control=p=>p.locator('erp-module-context [role=combobox]');
async function setup({language='en',mode='light',width=1440,action='ready',fiscal=false}={}){
 const c=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width,height:900},reducedMotion:'reduce'});
 await c.addCookies(Object.entries({i18next:language,currentMode:mode}).map(([name,value])=>({name,value,url:origin})));
 const state={action,reads:0,company:1};
 await c.route(api+'/api/**',async route=>{
  const request=route.request(),pathname=new URL(request.url()).pathname;let status=200,body;
  const identity=()=>({...sessionFixture,companyId:state.company,permissions:fiscal?['FiscalYears:View']:[],roles:state.action==='global'?['super_admin']:sessionFixture.roles,tenantId:state.action==='no-tenant'?'':sessionFixture.tenantId,
   companies:[{id:1,companyCode:'ONE',nameAr:'الأولى',nameEn:'First'},{id:2,companyCode:'TWO',nameAr:'الثانية',nameEn:'Second'}]});
  if(pathname.endsWith('/csrf'))body={requestToken:'synthetic-csrf'};
  else if(pathname.endsWith('/session')||pathname.endsWith('/refresh'))body={isAuthenticated:true,user:identity()};
  else if(pathname.endsWith('/switch-company')){
   assert.equal(request.headers()['x-erp-xsrf'],'synthetic-csrf');state.company=request.postDataJSON().companyId;
   if(state.action==='company-delay')await new Promise(resolve=>state.releaseCompany=resolve);
   body={isAuthenticated:true,user:identity()};
  }else if(pathname.endsWith('/modules/accessible')){
   state.reads++;assert.equal(request.headers()['authorization'],undefined);
   const action=state.action,company=state.company;
   if(action==='delay')await new Promise(resolve=>state.release=resolve);
   status=action==='error'?503:action==='forbidden'?403:200;
   body=action==='malformed'?{}:action==='empty'?[]:company===2?[catalog[2]]:catalog;
  }else if(pathname.endsWith('/runtime'))body={tenantId:sessionFixture.tenantId,companyId:state.company,defaultLanguage:'en',catalogVersion:version,revision:1,overrides:[]};
  else if(pathname.endsWith('/fiscal-years/context'))body=fiscalContextFixture;
  else if(pathname.endsWith('/logout'))status=204;
  else throw Error('Unexpected fixture request '+pathname);
  await route.fulfill({status,contentType:'application/json',...(status!==204?{body:JSON.stringify(body)}:{})}).catch(()=>{});
 });
 const p=await c.newPage();p.on('pageerror',error=>errors.push(error.message));await p.goto(origin+'/apps');
 return{c,p,state};
}
try{
 for(const language of ['en','ar'])for(const mode of ['light','dark'])for(const width of [390,1440]){
  const{c,p,state}=await setup({language,mode,width});await expect(p.locator('.launcher-tile')).toHaveCount(3);await expect(control(p)).toBeVisible();
  for(const value of await p.locator('.context-group .context-value').all()){
   if(width<1200)await expect(value).toBeHidden();else{await expect(value).toBeVisible();assert.equal(await value.evaluate(e=>e.scrollWidth<=e.clientWidth+1),true,'desktop context text must be complete');}
  }
  assert.equal(await p.locator('.context-group [title]').count(),0,'context help uses PrimeNG Tooltip');
  await p.locator('.context-group .context-badge').first().hover();await expect(p.getByRole('tooltip')).toContainText(core[language]['modules.overview']);await p.mouse.move(0,0);await expect(p.getByRole('tooltip')).toHaveCount(0);
  await expect(control(p)).toHaveAccessibleName(core[language]['modules.currentApplication']+': '+core[language]['modules.overview']);assert.equal(state.reads,1);
  await control(p).click();await expect(p.getByRole('option')).toHaveCount(4);await p.getByRole('option').nth(2).click();await expect(p).toHaveURL(origin+'/apps/hr');await expect(control(p)).toContainText(core[language]['modules.hr']);assert.equal(state.reads,1);
  await control(p).click();await p.getByRole('option').nth(3).click();await expect(p).toHaveURL(origin+'/apps/acc');await p.locator('.launcher-tile').click();await expect(p).toHaveURL(origin+'/apps/acc/ledger-setup');await expect(control(p)).toContainText(core[language]['modules.acc']);assert.equal(state.reads,1);
  await p.goBack();await expect(p).toHaveURL(origin+'/apps/acc');await p.goBack();await expect(p).toHaveURL(origin+'/apps/hr');await expect(control(p)).toContainText(core[language]['modules.hr']);
  await expect(control(p)).not.toHaveAttribute('aria-disabled','true');await control(p).press('Space');await expect(p.getByRole('listbox')).toBeVisible();await control(p).press('Home');await expect(p.getByRole('option').first()).toHaveAttribute('data-p-focused','true');await control(p).press('Enter');await expect(p).toHaveURL(origin+'/apps');await expect(control(p)).toContainText(core[language]['modules.overview']);
  await expect(p.getByRole('listbox')).toBeHidden();await expect(control(p)).toBeFocused();
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);assert.equal(await p.locator('a[href^="https://untrusted"]').count(),0);
  await p.screenshot({path:path.join(output,`context-${language}-${mode}-${width}.png`),fullPage:true});await p.reload();await expect(control(p)).toBeVisible();await expect(p.locator('.launcher-tile')).toHaveCount(3);assert.equal(state.reads,2);
  results.push({kind:'navigation',language,mode,width,singleCatalogPerLoad:true,passed:true});await c.close();
 }
 for(const action of ['empty','error','malformed','forbidden','global','no-tenant','delay']){
  const{c,p,state}=await setup({action});
  if(action==='global'||action==='no-tenant'){await expect(p.getByRole('heading',{name:core.en['authorization.forbidden.title'],exact:true})).toBeVisible();await expect(p.locator('erp-module-context erp-option-select')).toHaveCount(0);assert.equal(state.reads,0);}
  else if(action==='empty'){await expect(p.getByRole('heading',{name:core.en['modules.empty'],exact:true})).toBeVisible();await control(p).click();await expect(p.getByRole('option')).toHaveCount(1);await p.keyboard.press('Escape');}
  else if(action==='delay'){
   await expect(control(p)).toHaveAttribute('aria-disabled','true');await expect.poll(()=>state.reads).toBe(1);
   await p.goto(origin+'/forgetPassword');state.release();await expect(p.locator('input[type=email]')).toBeVisible();await expect(p.locator('erp-module-context')).toHaveCount(0);
  }else{
   await expect(control(p)).toHaveAttribute('aria-disabled','true');
   if(action==='forbidden'){await expect(p.locator('erp-module-context erp-button')).toHaveCount(0);}
   else{state.action='ready';await p.locator('erp-module-context').getByRole('button',{name:core.en['actions.retry'],exact:true}).click();await expect(p.locator('.launcher-tile')).toHaveCount(3);assert.equal(state.reads,2);}
  }
  results.push({kind:'state',action,passed:true});await c.close();
 }
 {
  const{c,p,state}=await setup();await expect(p.locator('.launcher-tile')).toHaveCount(3);
  await p.goto(origin+'/apps/unknown');await expect(p.getByRole('heading',{name:core.en['authorization.forbidden.title'],exact:true})).toBeVisible();await expect(control(p)).toHaveAccessibleName(core.en['modules.currentApplication']+': '+core.en['authorization.forbidden.title']);
  await control(p).click();await p.getByRole('option').first().click();await expect(p).toHaveURL(origin+'/apps');
  state.action='company-delay';const company=p.locator('.context-group > erp-option-select [role=combobox]');await company.click();await p.getByRole('option').nth(1).click();
  await expect(control(p)).toHaveAttribute('aria-disabled','true');await expect(control(p)).not.toContainText(core.en['modules.overview']);state.releaseCompany();
  await expect(p.locator('.launcher-tile')).toHaveCount(1);await expect(control(p)).toContainText(core.en['modules.overview']);await control(p).click();await expect(p.getByRole('option')).toHaveCount(2);await p.getByRole('option').last().click();await expect(p).toHaveURL(origin+'/apps/acc');
  results.push({kind:'unknown-route-company-transition',reads:state.reads,passed:true});await c.close();
 }
 for(const language of ['en','ar'])for(const width of [390,1440]){
  const{c,p}=await setup({language,width,fiscal:true});await expect(p.locator('erp-fiscal-context [role=combobox]')).toBeVisible();await expect(control(p)).toBeVisible();
  const boxes=await p.locator('.context-group > erp-module-context, .context-group > erp-context-badge, .context-group > erp-option-select, .context-group > erp-fiscal-context').evaluateAll(nodes=>nodes.map(node=>{const box=node.getBoundingClientRect();return {left:box.left,right:box.right};}));
  const ordered=[...boxes].sort((a,b)=>a.left-b.left);assert.equal(ordered.length,4);for(let i=1;i<ordered.length;i++)assert.ok(ordered[i].left>=ordered[i-1].right-1,'context controls must not overlap');
  for(const value of await p.locator('.context-group .context-value').all()){if(width===1440){await expect(value).toBeVisible();assert.equal(await value.evaluate(e=>e.scrollWidth<=e.clientWidth+1),true);}else await expect(value).toBeHidden();}
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await p.screenshot({path:path.join(output,`all-contexts-${language}-${width}.png`),fullPage:true});results.push({kind:'four-contexts-responsive',language,width,passed:true});await c.close();
 }
 for(const language of ['en','ar'])for(const width of [390,1440]){
  const{c,p}=await setup({language,width,mode:language==='ar'?'dark':'light'});await expect(p.locator('.launcher-tile')).toHaveCount(3);
  await p.setViewportSize({width,height:320});
  const viewport=p.locator('.workspace-scroll p-scrollarea-viewport'),track=p.locator('.workspace-scroll p-scrollarea-scrollbar'),handle=track.locator('p-scrollarea-handle');
  await expect.poll(()=>viewport.evaluate(e=>e.scrollHeight>e.clientHeight)).toBe(true);await expect(track).toBeVisible();await expect(viewport).toHaveAttribute('tabindex','0');
  const appearance=await handle.evaluate(e=>({radius:getComputedStyle(e).borderRadius,color:getComputedStyle(e).backgroundColor,width:e.getBoundingClientRect().width}));
  assert.equal(appearance.radius,'999px');assert.ok(appearance.width>0&&appearance.width<=10);assert.notEqual(appearance.color,'rgba(0, 0, 0, 0)');
  const bounds=await track.boundingBox(),area=await viewport.boundingBox();assert.ok(language==='ar'?bounds.x<area.x+12:bounds.x>area.x+area.width-16,'scrollbar follows RTL');
  await viewport.hover();await p.mouse.wheel(0,220);await expect.poll(()=>viewport.evaluate(e=>e.scrollTop)).toBeGreaterThan(0);
  await viewport.focus();await p.keyboard.press('Home');await expect.poll(()=>viewport.evaluate(e=>e.scrollTop)).toBe(0);await p.keyboard.press('PageDown');await expect.poll(()=>viewport.evaluate(e=>e.scrollTop)).toBeGreaterThan(0);
  await p.keyboard.press('Home');await expect.poll(()=>viewport.evaluate(e=>e.scrollTop)).toBe(0);const thumb=await handle.boundingBox();await p.mouse.move(thumb.x+thumb.width/2,thumb.y+thumb.height/2);await p.mouse.down();await p.mouse.move(thumb.x+thumb.width/2,thumb.y+thumb.height/2+50,{steps:5});await p.mouse.up();await expect.poll(()=>viewport.evaluate(e=>e.scrollTop)).toBeGreaterThan(0);
  await control(p).click();await expect(p.getByRole('option')).toHaveCount(4);await expect(p.locator('.erp-select-overlay .option-icon')).toHaveCount(4);await expect(p.locator('.select-menu-heading')).toHaveText(core[language]['modules.switchApplication']);
  assert.equal(await p.locator('select').count(),0);await p.screenshot({path:path.join(output,`scroll-menu-${language}-${width}.png`),fullPage:true});await p.keyboard.press('Escape');
  await p.setViewportSize({width,height:1200});await expect.poll(()=>viewport.evaluate(e=>e.scrollHeight<=e.clientHeight)).toBe(true);await expect(track).toBeHidden();
  results.push({kind:'prime-scroll-and-menu',language,width,wheel:true,keyboard:true,drag:true,resize:true,appearance,passed:true});await c.close();
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'production-results.json'),JSON.stringify(results,null,2));console.log(`Application context production browser passed ${results.length} scenarios.`);
}finally{await browser.close();}
