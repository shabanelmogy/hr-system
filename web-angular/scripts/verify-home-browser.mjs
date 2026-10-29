import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium,expect } from '@playwright/test';
import { sessionFixture } from '../src/app/platform/auth/auth.fixture.ts';
import { dashboardFixture } from '../src/app/platform/tenants/dashboard.fixture.ts';
const origin=process.env.ANGULAR_PREVIEW_ORIGIN??'https://localhost:4210',root=path.resolve(import.meta.dirname,'..'),output=path.join(root,'../.codex-tmp/angular-home');fs.mkdirSync(output,{recursive:true});
const core=JSON.parse(fs.readFileSync(path.join(root,'src/locales/generated/core.json'),'utf8'));
const captions=JSON.parse(fs.readFileSync(path.join(root,'src/locales/generated/platform-tenants.json'),'utf8'));
const version=fs.readFileSync(path.join(root,'src/app/platform/localization/catalog.generated.ts'),'utf8').match(/[a-f0-9]{64}/)[0];
const browser=await chromium.launch({channel:'chrome'}),results=[],errors=[];
async function context(language='en',width=1440,mode='light',height=1000){const c=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width,height},reducedMotion:'reduce'});await c.addCookies(Object.entries({i18next:language,currentMode:mode,themePalette:'green'}).map(([name,value])=>({name,value,url:origin})));return c;}
async function mock(c,state){await c.route('https://localhost:7037/api/**',async route=>{
 const p=new URL(route.request().url()).pathname;let status=200,body;
 if(p.endsWith('/csrf'))body={requestToken:'synthetic'};
 else if(p.endsWith('/session')||p.endsWith('/refresh'))body={isAuthenticated:true,user:{...sessionFixture,roles:[state.role??'super_admin']}};
 else if(p.endsWith('/getDashboardSummary')){state.requests++;status=state.action==='error'?503:state.action==='forbidden'?403:200;body=state.action==='malformed'?{}:state.action==='empty'?{...dashboardFixture,totalTenants:0,enabledTenants:0,admins:0,users:0,companies:0,maxAdmins:0,maxUsers:0,expiringWithin30Days:0,subscriptionStatusCounts:{free:0,trial:0,active:0,pastDue:0,suspended:0,expired:0,cancelled:0},recentTenants:[],expiringWithin30DaysTenants:[]}:dashboardFixture;}
 else if(p.endsWith('/modules/accessible'))body=[];
 else if(p.endsWith('/runtime')){body={catalogVersion:version,revision:1,overrides:state.action==='sql-text'?[{namespace:'platform-tenants',language:'en',key:'superAdminDashboard.title',value:'SQL dashboard title'}]:[]};if(state.role==='user')Object.assign(body,{tenantId:sessionFixture.tenantId,companyId:sessionFixture.companyId,defaultLanguage:'en'});}
 else throw Error('Unexpected home API '+p);
 await route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
});}
try{
 if(!process.argv.includes('--live-only')){
  for(const language of ['en','ar'])for(const mode of ['light','dark'])for(const width of [390,1440]){
   const c=await context(language,width,mode),state={requests:0};await mock(c,state);const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(origin+'/home');
   await expect(p.locator('[data-dashboard=ready]')).toBeVisible();await expect(p.getByRole('heading',{name:captions[language]['superAdminDashboard.title'],exact:true})).toBeVisible();
   await expect(p.locator('main')).not.toContainText('superAdminDashboard.');await expect(p.locator('main')).not.toContainText('tenantManagement.');await expect(p.locator('erp-metric-card')).toHaveCount(6);await expect(p.locator('erp-surface-card')).toHaveCount(4);
   await expect(p.locator('erp-progress-meter [role=progressbar]')).toHaveCount(2);await expect(p.locator('[role=progressbar]').first()).toHaveAttribute('aria-valuenow','13');
   await expect(p.locator('.status-counts>div')).toHaveCount(7);await expect(p.locator('.tenant-list li')).toHaveCount(16);await expect(p.locator('p-tag')).toHaveCount(8);
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);assert.equal(state.requests,1);const metric=await p.locator('erp-metric-card').first().boundingBox();const icon=await p.locator('erp-metric-card .metric-icon').first().boundingBox();
   assert.ok(Math.abs(metric.width-(width===390?150:208))<=1);assert.ok(Math.abs(metric.height-(width===390?82.09375:81.796875))<=1);assert.equal(icon.width,34);
   await p.evaluate(()=>document.fonts.ready);await p.screenshot({path:path.join(output,`home-${language}-${mode}-${width}.png`),fullPage:true});
   if(width===390){await p.setViewportSize({width,height:720});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);const rows=p.locator('.panel-row');assert.equal(await rows.first().evaluate(e=>e.scrollHeight>e.clientHeight),true);await rows.first().evaluate(e=>e.scrollTop=e.scrollHeight);await expect(p.locator('.subscriptions')).toBeInViewport();}
   await p.reload();await expect(p.locator('[data-dashboard=ready]')).toBeVisible();results.push({kind:'dashboard',language,mode,width,metric,icon,passed:true});await c.close();
  }
  for(const action of ['empty','error','forbidden','malformed','ordinary','sql-text']){
   const c=await context(),state={action,role:action==='ordinary'?'user':'super_admin',requests:0};await mock(c,state);const p=await c.newPage();await p.goto(origin+(action==='ordinary'?'/super-admin':'/home'));
   if(action==='sql-text'){await expect(p.getByRole('heading',{name:'SQL dashboard title',exact:true})).toBeVisible();await p.reload();await expect(p.getByRole('heading',{name:'SQL dashboard title',exact:true})).toBeVisible();}
   else if(action==='empty'){await expect(p.locator('[data-dashboard=ready]')).toBeVisible();await expect(p.locator('.empty')).toHaveCount(2);await expect(p.locator('.tenant-list li')).toHaveCount(0);}
   else if(action==='ordinary'||action==='forbidden'){await expect(p.getByRole('heading',{name:core.en['authorization.forbidden.title'],exact:true})).toBeVisible();if(action==='ordinary'){assert.equal(state.requests,0);await p.goto(origin+'/home');await expect(p).toHaveURL(origin+'/apps');}}
   else {await expect(p.getByRole('heading',{name:core.en['common.error'],exact:true})).toBeVisible();state.action='ready';await p.getByRole('button',{name:core.en['actions.retry'],exact:true}).click();await expect(p.locator('[data-dashboard=ready]')).toBeVisible();assert.equal(state.requests,2);}
   results.push({kind:'state',action,passed:true});await c.close();
  }
 }
 if(process.argv.includes('--live')){
  const c=await context(),p=await c.newPage();let expected;
  p.on('response',async r=>{if(new URL(r.url()).pathname.endsWith('/getDashboardSummary')&&r.status()===200)expected=await r.json();});
  await p.goto(origin+'/login');await p.locator('.demo-superadmin button').click();await expect(p).toHaveURL(origin+'/home',{timeout:30_000});await expect(p.locator('[data-dashboard=ready]')).toBeVisible();
  await expect.poll(()=>expected?.totalTenants).toBeGreaterThanOrEqual(0);await expect(p.locator('erp-metric-card').first()).toContainText(new Intl.NumberFormat('en').format(expected.totalTenants));
  await p.reload();await expect(p.locator('[data-dashboard=ready]')).toBeVisible();await p.screenshot({path:path.join(output,'live-global-home.png'),fullPage:true});
  await p.locator('.workspace-actions erp-popover-panel>erp-button button').click();await p.getByRole('dialog',{name:core.en['menu.settings'],exact:true}).getByRole('button',{name:new RegExp('^'+core.en['auth.logout'])}).click();await expect(p).toHaveURL(origin+'/login');
  await p.locator('.demo-admin button').click();await expect(p).toHaveURL(origin+'/apps',{timeout:30_000});await expect(p.locator('.launcher-tile').first()).toBeVisible();
  await p.locator('.workspace-actions erp-popover-panel>erp-button button').click();await p.getByRole('dialog',{name:core.en['menu.settings'],exact:true}).getByRole('button',{name:new RegExp('^'+core.en['auth.logout'])}).click();await expect(p).toHaveURL(origin+'/login');
  results.push({kind:'live-api-sql-role-landing',passed:true});await c.close();
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,process.argv.includes('--live-only')?'live-results.json':origin.endsWith(':4220')?'production-results.json':'results.json'),JSON.stringify(results,null,2));console.log(`Role home passed: ${results.length} scenarios; live API=${process.argv.includes('--live')}.`);
}finally{await browser.close();}
