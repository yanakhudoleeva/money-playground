const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
let timers=new Map(),next=0,events={},nodes=[];
function node(){return {removed:false,cloneNode:()=>node(),addEventListener(type,fn){this.end=fn},remove(){this.removed=true}}}
const initial=node();
vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../mobile/splash/splash.js'),'utf8'),{document:{getElementById:()=>initial,body:{appendChild(n){nodes.push(n)}}},window:{addEventListener(type,fn){events[type]=fn}},setTimeout(fn){timers.set(++next,fn);return next},clearTimeout(id){timers.delete(id)}});
initial.end({target:{}});assert.equal(initial.removed,false);
initial.end({target:initial});assert.equal(initial.removed,true);assert.equal(timers.size,0);
events['money-playground-foreground']();const second=nodes.at(-1);assert.equal(second.removed,false);assert.equal(timers.size,1);
events['money-playground-foreground']();const third=nodes.at(-1);assert.equal(second.removed,true);second.end({target:second});assert.equal(third.removed,false);assert.equal(timers.size,1);
[...timers.values()][0]();assert.equal(third.removed,true);assert.equal(timers.size,0);
console.log('PASS cold launch, foreground replay, duplicate resume, stale event isolation, fallback dismissal');
