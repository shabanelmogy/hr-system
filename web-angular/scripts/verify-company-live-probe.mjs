// Optional isolated SQL integration probe. Auth is real; only catalog/locale reads are synthetic.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

export async function verifyCompanyLive({browser,expect,root,appOrigin,apiOrigin,first,second}){
  const dist=path.resolve(root,'web-angular/dist/erp-angular/browser');
  const version=(await fs.readFile(path.join(root,'web-angular/src/app/platform/localization/catalog.generated.ts'),'utf8')).match(/[a-f0-9]{64}/)[0];
  const core=JSON.parse(await fs.readFile(path.join(root,'web-angular/src/locales/generated/core.json'),'utf8')).en;
  const auth=JSON.parse(await fs.readFile(path.join(root,'web-angular/src/locales/generated/platform-auth.json'),'utf8')).en;
  const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
  await context.addCookies([{name:'i18next',value:'en',url:appOrigin}]);
  let verifiedCompany=first,step='asset routing';const errors=[];
  const types={'.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.html':'text/html'};
  try{
    await context.route(appOrigin+'/**',async route=>{
      const pathname=decodeURIComponent(new URL(route.request().url()).pathname);
      let file=path.resolve(dist,'.'+pathname);assert.ok(file.startsWith(dist+path.sep)||file===dist,'asset path containment');
      if(!path.extname(pathname))file=path.join(dist,'index.html');
      await route.fulfill({status:200,contentType:types[path.extname(file)]??'application/octet-stream',body:await fs.readFile(file)});
    });
    await context.route('https://localhost:7037/api/**',async route=>{
      const url=new URL(route.request().url());
      if(url.pathname.includes('/browser-auth/')){
        const response=await route.fetch({url:apiOrigin+url.pathname+url.search});
        if(response.status()===200&&!url.pathname.endsWith('/csrf')){
          const body=await response.json();if(body.user)verifiedCompany=body.user.companyId;
        }
        await route.fulfill({response});return;
      }
      let body;
      if(url.pathname.endsWith('/modules/accessible'))body=[{code:'hr',name:'HR',isDefault:true,submodules:[{code:'basic-data',name:'Basic data',entryPath:null,requiredPermissions:[]}]}];
      else if(url.pathname.endsWith('/company-localizations/runtime'))body={tenantId:'browser-tenant',companyId:verifiedCompany,defaultLanguage:'en',catalogVersion:version,revision:1,
        overrides:[{namespace:'core',language:'en',key:'general.mainTitle',value:`Scoped Company ${verifiedCompany}`}]};
      else throw Error('Unexpected isolated Angular read');
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
    });
    step='login and challenges';const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));await page.goto(appOrigin+'/login');
    await page.locator('input[autocomplete=username]').fill('browser-user');
    await page.locator('input[autocomplete=current-password]').fill('BrowserFixture123!');
    await page.locator('erp-form button[type=submit]').click();
    await page.getByRole('dialog').getByRole('button',{name:/^Browser tenant/}).click();
    await page.getByRole('dialog').getByRole('button',{name:auth['auth.continueToTenant'],exact:true}).click();
    await page.getByRole('dialog').getByRole('button',{name:/B1/}).click();
    await page.getByRole('dialog').getByRole('button',{name:auth['auth.continueToCompany'],exact:true}).click();
    await expect(page).toHaveURL(appOrigin+'/apps');await expect(page.locator('.launcher-tile')).toHaveCount(1);
    step='second tab bootstrap';const other=await context.newPage();other.on('pageerror',error=>errors.push(error.message));await other.goto(appOrigin+'/apps');await expect(other.locator('.launcher-tile')).toHaveCount(1);
    step='company switch';
    const control=page.locator('.context-group erp-option-select [role=combobox]');await control.click();await page.getByRole('option',{name:/B2/}).click();
    for(const current of [page,other]){
      await expect(current.locator('.workspace-topbar')).toContainText(`Scoped Company ${second}`);
      await expect(current.locator('.context-group erp-option-select [role=combobox]')).toContainText('Second');
      await expect(current.locator('.launcher-tile')).toHaveCount(1);
    }
    assert.equal(verifiedCompany,second,'verified company ID');step='reload and Cookie properties';await other.reload();await expect(other.locator('.workspace-topbar')).toContainText(`Scoped Company ${second}`);
    const own=(await context.cookies(apiOrigin)).filter(c=>c.name.startsWith('__Host-erp-angular'));
    assert.ok(own.length>=3&&own.every(c=>c.secure&&c.httpOnly),'Secure HttpOnly authentication Cookies');
    assert.equal(await page.evaluate(()=>document.cookie.includes('__Host-erp-angular')),false,'authentication Cookie unavailable to JS');
    step='logout and cross-tab invalidation';
    await page.locator('.workspace-actions erp-popover-panel>erp-button button').click();
    await page.getByRole('dialog',{name:core['menu.settings'],exact:true}).getByRole('button',{name:new RegExp('^'+core['auth.logout'])}).click();
    await expect(page).toHaveURL(appOrigin+'/login');await expect(other).toHaveURL(appOrigin+'/login');
    // Anonymous bootstrap may legitimately mint a fresh antiforgery Cookie after logout.
    assert.equal((await context.cookies(apiOrigin)).filter(c=>/^__Host-erp-angular-(access|refresh)/.test(c.name)).length,0,'logout removes access and refresh Cookies');
    assert.equal((await context.request.get(apiOrigin+'/api/v1/browser-auth/session',{headers:{Origin:appOrigin}})).status(),401,'old SQL session is revoked');
    assert.deepEqual(errors,[],'no Angular page errors');
    return {angularCompanyTransition:true,angularCrossTab:true,angularLocaleIsolation:true,angularAuthRealSql:true,angularReadCatalogsSynthetic:true};
  }catch(error){throw new Error(`Angular company probe (${step}): ${error.message.split('\n')[0]}`);}
  finally{await context.close();}
}
