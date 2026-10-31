import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium,expect} from '@playwright/test';
import {themePaletteOrder} from '@app/tokens';
import {sessionFixture} from '../src/app/platform/auth/auth.fixture.ts';
import {dashboardFixture} from '../src/app/platform/tenants/dashboard.fixture.ts';
import {globalReportFixture as report} from '../src/app/modules/reporting/global-reports/report.fixture.ts';
import {reportPdfFixture} from './support/report-pdf-fixture.mjs';
const root=path.resolve(import.meta.dirname,'..'),origin=process.env.ANGULAR_PREVIEW_ORIGIN??'https://localhost:4220',api=process.env.ANGULAR_API_ORIGIN??'https://shabanhrms.runasp.net';
const output=path.resolve(root,'../.codex-tmp/angular-country-report');fs.mkdirSync(output,{recursive:true});
const core=JSON.parse(fs.readFileSync(path.join(root,'src/locales/generated/core.json'),'utf8')),country=JSON.parse(fs.readFileSync(path.join(root,'src/locales/generated/reference-countries.json'),'utf8'));
const version=fs.readFileSync(path.join(root,'src/app/platform/localization/catalog.generated.ts'),'utf8').match(/[a-f0-9]{64}/)[0];
const smoke=process.argv.includes('--smoke'),focused=process.argv.includes('--focused'),pdf=reportPdfFixture(),results=[],browser=await chromium.launch({channel:'chrome',headless:true});
try{
 for(const palette of smoke||focused?['green']:themePaletteOrder)for(const mode of smoke?['light']:['light','dark'])for(const language of smoke?['en']:['en','ar'])for(const width of smoke?[process.argv.includes('--compact')?390:1440]:[390,1440]){
  const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width,height:width===390?780:1050},reducedMotion:'reduce',acceptDownloads:true});
  await context.addCookies(Object.entries({themePalette:palette,currentMode:mode,i18next:language}).map(([name,value])=>({name,value,url:origin})));
  await context.addInitScript(({fallback})=>{const make=URL.createObjectURL.bind(URL),revoke=URL.revokeObjectURL.bind(URL);window.pdfLeases={created:[],revoked:[]};URL.createObjectURL=blob=>{const url=make(blob);window.pdfLeases.created.push(url);return url;};URL.revokeObjectURL=url=>{window.pdfLeases.revoked.push(url);revoke(url);};if(fallback)Object.defineProperty(navigator,'pdfViewerEnabled',{value:false});},{fallback:focused&&width===390});
  const state={mode:'ready',permitted:true,hash:report.rowVersion,catalogs:0,renders:[],countryReads:[],sessions:0,hold:false,waiting:false,release:()=>{},holdCsrf:false,csrfWaiting:false,releaseCsrf:()=>{}};
  const errors=[],apiErrors=[];
  await context.route(api+'/api/**',async route=>{try{
   const request=route.request(),url=new URL(request.url()),p=url.pathname;let body,status=200;assert.equal(request.headers().authorization,undefined);
   if(p.endsWith('/csrf')){if(state.holdCsrf){state.holdCsrf=false;state.csrfWaiting=true;await new Promise(resolve=>state.releaseCsrf=resolve);state.csrfWaiting=false;}body={requestToken:'report-csrf-fixture'};}
   else if(p.endsWith('/session')||p.endsWith('/refresh')){state.sessions++;body={isAuthenticated:true,user:{...sessionFixture,roles:['super_admin'],permissions:['Countries:View',...(state.permitted?['GlobalCrystalReports:View']:[])]}};}
   else if(p.endsWith('/runtime'))body={catalogVersion:version,revision:0,overrides:[]};
   else if(p.endsWith('/getDashboardSummary'))body=dashboardFixture;
   else if(p.endsWith('/modules/accessible'))body=[];
   else if(p==='/api/v1/countries'){
    const query=Object.fromEntries(url.searchParams);state.countryReads.push(query);body={items:[{id:1,nameAr:'مصر',nameEn:'Egypt',alpha2Code:'EG',alpha3Code:'EGY',phoneCode:'20',currencyCode:'EGP',statesCount:2,isDeleted:false,createdOn:'2026-01-01T00:00:00Z',updatedOn:null}],metaData:{currentPage:Number(query.pageNumber),pageNumber:Number(query.pageNumber),pageSize:Number(query.pageSize),totalCount:1,totalPages:1,hasNext:false,hasPrev:false}};
   }else if(p==='/api/v1/global-crystal-reports'){
    state.catalogs++;assert.equal(url.searchParams.get('entityKey'),'countries');if(state.mode==='catalog-error'){status=503;body={title:'Synthetic catalog error'};}else body=state.mode==='empty'?[]:state.mode==='catalog-invalid'?[{broken:true}]:[{...report,rowVersion:state.hash},{...report,id:'c'.repeat(64),rowVersion:'d'.repeat(64),summarySubject:'Alternative fixture',summaryTitle:'تقرير بديل'}];
   }else if(p.endsWith('/render')){
    assert.equal(request.method(),'POST');assert.equal(request.headers()['x-erp-xsrf'],'report-csrf-fixture');const value=request.postDataJSON();state.renders.push({...value,source:p.split('/').at(-2)});assert.equal(value.entityKey,'countries');assert.ok(Object.keys(value.filters).every(key=>['NameAr','NameEn'].includes(key)));
    if(state.hold){state.hold=false;state.waiting=true;await new Promise(resolve=>state.release=resolve);state.waiting=false;}
    if(state.mode==='stale')status=409;else if(state.mode==='forbidden')status=403;else if(state.mode==='validation')status=400;else if(state.mode==='offline')status=503;
    else if(state.mode==='invalid'){await route.fulfill({contentType:'application/pdf',body:'not a PDF'});return;}
    else if(state.mode==='json'){await route.fulfill({contentType:'application/json',body:'{}'});return;}
    else if(state.mode==='empty-pdf'){await route.fulfill({contentType:'application/pdf',body:Buffer.alloc(0)});return;}
    if(status===200){await route.fulfill({contentType:'application/pdf',body:pdf});return;}
    body=status===400?{errors:{'Filters.NameEn':['Server fixture rejection'],unknown:['must stay hidden']}}:{title:'Synthetic report rejection'};
   }else throw Error('Unexpected report request '+request.method()+' '+p);
   await route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  }catch(error){if(!/Target.*closed|Route is already handled|Invalid InterceptionId|interception.*not found/i.test(String(error))){apiErrors.push(String(error));await route.abort().catch(()=>{});}}});
  const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));page.on('dialog',async dialog=>{errors.push('Native dialog '+dialog.type());await dialog.dismiss();});
  const text=core[language],copy=country[language],header=page.locator('erp-page-header'),view=page.locator('erp-global-report-view'),viewer=view.locator('erp-pdf-viewer');
  const input=id=>view.getByTestId(id).locator('input'),search=()=>view.getByTestId('criteria').locator('button[type=submit]').click(),refresh=()=>header.locator('.refresh button').click();
  const pick=async id=>{const direct=header.locator(`[data-view=${id}] button`);if(await direct.count())await direct.click();else{await header.getByRole('button',{name:text['navigation.moreViews'],exact:true}).click();await page.locator('.overflow-views').getByRole('button',{name:text['views.'+id],exact:true}).click();}};
  const ready=()=>expect(viewer.locator('a[download]')).toBeVisible();
  const enter=async()=>{await page.goto(origin+'/home');await page.getByTestId('open-data').getByRole('button').click();await page.getByRole('complementary').getByRole('button',{name:text['menu.countries'],exact:true}).click();await expect(page.getByTestId('countries')).toHaveAttribute('data-kind','ready');if(width===1440)await page.locator('.drawer-header').getByRole('button',{name:text['menu.closeSidebar'],exact:true}).click();await pick('report');};
  const fresh=async()=>{state.mode='ready';state.permitted=true;await enter();await ready();};
  const rendered=async action=>{const count=state.renders.length,previous=await viewer.locator('a[download]').count()?await viewer.locator('a[download]').getAttribute('href'):null;await action();await expect.poll(()=>state.renders.length).toBe(count+1);await ready();if(previous)await expect(viewer.locator('a[download]')).not.toHaveAttribute('href',previous);};
  const languageToggle=()=>page.evaluate(()=>{const owner=ng.getComponent(document.querySelector('erp-global-report-view'));owner.locale.setLanguage(owner.locale.language()==='en'?'ar':'en');});
  await fresh();await page.evaluate(()=>document.fonts.ready);assert.equal(state.catalogs,1);assert.equal(state.renders.length,1);assert.deepEqual(state.renders[0].filters,{});assert.equal(state.renders[0].expectedSha256,report.rowVersion);assert.equal(state.renders[0].language,language);
  await expect(header).toHaveCount(1);await expect(view.locator('erp-page-header')).toHaveCount(0);await expect(view.getByTestId('criteria').locator('form')).toHaveAttribute('novalidate','');await expect(view.locator('erp-collection-footer')).toHaveCount(0);
  const fields=await view.locator('.form-content > [data-testid]').evaluateAll(elements=>elements.map(element=>element.dataset.testid));assert.deepEqual(fields,['nameAr','nameEn','report']);
  const url=await viewer.locator('a[download]').getAttribute('href');assert.ok(url.startsWith('blob:'+origin+'/'));await expect(viewer.locator('a[target=_blank]')).toHaveAttribute('rel','noopener noreferrer');
  if(focused&&width===390){await expect(viewer.locator('iframe')).toHaveCount(0);await expect(viewer.locator('[role=status]')).toContainText(text['reports.previewUnavailable']);}else await expect(viewer.locator('iframe')).toHaveAttribute('src',url);
  const geometry=await view.locator('erp-report-workspace').evaluate(element=>{const panel=element.querySelector('aside').getBoundingClientRect(),document=element.querySelector('.document').getBoundingClientRect(),frame=element.getBoundingClientRect();return{panel:{x:panel.x,y:panel.y,width:panel.width,height:panel.height},document:{x:document.x,y:document.y,width:document.width,height:document.height},frame:{height:frame.height,bottom:frame.bottom},viewport:{width:innerWidth,height:innerHeight},page:window.document.documentElement.scrollWidth};});
  assert.ok(geometry.page<=width+1);assert.ok(geometry.document.height>=150);assert.ok(geometry.frame.bottom<=geometry.viewport.height+2);if(width===1440){assert.equal(geometry.panel.width,280);assert.ok(Math.abs(geometry.panel.y-geometry.document.y)<2);const gap=language==='en'?geometry.document.x-geometry.panel.x-geometry.panel.width:geometry.panel.x-geometry.document.x-geometry.document.width;assert.equal(gap,64);}else{assert.equal(Math.round(geometry.document.y-geometry.panel.y-geometry.panel.height),64);}
  if(await viewer.locator('iframe').count())assert.ok(await viewer.locator('iframe').evaluate(element=>element.getBoundingClientRect().bottom<=element.closest('[reportDocument]').getBoundingClientRect().bottom+1),'Inline PDF must fit its contained document area');
  await page.screenshot({path:path.join(output,`${palette}-${mode}-${language}-${width}-ready${focused?'-fallback':''}.png`),fullPage:true,animations:'disabled'});
  await input('nameAr').fill('مصر');const renders=state.renders.length,catalogs=state.catalogs,countryReads=state.countryReads.length;
  await header.locator('.filter button').click();await expect(view.locator('aside')).toHaveCount(0);await ready();await header.locator('.filter button').click();await expect(input('nameAr')).toHaveValue('مصر');assert.equal(state.renders.length,renders);assert.equal(state.catalogs,catalogs);
  await rendered(languageToggle);assert.deepEqual(state.renders.at(-1).filters,{});await expect(input('nameAr')).toHaveValue('مصر');await rendered(languageToggle);
  await rendered(search);assert.deepEqual(state.renders.at(-1).filters,{NameAr:'مصر'});await expect.poll(()=>page.evaluate(url=>window.pdfLeases.revoked.includes(url),url)).toBe(true);
  await rendered(refresh);assert.deepEqual(state.renders.at(-1).filters,{NameAr:'مصر'});assert.equal(state.countryReads.length,countryReads);
  const themeRenders=state.renders.length;await page.evaluate(()=>{const shell=ng.getOwningComponent(document.querySelector('erp-application-frame'));shell.theme.setMode(shell.theme.mode()==='light'?'dark':'light',false);});await expect(page.locator('html')).toHaveAttribute('data-theme',mode==='light'?'dark':'light');assert.equal(state.renders.length,themeRenders);await page.evaluate(mode=>ng.getOwningComponent(document.querySelector('erp-application-frame')).theme.setMode(mode,false),mode);
  await pick('grid');await expect(view).toHaveCount(0);await expect.poll(()=>page.evaluate(()=>window.pdfLeases.created.length===window.pdfLeases.revoked.length)).toBe(true);await pick('report');await ready();assert.deepEqual(state.renders.at(-1).filters,{});
  if(focused){
   const downloadEvent=page.waitForEvent('download');await viewer.locator('a[download]').click();const download=await downloadEvent;assert.equal(download.suggestedFilename(),'countries-'+report.id.slice(0,16)+'.pdf');assert.deepEqual(fs.readFileSync(await download.path()),pdf);
   await input('nameAr').fill('مصر');await rendered(search);await view.getByTestId('report').getByRole('combobox').click();await rendered(()=>page.getByRole('option',{name:language==='ar'?'تقرير بديل':'Alternative fixture',exact:true}).click());assert.equal(state.renders.at(-1).source,'c'.repeat(64));assert.deepEqual(state.renders.at(-1).filters,{NameAr:'مصر'});
   await rendered(()=>view.getByTestId('reset').getByRole('button').click());assert.deepEqual(state.renders.at(-1).filters,{});await expect(input('nameAr')).toHaveValue('');
   await input('nameEn').evaluate(element=>{element.value='x'.repeat(201);element.dispatchEvent(new Event('input',{bubbles:true}));});let count=state.renders.length;await search();await expect(view.locator('.error-summary a')).toHaveCount(1);await expect(input('nameEn')).toBeFocused();assert.equal(state.renders.length,count);
   await input('nameEn').fill('Egypt');state.mode='validation';await search();await expect(view.getByTestId('nameEn').locator('.error')).toHaveText('Server fixture rejection');await expect(input('nameEn')).toBeFocused();await expect(viewer).toHaveCount(0);await expect(view).not.toContainText('must stay hidden');
   for(const outcome of ['invalid','json','empty-pdf','offline']){await fresh();state.mode=outcome;await search();await expect(viewer).toHaveCount(0);await expect(view.getByRole('heading',{name:text[outcome==='offline'?'common.error':'reports.invalidPdf'],exact:true})).toBeVisible();state.mode='ready';await view.getByRole('button',{name:text['actions.retry'],exact:true}).click();await ready();}
   await fresh();state.mode='stale';await search();await expect(view.getByRole('heading',{name:text['reports.sourceChanged'],exact:true})).toBeVisible();count=state.renders.length;await languageToggle();assert.equal(state.renders.length,count);state.mode='ready';state.hash='e'.repeat(64);await rendered(refresh);assert.equal(state.renders.at(-1).expectedSha256,state.hash);await rendered(languageToggle);
   for(const outcome of ['empty','catalog-invalid','catalog-error']){state.mode=outcome;await enter();await expect(viewer).toHaveCount(0);await expect(view.getByRole('heading',{name:copy[outcome==='empty'?'countries.reportUnavailable':'countries.reportCatalogError'],exact:true})).toBeVisible();state.mode='ready';await view.getByRole('button',{name:text['actions.retry'],exact:true}).click();await ready();}
   state.mode='forbidden';await search();await expect(view.getByRole('heading',{name:text['authorization.forbidden.title'],exact:true})).toBeVisible();count=state.renders.length;await refresh();assert.equal(state.renders.length,count);
   await fresh();state.holdCsrf=true;count=state.renders.length;await search();await expect.poll(()=>state.csrfWaiting).toBe(true);await pick('grid');state.releaseCsrf();await expect(view).toHaveCount(0);assert.equal(state.renders.length,count);await expect.poll(()=>page.evaluate(()=>window.pdfLeases.created.length===window.pdfLeases.revoked.length)).toBe(true);
   await pick('report');await ready();
  }
  state.hold=true;await search();await expect.poll(()=>state.waiting).toBe(true);await expect(viewer).toHaveCount(0);state.permitted=false;const sessions=state.sessions;await page.evaluate(()=>{const channel=new BroadcastChannel('erp-browser-session-context');channel.postMessage({kind:'session-changed'});channel.close();});await expect.poll(()=>state.sessions).toBeGreaterThan(sessions);await expect(view).toHaveCount(0);state.release();await expect(page.locator('erp-data-table')).toBeVisible();
  const finalRenders=state.renders.length,finalCatalogs=state.catalogs;await page.evaluate(()=>ng.getComponent(document.querySelector('erp-countries-read-page')).chooseView('report'));await expect(view).toHaveCount(0);assert.equal(state.renders.length,finalRenders);assert.equal(state.catalogs,finalCatalogs);
  assert.deepEqual(errors,[]);assert.deepEqual(apiErrors,[]);results.push({palette,mode,language,width,focused,geometry,independentCriteria:true,oneHeader:true,controlledSidebar:true,explicitRefresh:true,cancelAndRevoke:true,authorityGuard:true,fallback:focused&&width===390,passed:true});await context.close();console.log(`Countries Report passed ${palette}/${mode}/${language}/${width}${focused?' focused':''}`);
 }
 fs.writeFileSync(path.join(output,smoke?'smoke-results.json':focused?'focused-results.json':'results.json'),JSON.stringify(results,null,2));
}finally{await browser.close();}
