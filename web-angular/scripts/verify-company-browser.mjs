import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';
import { sessionFixture } from '../src/app/platform/auth/auth.fixture.ts';

const root=path.resolve(import.meta.dirname,'..'),origin=process.env.ANGULAR_PREVIEW_ORIGIN??'https://localhost:4220';
const output=path.join(root,'../.codex-tmp/angular-company'); fs.mkdirSync(output,{recursive:true});
const core=JSON.parse(fs.readFileSync(path.join(root,'src/locales/generated/core.json'),'utf8'));
const auth=JSON.parse(fs.readFileSync(path.join(root,'src/locales/generated/platform-auth.json'),'utf8'));
const version=fs.readFileSync(path.join(root,'src/app/platform/localization/catalog.generated.ts'),'utf8').match(/[a-f0-9]{64}/)[0];
const companies=[{id:1,companyCode:'ONE',nameAr:'الشركة الأولى',nameEn:'First Company'},{id:2,companyCode:'TWO',nameAr:'الشركة الثانية',nameEn:'Second Company'}];
const catalog=[{code:'hr',name:'HR',isDefault:true,submodules:[{code:'basic-data',name:'Basic data',entryPath:null,requiredPermissions:[]}]}];
const browser=await chromium.launch({channel:'chrome'}),results=[],errors=[];
const title=id=>`Scoped Company ${id}`;
function user(state){const c=companies.find(c=>c.id===state.company);return {...sessionFixture,companyId:c.id,companyCode:c.companyCode,companyNameEn:c.nameEn,companyNameAr:c.nameAr,companies:state.single?companies.slice(0,1):companies,roles:[state.global?'super_admin':'user']};}
async function configure(language='en',mode='light',width=1440,options={}){
  const c=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width,height:900},reducedMotion:'reduce'});
  await c.addCookies(Object.entries({i18next:language,currentMode:mode}).map(([name,value])=>({name,value,url:origin})));
  const state={company:1,authenticated:true,mutations:0,sessionReads:0,catalogReads:0,action:'ready',...options};
  await c.route('https://localhost:7037/api/**',async route=>{
    const request=route.request(),p=new URL(request.url()).pathname;let status=200,body;
    assert.equal(request.headers().authorization,undefined);
    if(p.endsWith('/csrf'))body={requestToken:'synthetic'};
    else if(p.endsWith('/session')||p.endsWith('/refresh')){state.sessionReads++;status=!state.authenticated?401:state.action==='unverifiable'?503:200;body={isAuthenticated:true,user:user(state)};}
    else if(p.endsWith('/switch-company')){
      state.mutations++;assert.equal(request.headers()['x-erp-xsrf'],'synthetic');const target=request.postDataJSON().companyId;
      assert.ok(companies.some(c=>c.id===target));
      if(state.action==='delay')await new Promise(resolve=>state.release=resolve);
      if(['ready','delay','lost-response','locale-delay'].includes(state.action))state.company=target;
      status=['denied','lost-response','unverifiable'].includes(state.action)?503:200;body={isAuthenticated:true,user:user(state)};
    }else if(p.endsWith('/logout')){state.authenticated=false;status=204;}
    else if(p.endsWith('/modules/accessible')){state.catalogReads++;body=catalog;}
    else if(p.endsWith('/runtime')){
      if(state.action==='locale-delay'&&state.company===2)await new Promise(resolve=>state.localeRelease=resolve);
      body={tenantId:sessionFixture.tenantId,companyId:state.company,defaultLanguage:'en',catalogVersion:version,revision:state.company,
        overrides:['en','ar'].map(language=>({namespace:'core',language,key:'general.mainTitle',value:title(state.company)}))};
    }else throw Error('Unexpected company API '+p);
    await route.fulfill({status,contentType:'application/json',...(body?{body:JSON.stringify(body)}:{})}).catch(()=>{});
  });
  const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(origin+'/apps');
  await expect(p.locator('.launcher-tile')).toHaveCount(1);await expect(p.locator('.workspace-topbar')).toContainText(title(1));
  return {c,p,state};
}
const select=p=>p.locator('.context-group erp-option-select [role=combobox]');
async function choose(p){await select(p).click();await p.getByRole('option',{name:/TWO/}).click();}
async function committed(p,language='en'){
  await expect(select(p)).toContainText(language==='ar'?companies[1].nameAr:companies[1].nameEn);
  await expect(p.locator('.workspace-topbar')).toContainText(title(2));await expect(p.locator('.scope-view')).toBeVisible();await expect(p.locator('.launcher-tile')).toHaveCount(1);
}
try{
  for(const language of ['en','ar'])for(const mode of ['light','dark'])for(const width of [390,1440]){
    const {c,p,state}=await configure(language,mode,width);state.action='delay';
    if(language==='en'&&mode==='light'&&width===1440){await select(p).focus();await p.keyboard.press('Space');await p.keyboard.press('End');await p.keyboard.press('Enter');}
    else await choose(p);
    await expect.poll(()=>state.mutations).toBe(1);
    await expect(select(p)).toContainText(language==='ar'?companies[0].nameAr:companies[0].nameEn);
    await expect(select(p)).toHaveAttribute('aria-disabled','true');
    await expect(p.getByRole('status',{name:auth[language]['angularAuth.updatingContext'],exact:true})).toBeVisible();
    await expect(p.locator('.scope-view')).toBeHidden();await expect(p.locator('.workspace-topbar')).not.toContainText(title(1));
    state.release();await committed(p,language);assert.equal(state.mutations,1);assert.equal(state.catalogReads,2);
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    assert.equal(await p.evaluate(()=>localStorage.length+sessionStorage.length),0);
    await p.screenshot({path:path.join(output,`company-${language}-${mode}-${width}.png`),fullPage:true});
    await p.reload();await committed(p,language);results.push({kind:'transition',language,mode,width,passed:true});await c.close();
  }
  for(const action of ['denied','lost-response','unverifiable','locale-delay']){
    const {c,p,state}=await configure();state.action=action;await choose(p);
    if(action==='lost-response')await committed(p);
    else if(action==='unverifiable'){await expect(p).toHaveURL(origin+'/login');await expect(p.locator('.workspace-topbar')).toHaveCount(0);}
    else if(action==='denied'){
      await expect(p.getByRole('alert')).toContainText(auth.en['auth.companySwitchFailed']);await expect(select(p)).toContainText(companies[0].nameEn);
      await expect(p.locator('.scope-view')).toBeVisible();await expect(p.locator('.workspace-topbar')).toContainText(title(1));
      await p.getByRole('alert').getByRole('button',{name:core.en['actions.close'],exact:true}).click();await expect(p.getByRole('alert')).toHaveCount(0);
    }else{
      await expect.poll(()=>typeof state.localeRelease).toBe('function');await expect(p.locator('.scope-view')).toBeHidden();
      await expect(select(p)).toContainText(companies[0].nameEn);state.localeRelease();await committed(p);
    }
    assert.equal(state.mutations,1);results.push({kind:'outcome',action,passed:true});await c.close();
  }
  {
    const {c,p,state}=await configure(),second=await c.newPage();await second.goto(origin+'/apps');await expect(second.locator('.launcher-tile')).toHaveCount(1);
    await second.evaluate(()=>new BroadcastChannel('erp-browser-session-context').postMessage({kind:'session-changed',companyId:2,roles:['super_admin']}));
    await expect(select(p)).toContainText(companies[0].nameEn);assert.equal(state.mutations,0);
    await choose(p);await committed(p);await committed(second);assert.equal(state.mutations,1);
    await p.locator('.workspace-actions erp-popover-panel>erp-button button').click();
    await p.getByRole('dialog',{name:core.en['menu.settings'],exact:true}).getByRole('button',{name:new RegExp('^'+core.en['auth.logout'])}).click();
    await expect(p).toHaveURL(origin+'/login');await expect(second).toHaveURL(origin+'/login');
    results.push({kind:'cross-tab-switch-and-logout',passed:true});await c.close();
  }
  {
    const {c,p,state}=await configure('en','light',390,{single:true});await expect(select(p)).toHaveCount(0);assert.equal(state.mutations,0);
    results.push({kind:'single-company-readonly',passed:true});await c.close();
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'production-results.json'),JSON.stringify(results,null,2));console.log(`Company context passed: ${results.length} production browser scenarios.`);
}finally{await browser.close();}
