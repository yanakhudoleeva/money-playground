(() => {
  const section = document.querySelector('#how-it-works');
  const phones = [...section.querySelectorAll('.how-phone')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const controls = document.createElement('div');
  controls.className = 'demo-controls';
  controls.innerHTML = '<span class="demo-caption">A little tour of the app</span><button type="button" class="demo-toggle">Pause demo</button><button type="button" class="demo-replay">Replay ↻</button>';
  section.querySelector('.how-demo-note').before(controls);
  const toggle = controls.querySelector('.demo-toggle');
  const caption = controls.querySelector('.demo-caption');
  let paused = reduced.matches, visible = false, time = 0, index = 0, ready = new Set(), finished = false;
  const frames = phones.map((phone, i) => {
    const screen = document.createElement('div'); screen.className = 'demo-screen';
    const frame = document.createElement('iframe');
    frame.title = ['Goal and monthly plan demonstration','Adding an expense demonstration','Savings goal demonstration'][i];
    frame.tabIndex = -1; frame.setAttribute('aria-hidden','true'); frame.setAttribute('inert','');
    screen.append(frame); phone.append(screen);
    new ResizeObserver(() => {
      const scale = screen.clientWidth / 430;
      frame.style.height = `${screen.clientHeight / scale}px`;
      frame.style.transform = `scale(${scale})`;
    }).observe(screen);
    return frame;
  });
  const visiblePhones = new Set();
  const phoneObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    const i = phones.indexOf(entry.target);
    if(entry.isIntersecting) visiblePhones.add(i); else visiblePhones.delete(i);
  }), {threshold:.5});
  phones.forEach(phone=>phoneObserver.observe(phone));
  const events = [];
  const cue = (at, stage, text) => events.push({at,stage,text});
  const click = (at, stage, selector) => events.push({at,stage,action:{selector,kind:'click'}});
  const type = (at, stage, selector, value) => [...value].forEach((_,i) => events.push({at:at+i*.3,stage,action:{selector,kind:'input',value:value.slice(0,i+1)}}));
  cue(0,1,'Choose something to save for');
  click(2,1,'[data-goal="Travel"]'); click(3.5,1,'[data-next="1"]');
  cue(4,1,'Give your goal a target'); type(5,1,'#on-goal-amount','1500'); click(7.5,1,'[data-next="2"]');
  cue(8,1,'Add monthly income and fixed expenses');
  click(9,1,'[aria-controls="on-income-details"]'); type(10,1,'#on-income-amount','2400');
  click(12,1,'[aria-controls="on-income-details"]'); click(13,1,'[aria-controls="on-expenses-details"]');
  type(14,1,'#on-rent-amount','850'); click(16,1,'[aria-controls="on-expenses-details"]');
  click(18,1,'[data-next="3"]');
  cue(21,2,'Choose a category for your spending'); click(22,2,'[data-all-quick-categories]');
  click(24,2,'[data-quick-picker-category="groceries"]');
  cue(25,2,'Enter €42 and add the expense'); click(26,2,'[data-key="4"]'); click(26.8,2,'[data-key="2"]'); click(28.5,2,'[data-key="save"]');
  cue(30,2,'Your balance updates automatically');
  cue(33,3,'See your plan and savings outlook');
  click(36,3,'[data-savings-action="add"]'); cue(36,3,'Set aside €100 for your goal');
  type(38,3,'#pb-savings-amount','100'); click(41,3,'[data-savings-form] [type="submit"]');
  cue(43,3,'A little closer to your goal');
  events.sort((a,b)=>a.at-b.at);
  function state() { toggle.textContent = finished ? 'Play again' : paused ? 'Play demo' : 'Pause demo'; }
  function reset() {
    ready.clear(); time=0; index=0; finished=false;
    phones.forEach(p=>p.classList.remove('demo-ready'));
    frames.forEach((frame,i)=>frame.src=`app-reference/dist/demo.html?stage=${i+1}&run=${Date.now()}`);
    state();
  }
  addEventListener('message', event => {
    const i = frames.findIndex(frame=>frame.contentWindow === event.source);
    if (i < 0 || event.origin !== location.origin) return;
    if (event.data?.type === 'walkthrough-ready') {ready.add(i);phones[i].classList.add('demo-ready');}
    if (event.data?.type === 'walkthrough-error') {
      paused=true; state(); caption.textContent='Demo paused — replay to start again';
      console.error(event.data.message);
    }
  });
  toggle.onclick = () => {if(finished){paused=false;reset();}else{paused=!paused;state();}};
  controls.querySelector('.demo-replay').onclick=()=>{paused=false;reset();};
  reduced.addEventListener('change',()=>{if(reduced.matches){paused=true;state();}});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;},{threshold:.1}).observe(section);
  let last = performance.now();
  function tick(now) {
    const delta=Math.min((now-last)/1000,.1);last=now;
    const nextStage = events[index]?.stage || 3;
    const mobileCanPlay = innerWidth > 700 || visiblePhones.has(nextStage-1);
    if(!paused && !finished && visible && mobileCanPlay && !document.hidden && ready.size===3) {
      time+=delta;
      while(index<events.length && events[index].at<=time) {
        const event=events[index++];
        if(event.text){caption.textContent=event.text;phones.forEach((p,i)=>p.closest('.how-step').classList.toggle('demo-active',i===event.stage-1));}
        if(event.action)frames[event.stage-1].contentWindow.postMessage({type:'walkthrough-action',action:event.action},location.origin);
      }
      if(time>48){finished=true;caption.textContent='Your money, step by step.';section.querySelectorAll('.demo-active').forEach(el=>el.classList.remove('demo-active'));state();}
    }
    requestAnimationFrame(tick);
  }
  reset(); requestAnimationFrame(tick);
})();
