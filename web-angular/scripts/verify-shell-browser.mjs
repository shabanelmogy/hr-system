import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium,expect } from '@playwright/test';
import { sessionFixture } from '../src/app/platform/auth/auth.fixture.ts';
import { dashboardFixture } from '../src/app/platform/tenants/dashboard.fixture.ts';

const app=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.resolve(app,'../.codex-tmp/angular-shell');fs.mkdirSync(output,{recursive:true});
const origin=process.env.ANGULAR_PREVIEW_ORIGIN??'https://localhost:4210';
const core=JSON.parse(fs.readFileSync(path.join(app,'src/locales/generated/core.json'),'utf8'));
const version=fs.readFileSync(path.join(app,'src/app/platform/localization/catalog.generated.ts'),'utf8').match(/[a-f0-9]{64}/)[0];
const browser=await chromium.launch({channel:'chrome'});const results=[];const errors=[];
const text=(language,key)=>core[language][key];
async function configure(context,role){
  let authenticated=true;
  const user={...sessionFixture,roles:[role],firstName:'Fixture',lastName:'User',tenantName:'Verified tenant with a long descriptive name',companyNameEn:'Verified company with a long descriptive name',companyNameAr:'الشركة الموثوقة ذات الاسم الطويل'};
  await context.route('https://localhost:7037/api/**',async route=>{
    const request=route.request(),p=new URL(request.url()).pathname;let status=200,body;
    if(p.endsWith('/csrf'))body={requestToken:'synthetic-csrf'};
    else if(p.endsWith('/session')||p.endsWith('/refresh')){body={isAuthenticated:true,user};if(!authenticated)status=401;}
    else if(p.endsWith('/logout')){assert.ok(request.headers()['x-erp-xsrf']);assert.equal(request.headers()['authorization'],undefined);authenticated=false;body={};}
    else if(p.endsWith('/getDashboardSummary'))body=dashboardFixture;
    else if(p.endsWith('/modules/accessible'))body=[{code:'hr',name:'HR',isDefault:true,submodules:[{code:'basic-data',name:'Basic data',requiredPermissions:[],entryPath:null}]}];
    else if(p.endsWith('/runtime')){body={catalogVersion:version,revision:1,overrides:[]};if(role!=='super_admin')Object.assign(body,{tenantId:user.tenantId,companyId:user.companyId,defaultLanguage:'en'});}
    else throw new Error('Unexpected shell API request: '+p);
    await route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  });
}
try{
  for(const role of ['user','super_admin'])for(const language of ['en','ar'])for(const mode of ['light','dark'])for(const width of [390,900,1440]){
    const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width,height:1000},reducedMotion:'reduce'});
    await context.addCookies(Object.entries({i18next:language,currentMode:mode,themePalette:'green'}).map(([name,value])=>({name,value,url:origin})));
    await configure(context,role);const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
    await page.goto(origin+(role==='super_admin'?'/home':'/apps/hr'));await page.locator('.workspace-topbar').waitFor();await expect(page.getByRole('img',{name:'Fixture User',exact:true}).first()).toBeVisible();await page.evaluate(()=>document.fonts.ready);
    const toggle=page.locator('.drawer-toggle button');const settings=page.locator('.workspace-actions erp-popover-panel>erp-button button');
    await expect(page.locator('.context-group')).toHaveCount(role==='super_admin'?0:1);
    const noOverflow=async()=>assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${role}/${language}/${width}: horizontal overflow`);
    await noOverflow();const header=await page.locator('.workspace-topbar').boundingBox();assert.equal(header.height,width<600?56:64);
    if(width>=900){
      await expect.poll(async()=>(await page.locator('.workspace-sidebar').boundingBox()).width).toBe(64);
      await toggle.click();await expect.poll(async()=>(await page.locator('.workspace-sidebar').boundingBox()).width).toBe(280);
      await expect.poll(async()=>Math.round((await page.locator('.workspace-topbar').boundingBox()).width)).toBe(width-281);
      const search=page.locator('.workspace-sidebar input');await search.fill(text(language,'menu.settings'));
      await expect(page.locator('.workspace-sidebar nav button')).toHaveCount(1);await search.fill('');await expect(page.locator('.workspace-sidebar nav button')).toHaveCount(role==='super_admin'?2:3);
      await noOverflow();await page.screenshot({path:path.join(output,`shell-${role}-${language}-${mode}-${width}.png`),fullPage:true});
      await page.locator('.drawer-header button').click();
    }else{
      await toggle.click();const drawer=page.locator('.p-drawer');await expect(drawer).toBeVisible();
      const box=await drawer.boundingBox();assert.equal(Math.round(box.width),280);assert.equal(Math.round(box.x),language==='ar'?width-280:0);
      await page.keyboard.press('Escape');await expect(drawer).toHaveCount(0);await expect(toggle).toBeFocused();
      await toggle.click();await expect(drawer).toBeVisible();await drawer.getByRole('button',{name:text(language,'menu.settings'),exact:true}).click();await expect(drawer).toHaveCount(0);await page.keyboard.press('Escape');
      await toggle.click();await expect(drawer).toBeVisible();await page.setViewportSize({width:1440,height:1000});await expect(page.locator('.workspace-sidebar')).toBeVisible();await expect(drawer).toHaveCount(0);
      await expect.poll(()=>page.locator('body').evaluate(e=>getComputedStyle(e).overflow)).not.toBe('hidden');await page.setViewportSize({width,height:1000});
    }
    await settings.click();const panel=page.getByRole('dialog',{name:text(language,'menu.settings'),exact:true});await expect(panel).toBeVisible();
    await expect(panel.getByRole('radio')).toHaveCount(5);const blue=panel.getByRole('radio',{name:text(language,'menu.palettes.blue'),exact:true});await blue.check();
    await expect(page.locator('html')).toHaveAttribute('data-palette','blue');await expect(blue).toBeChecked();await blue.focus();await page.keyboard.press('ArrowRight');
    await expect.poll(()=>page.locator('html').getAttribute('data-palette')).not.toBe('blue');
    const palette=await page.locator('html').getAttribute('data-palette');const nextMode=mode==='light'?'dark':'light';
    await panel.getByRole('button',{name:text(language,nextMode==='dark'?'general.darkMode':'general.lightMode'),exact:true}).click();await expect(page.locator('html')).toHaveAttribute('data-theme',nextMode);
    await noOverflow();await page.screenshot({path:path.join(output,`settings-${role}-${language}-${mode}-${width}.png`),fullPage:true});
    await page.keyboard.press('Escape');await expect(panel).toHaveCount(0);await expect(settings).toBeFocused();
    await page.reload();await page.locator('.workspace-topbar').waitFor();await expect(page.locator('html')).toHaveAttribute('data-palette',palette);await expect(page.locator('html')).toHaveAttribute('data-theme',nextMode);
    await settings.click();await expect(panel).toBeVisible();const nextLanguage=language==='ar'?'en':'ar';
    await expect(panel.locator('p-select')).toHaveCount(1);await expect(panel.locator('select')).toHaveCount(0);
    await panel.getByRole('combobox').click();await page.getByRole('option',{name:nextLanguage==='ar'?'العربية':'English',exact:true}).click();
    await expect(page.locator('html')).toHaveAttribute('dir',nextLanguage==='ar'?'rtl':'ltr');await expect(panel).toHaveCount(0);await noOverflow();
    await settings.click();const translated=page.getByRole('dialog',{name:text(nextLanguage,'menu.settings'),exact:true});await expect(translated).toBeVisible();
    await translated.getByRole('button',{name:new RegExp('^'+text(nextLanguage,'auth.logout'))}).click();await expect(page).toHaveURL(origin+'/login');
    await expect(page.locator('.p-drawer,.p-popover')).toHaveCount(0);assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);
    results.push({role,language,mode,width,passed:true});console.log(`Shell passed ${role}/${language}/${mode}/${width}`);await context.close();
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(results,null,2));console.log(`Authenticated shell browser matrix passed: ${results.length} cases.`);
}finally{await browser.close();}
