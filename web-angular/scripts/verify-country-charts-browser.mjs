import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium,expect} from '@playwright/test';
import {getTheme,themePaletteOrder} from '@app/tokens';
import {sessionFixture} from '../src/app/platform/auth/auth.fixture.ts';
import {dashboardFixture} from '../src/app/platform/tenants/dashboard.fixture.ts';

// Actual shell/native canvases; all API responses are intercepted synthetic reads.
const root=path.resolve(import.meta.dirname,'..'),origin=process.env.ANGULAR_PREVIEW_ORIGIN??'https://localhost:4220',api=process.env.ANGULAR_API_ORIGIN??'https://shabanhrms.runasp.net';
const output=path.resolve(root,'../.codex-tmp/angular-country-charts');fs.mkdirSync(output,{recursive:true});
const core=JSON.parse(fs.readFileSync(path.join(root,'src/locales/generated/core.json'),'utf8')),captions=JSON.parse(fs.readFileSync(path.join(root,'src/locales/generated/reference-countries.json'),'utf8'));
const version=fs.readFileSync(path.join(root,'src/app/platform/localization/catalog.generated.ts'),'utf8').match(/[a-f0-9]{64}/)[0];
const smoke=process.argv.includes('--smoke'),focused=process.argv.includes('--focused'),results=[];
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 for(const palette of smoke||focused?['green']:themePaletteOrder)for(const mode of smoke?['light']:['light','dark'])for(const language of smoke?['en']:['en','ar'])for(const width of smoke?[1440]:[390,1440]){
  const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width,height:width===390?780:1050},reducedMotion:'reduce'});
  await context.addCookies(Object.entries({themePalette:palette,currentMode:mode,i18next:language}).map(([name,value])=>({name,value,url:origin})));
  const rows=Array.from({length:12},(_,index)=>{const id=index+1;return{id,nameAr:'دولة '+id,nameEn:'Country '+id,alpha2Code:null,alpha3Code:null,phoneCode:null,currencyCode:id%4===0?null:id%4===2?'EGP':'USD',statesCount:id%3,isDeleted:false,createdOn:`2026-${String(Math.ceil(id/4)).padStart(2,'0')}-${String(id).padStart(2,'0')}T00:00:00Z`,updatedOn:null};});
  const reads=[],errors=[];let dataMode='normal',denied=false,hold=false,waiting=false,release=()=>{};
  await context.route(api+'/api/**',async route=>{
   const request=route.request(),url=new URL(request.url()),p=url.pathname;let body,status=200;
   if(p.endsWith('/csrf'))body={requestToken:'synthetic-csrf'};
   else if(p.endsWith('/session')||p.endsWith('/refresh'))body={isAuthenticated:true,user:{...sessionFixture,roles:['super_admin'],permissions:denied?[]:['Countries:View','Countries:Create','Countries:Edit','Countries:Archive','Countries:Restore'],tenantReadOnly:false}};
   else if(p.endsWith('/runtime'))body={catalogVersion:version,revision:0,overrides:[]};
   else if(p.endsWith('/getDashboardSummary'))body=dashboardFixture;
   else if(p.endsWith('/modules/accessible'))body=[];
   else if(p==='/api/v1/countries'&&request.method()==='GET'){
    const query=Object.fromEntries(url.searchParams);reads.push(query);
    const modeAtDispatch=dataMode;
    if(hold){hold=false;waiting=true;await new Promise(resolve=>release=resolve);waiting=false;}
    if(modeAtDispatch==='error'){status=503;body={title:'Synthetic read failure'};}
    else{
     const size=Number(query.pageSize),number=Number(query.pageNumber),search=(query.search??'').toLowerCase();
     let matching=modeAtDispatch==='empty'?[]:rows.filter(row=>!search||row.nameEn.toLowerCase().includes(search)||row.nameAr.includes(search));
     if(modeAtDispatch==='zero')matching=matching.map(row=>({...row,currencyCode:null,statesCount:0}));
     matching=[...matching].sort((a,b)=>(query.sortDirection==='asc'?1:-1)*a.createdOn.localeCompare(b.createdOn));const totalCount=matching.length,totalPages=Math.ceil(totalCount/size);
     body={items:matching.slice((number-1)*size,number*size),metaData:{currentPage:number,pageNumber:number,pageSize:size,totalCount,totalPages,hasNext:number<totalPages,hasPrev:number>1}};
    }
   }else throw Error('Unexpected chart API '+request.method()+' '+p);
   await route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  });
  const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));page.on('dialog',async dialog=>{errors.push('Native dialog '+dialog.type());await dialog.dismiss();});
  const text=core[language],country=captions[language],region=page.getByTestId('countries'),header=page.locator('erp-page-header');
  const pickView=async id=>{
   const direct=header.locator(`[data-view=${id}] button`);
   if(await direct.count())await direct.click();
   else{await header.getByRole('button',{name:text['navigation.moreViews'],exact:true}).click();await page.locator('.overflow-views').getByRole('button',{name:text['views.'+id],exact:true}).click();}
  };
  const refresh=()=>header.locator('.refresh button').click();
  const metricValues=()=>region.locator('erp-metric-card strong').allTextContents();
  const nativeFacts=()=>page.evaluate(()=>Array.from(document.querySelectorAll('erp-chart-panel p-chart')).map(element=>{
   const chart=ng.getComponent(element).chart;if(!chart)return null;window.__erpChartConstructor=chart.constructor;
   const canvas=chart.canvas,rect=canvas.getBoundingClientRect(),pixels=chart.ctx.getImageData(0,0,canvas.width,canvas.height).data;
   const panel=element.closest('erp-chart-panel'),frame=panel.querySelector('section'),heading=frame.querySelector('h2'),style=getComputedStyle(frame),titleStyle=getComputedStyle(heading);
   return{id:panel.dataset.chartId,type:chart.config.type,labels:chart.data.labels,values:chart.data.datasets.map(series=>series.data),color:typeof chart.data.datasets[0].backgroundColor==='function'?'gradient':chart.data.datasets[0].backgroundColor,gradient:chart.getDatasetMeta(0).dataset?.options?.backgroundColor instanceof CanvasGradient,width:rect.width,height:rect.height,painted:pixels.some((value,index)=>index%4===3&&value>0),rtl:chart.options.plugins.legend.rtl,animation:chart.options.animation,live:Object.keys(chart.constructor.instances).length,canvasLabel:canvas.getAttribute('aria-label'),presentation:{padding:style.padding,radius:style.borderRadius,titleSize:titleStyle.fontSize,titleWeight:titleStyle.fontWeight,font:titleStyle.fontFamily}};
  }));
  await page.goto(origin+'/home');await page.getByTestId('open-data').getByRole('button').click();await page.getByRole('complementary').getByRole('button',{name:text['menu.countries'],exact:true}).click();await expect(region).toHaveAttribute('data-kind','ready');
  if(width===1440)await page.locator('.drawer-header').getByRole('button',{name:text['menu.closeSidebar'],exact:true}).click();
  await pickView('cards');await expect(region.locator('article').first()).toBeVisible();
  const toolbar=region.locator('.collection-toolbar');
  const geometry=await toolbar.evaluate(element=>{
   const controls=Array.from(element.querySelectorAll('.search-controls erp-option-select .p-select,.search-controls erp-text-field input,.filter-region erp-option-select .p-select,[data-testid=direction] button,[data-testid=reset] button')).map(node=>{const box=node.getBoundingClientRect();return{centerY:box.y+box.height/2,width:box.width,height:box.height};});
   const field=element.querySelector('erp-text-field'),sort=element.querySelector('[data-testid=sort]');
   return{controls,width:element.clientWidth,scrollWidth:element.scrollWidth,searchWidth:field.querySelector('input').getBoundingClientRect().width,sortWidth:sort.querySelector('.p-select').getBoundingClientRect().width,field:{style:field.getAttribute('style'),width:field.getBoundingClientRect().width,configured:ng.getComponent(element.closest('erp-collection-frame')).searchMaxWidth()},sort:{style:sort.getAttribute('style'),width:sort.getBoundingClientRect().width,configured:ng.getComponent(sort).controlWidth()}};
  });
  await toolbar.screenshot({path:path.join(output,`${palette}-${mode}-${language}-${width}-cards-toolbar.png`)});
  fs.writeFileSync(path.join(output,'latest-toolbar-geometry.json'),JSON.stringify(geometry,null,2));
  assert.equal(geometry.controls.length,7);assert.ok(Math.max(...geometry.controls.map(item=>item.centerY))-Math.min(...geometry.controls.map(item=>item.centerY))<3,'Cards search/status/sort/direction/reset must share one row');assert.ok(geometry.searchWidth<=401);assert.ok(geometry.sortWidth>=219);
  await header.locator('.filter button').click();await expect(toolbar).toHaveCount(0);await pickView('grid');await expect(region.locator('.collection-toolbar')).toHaveCount(0);await header.locator('.filter button').click();await pickView('cards');await expect(toolbar).toHaveCount(1);
  const direction=region.getByTestId('direction').getByRole('button');await expect(direction).toHaveText(text['collections.sortDescendingShort']);await expect(direction.locator('svg')).toHaveCount(1);await direction.click();await expect(direction).toHaveText(text['collections.sortAscendingShort']);await expect(region).toHaveAttribute('data-kind','ready');await direction.click();await expect(direction).toHaveText(text['collections.sortDescendingShort']);await expect(region).toHaveAttribute('data-kind','ready');
  await region.locator('.search-controls erp-text-field input').fill('Country');await expect.poll(()=>reads.at(-1)?.search).toBe('Country');await expect(region).toHaveAttribute('data-kind','ready');
  await pickView('grid');await region.locator('[data-collection-row]').first().locator('td').nth(1).click();await page.keyboard.press('Control+End');await expect.poll(()=>reads.at(-1)?.pageNumber).toBe('2');await expect(region).toHaveAttribute('data-kind','ready');
  hold=true;await pickView('chart');await expect.poll(()=>waiting).toBe(true);await expect(region.locator('canvas')).toHaveCount(0);await expect(region.locator('erp-metric-card')).toHaveCount(0);release();await expect(region).toHaveAttribute('data-kind','ready');await expect(region.locator('canvas')).toHaveCount(4);await page.evaluate(()=>document.fonts.ready);
  assert.equal(reads.at(-1).pageNumber,'1');assert.equal(reads.at(-1).search,'Country');assert.equal(reads.at(-1).sortBy,'createdOn');assert.equal(reads.at(-1).sortDirection,'desc');
  await expect(header.locator('.filter')).toHaveCount(0);await expect(region.locator('.collection-toolbar,erp-collection-footer')).toHaveCount(0);await expect(region.locator('.scope-note')).toHaveCount(0);assert.ok(!(await region.textContent()).includes('Charts summarize'));
  assert.deepEqual(await metricValues(),['12','10','9','2']);
  await expect.poll(async()=>{const values=await nativeFacts();return values.length===4&&values.every(value=>value&&value.width>40&&value.height>100&&value.painted&&value.live===4);}).toBe(true);
  const charts=await nativeFacts(),byId=id=>charts.find(chart=>chart.id===id),expected=getTheme(palette,mode);
  assert.deepEqual(byId('states').values,[[2,2,2,1,1,1]]);assert.deepEqual(byId('coverage').values,[[6,4]]);assert.deepEqual(byId('currencies').labels,['USD','EGP']);assert.deepEqual(byId('currencies').values,[[5,2]]);assert.deepEqual(byId('timeline').labels,['2026-01','2026-02','2026-03']);assert.deepEqual(byId('timeline').values,[[2,6,10]]);
  assert.equal(byId('states').color,expected.colors.primary);assert.equal(byId('currencies').color[0],expected.colors.brand2);for(const chart of charts){assert.equal(chart.rtl,language==='ar');assert.equal(chart.animation,false);assert.ok(chart.canvasLabel);}
  assert.equal(byId('timeline').gradient,true);
  const referencePath=path.join(output,'reference/results.json');if(fs.existsSync(referencePath)){const source=JSON.parse(fs.readFileSync(referencePath,'utf8')).find(value=>value.mode===mode&&value.language===language&&value.width===width);assert.ok(source);for(const [index,chart]of charts.entries())for(const key of ['padding','radius','titleSize','titleWeight','font'])assert.equal(chart.presentation[key],source.geometry[index][key],'Current Next chart '+key);}
  await expect(region.locator('.sr-only table,table.sr-only')).toHaveCount(4);await page.screenshot({path:path.join(output,`${palette}-${mode}-${language}-${width}-charts.png`),fullPage:true,animations:'disabled'});
  const layout=await region.locator('.plots').evaluate(element=>{const containers=[];for(let parent=element.parentElement;parent;parent=parent.parentElement){const style=getComputedStyle(parent);if(style.containerType!=='normal')containers.push({tag:parent.tagName,className:parent.className,type:style.containerType,height:parent.getBoundingClientRect().height});}return{columns:getComputedStyle(element).gridTemplateColumns.split(' ').length,autoRows:getComputedStyle(element).gridAutoRows,templateRows:getComputedStyle(element).gridTemplateRows,plotHeight:element.getBoundingClientRect().height,plotStyle:element.getAttribute('style'),containers,viewportHeight:element.closest('.chart-scroll').getBoundingClientRect().height,panels:Array.from(element.children).map(child=>{const rect=child.getBoundingClientRect();return{width:rect.width,height:rect.height};})};});fs.writeFileSync(path.join(output,'latest-layout.json'),JSON.stringify(layout,null,2));assert.equal(layout.columns,width===390?1:2);assert.ok(layout.panels.every(panel=>panel.height>=279));if(width===1440)assert.ok(Math.abs(layout.panels[0].height-(layout.viewportHeight-12))<3,'Desktop chart row uses the source full viewport height');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  const scroll=region.locator('.chart-scroll p-scrollarea-viewport');
  await scroll.evaluate(element=>{element.scrollTop=element.scrollHeight;});
  await expect.poll(()=>scroll.evaluate(element=>{const last=element.querySelector('erp-chart-panel:last-child').getBoundingClientRect(),viewport=element.getBoundingClientRect();return element.scrollHeight>element.clientHeight&&last.bottom<=viewport.bottom+2&&last.bottom>viewport.top;})).toBe(true);
  await page.screenshot({path:path.join(output,`${palette}-${mode}-${language}-${width}-charts-lower.png`),fullPage:true,animations:'disabled'});
  await scroll.evaluate(element=>{element.scrollTop=0;});
  const beforeRepaint=reads.length;
  await page.evaluate(()=>{const renderer=ng.getComponent(document.querySelector('erp-chart-renderer'));renderer.theme.setMode(renderer.theme.mode()==='dark'?'light':'dark',false);renderer.locale.setLanguage(renderer.locale.language()==='ar'?'en':'ar');});
  await expect.poll(async()=>{const charts=await nativeFacts();return charts.length===4&&charts.every(chart=>chart?.rtl===(language!=='ar')&&chart.live===4);}).toBe(true);assert.equal(reads.length,beforeRepaint);
  await page.evaluate(({language,mode})=>{const renderer=ng.getComponent(document.querySelector('erp-chart-renderer'));renderer.theme.setMode(mode,false);renderer.locale.setLanguage(language);},{language,mode});
  await pickView('grid');await expect.poll(()=>page.evaluate(()=>Object.keys(window.__erpChartConstructor.instances).length)).toBe(0);await pickView('chart');await expect(region.locator('canvas')).toHaveCount(4);
  dataMode='zero';await refresh();await expect(region).toHaveAttribute('data-kind','ready');await expect(region.locator('canvas')).toHaveCount(2);assert.deepEqual(await metricValues(),['12','10','0','0']);await expect(region.locator('[data-chart-id=states]')).toContainText(text['chartCommon.emptyTitle']);await expect(region.locator('[data-chart-id=currencies]')).toContainText(text['chartCommon.emptyTitle']);
  await expect.poll(async()=>{const values=await nativeFacts();return values.length===2&&values.every(value=>value?.live===2);}).toBe(true);
  dataMode='empty';await refresh();await expect(region).toContainText(country['countries.charts.noData']);await expect(region.locator('canvas,erp-metric-card')).toHaveCount(0);await expect.poll(()=>page.evaluate(()=>Object.keys(window.__erpChartConstructor.instances).length)).toBe(0);
  dataMode='error';await refresh();await expect(region).toHaveAttribute('data-kind','error');await expect(region.locator('canvas,erp-metric-card')).toHaveCount(0);dataMode='normal';await region.getByRole('button',{name:text['actions.retry'],exact:true}).click();await expect(region.locator('canvas')).toHaveCount(4);
  hold=true;await refresh();await expect.poll(()=>waiting).toBe(true);denied=true;await page.evaluate(()=>{const channel=new BroadcastChannel('erp-browser-session-context');channel.postMessage({kind:'session-changed'});channel.close();});await expect(region.locator('canvas,erp-metric-card')).toHaveCount(0);release();await expect(region).toHaveAttribute('data-kind','forbidden');await expect(region.locator('canvas,erp-metric-card')).toHaveCount(0);
  assert.deepEqual(errors,[]);results.push({palette,mode,language,width,geometry,charts,layout,cardOneRow:true,compactSort:true,filterToggle:true,chartNoFiltersOrScopeText:true,firstPageRetainsCriteria:true,pageOnlyCounts:true,nativePaint:true,accessibleAlternatives:true,repaintNoGet:true,zeroAndEmpty:true,errorRetry:true,authorityMask:true,destroyOnExit:true,passed:true});await context.close();console.log(`Countries charts passed ${palette}/${mode}/${language}/${width}`);
 }
 fs.writeFileSync(path.join(output,smoke?'smoke-results.json':focused?'focused-results.json':'results.json'),JSON.stringify(results,null,2));
}finally{await browser.close();}
