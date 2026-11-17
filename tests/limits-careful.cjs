// Run with: node tests/limits-careful.cjs
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..');
for(const file of ['piggy-onboarding.html','dist/index.html']){
 const html=fs.readFileSync(path.join(root,file),'utf8');
 for(const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(match[1]);
 const ctx={};vm.createContext(ctx);
 const extract=(start,end)=>html.slice(html.indexOf(start),html.indexOf(end,html.indexOf(start)));
 vm.runInContext(extract('function getLimitWarnings(', 'function limitNudgeIcon(')+extract('function limitNudgeMessage(', 'function renderLimitNudge(')+extract('function limitTone(', ' const limitDrafts='),ctx);
 const plan=[{id:'eating',limitCents:25000},{id:'shopping',limitCents:25000},{id:'groceries',limitCents:40000}];
 const e=(category,amount,date='2026-11-12')=>({category,amount,date});
 const warnings=(expenses,budgets=plan)=>ctx.getLimitWarnings(expenses,budgets,'2026-11');
 assert.equal(warnings([]).length,0);
 assert.equal(warnings([e('eating',24999)]).length,0);
 assert.equal(warnings([e('eating',25000)]).length,0);
 assert.equal(warnings([e('eating',25001)])[0].over,1);
 assert.equal(warnings([e('eating',50000,'2026-10-31')]).length,0);
 assert.equal(warnings([e('other',50000)]).length,0,'No warning without a category limit');
 let rows=warnings([e('eating',20000),e('eating',16000),e('shopping',27500),e('groceries',21700)]);
 assert.equal(rows.length,2);assert.equal(rows[0].id,'eating');assert.equal(rows[0].over,11000);assert.equal(rows[1].over,2500);
 assert.equal(warnings([e('eating',36000)],[{id:'eating',limitCents:36000}]).length,0,'Saving a sufficient limit clears the warning');
 assert.equal(warnings([e('eating',36000)],[]).length,0,'Deleting a limit clears the warning');
 assert.equal(warnings([e('custom-test',1200)],[{id:'custom-test',limitCents:1000}])[0].over,200);
 assert.equal(ctx.limitNudgeMessage('custom-test'),ctx.limitNudgeMessage('other'));
 assert.equal(warnings([e('eating',1)],[{id:'eating',limitCents:0}]).length,1);
 assert.equal(warnings([],[{id:'eating',limitCents:0}]).length,0);
 for(const [spent,tone] of [[49,''],[50,'is-warning'],[74,'is-warning'],[75,'is-caution'],[89,'is-caution'],[90,'is-critical'],[100,'is-critical'],[101,'is-over']])assert.equal(ctx.limitTone(spent,100),tone,'Color threshold '+spent);
 assert.equal(ctx.limitTone(1,0),'is-over');assert.equal(ctx.limitTone(0,0),'');
 for(const id of ['home','groceries','eating','transport','fun','travel','shopping','care','health','subscriptions','gifts','education','pets','family','debt','other'])assert.ok(ctx.limitNudgeMessage(id));
 assert.ok(!html.includes('function buildInsights('),'Analytics prototype is excluded');
 assert.ok(!html.includes('money-insights-preview'),'Demo storage is excluded');
 assert.ok(!html.includes('data-mi-opt'),'Analytics optimization is excluded');
 // A reminder carousel owns gestures starting anywhere inside it, in either direction.
 for(const pointer of [false,true])for(const inReminder of [false,true])for(const dx of [-100,100]){
  const handlers={},navigated=[];let prevented=false;
  const target={closest:selector=>inReminder&&selector.includes('[data-limit-nudge]')?{}:null};
  const listen=(type,fn)=>handlers[type]=fn;
  const gestureContext={result:{addEventListener:listen,getClientRects:()=>[{}],classList:{add(){},remove(){}},setPointerCapture(){},hasPointerCapture:()=>false},window:{addEventListener:listen,getSelection:()=>null},nav:{hidden:false,contains:()=>false},overlay:{open:false},tabPages:{limits:{contains:()=>true}},activeTab:'limits',tabOrder:['spending','limits','analytics','bank'],navigateTab:tab=>navigated.push(tab)};
  vm.runInNewContext(extract(' let tabGesture=null,tabClickUntil=0;', 'nav.onclick='),gestureContext);
  const preventDefault=()=>{prevented=true};
  if(pointer){handlers.pointerdown({pointerType:'mouse',button:0,isPrimary:true,pointerId:1,target,clientX:200,clientY:100});handlers.pointermove({pointerId:1,buttons:1,clientX:200+dx,clientY:100,preventDefault});handlers.pointerup({pointerId:1});}
  else {handlers.touchstart({target,touches:[{clientX:200,clientY:100}]});handlers.touchmove({touches:[{clientX:200+dx,clientY:100}],preventDefault});handlers.touchend();}
  assert.equal(navigated.length,inReminder?0:1,'Reminder swipe must not switch tabs; ordinary page swipe must still work');
  assert.equal(prevented,!inReminder,'Reminder swipe must remain available for native carousel scrolling');
 }
 console.log('PASS '+file+': syntax, monthly category totals, thresholds, multiple/custom/zero limits, limit updates, no Analytics/demo code');
}
