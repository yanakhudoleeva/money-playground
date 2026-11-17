(() => {
  const frame = document.querySelector('#limits-scenario-frame');
  if (!frame) return;

  const base = new URL('app-reference/dist/', location.href).href;
  const bootstrap = `window.demoStage=3;
const values=new Map();window.demoStorage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)};
demoStorage.setItem('money-playground.clean-start.v3','done');
demoStorage.setItem('money-playground.personal-plan.v1',JSON.stringify({goal:'Custom',customGoalName:'Summer in Ibiza ☀️',goalAmount:'1200',currency:'EUR',income:'5000',rent:'2500',incomeRows:[],expenseRows:[],onboardingLimits:[],piggyOverrides:{openingSavedCents:42000,openingSavedSpecified:true}}));
const now=new Date();const date=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
demoStorage.setItem('money-playground-spending-v2',JSON.stringify({expenses:[{id:'demo-transport',category:'transport',amount:27300,date},{id:'demo-fun',category:'fun',amount:32500,date}],selected:['shopping','transport','fun'],custom:[]}));
demoStorage.setItem('money-playground.category-budgets.v1',JSON.stringify([{id:'shopping',name:'Shopping',limitCents:40000,locked:false},{id:'transport',name:'Transport',limitCents:30000,locked:false},{id:'fun',name:'Fun & Entertainment',limitCents:26000,locked:false}]));`;

  fetch(base + 'limits-example.html')
    .then(response => response.ok ? response.text() : Promise.reject(new Error('Could not load limits preview.')))
    .then(html => {
      html = html.replace(/<script src="limits-bootstrap[^>]*><\/script>/, '<script>' + bootstrap + '</script>');
      frame.addEventListener('load', () => {
        const doc = frame.contentDocument;
        doc.querySelector('[data-tab="limits"]')?.click();
        const style = doc.createElement('style');
        style.textContent = `
          html,body,#piggy-onboarding,#piggy-onboarding .on-result{background:#000!important;overflow:hidden!important}
          #piggy-onboarding .on-result .sp-page[aria-label="My Limits"]{background:#000!important;padding:0!important;zoom:1!important;overflow:hidden!important}
          #piggy-onboarding .on-result .sp-page[aria-label="My Limits"] h1,
          #piggy-onboarding .on-result .sp-page[aria-label="My Limits"] .sp-head,
          #piggy-onboarding .on-result .sp-page[aria-label="My Limits"] button,
          #piggy-onboarding .on-result .sp-page[aria-label="My Limits"] .sp-limit-saving-preview{display:none!important}
          #piggy-onboarding .on-result .sp-page[aria-label="My Limits"] [data-limits-forecast]{display:flex!important;align-items:center!important;margin:0 0 10px!important;padding:14px!important;border:1px solid #404040!important;border-radius:18px!important;background:#292929!important;min-height:90px}
          #piggy-onboarding .sp-limits-forecast-copy{font-size:12px!important;line-height:1.4!important}
          #piggy-onboarding .sp-limits-forecast-copy strong{color:#a7ff27!important;font-size:22px!important;white-space:nowrap}
          #piggy-onboarding .sp-limits-forecast-icon{width:42px!important;height:50px!important;flex:0 0 42px!important}
          #piggy-onboarding .sp-limits-forecast-icon img{width:100%!important;height:100%!important;object-fit:contain!important}
          #piggy-onboarding .on-result .sp-page[aria-label="My Limits"] .sp-limit-card{padding:12px!important;border-radius:18px!important;background:#292929!important;border:1px solid #404040!important;transform:none!important}
          #piggy-onboarding .on-result .sp-page[aria-label="My Limits"] .sp-icon{width:38px!important;height:38px!important;border-radius:13px!important}
          #piggy-onboarding .on-result .sp-page[aria-label="My Limits"] .sp-limit-card-title{font-size:16px!important}
          #piggy-onboarding .sp-limit-card-balance{margin-top:8px!important}
          #piggy-onboarding .sp-limit-card-balance strong{font-size:25px!important}
          #piggy-onboarding .sp-limit-inline-range{height:18px!important;margin-top:8px!important;cursor:ew-resize!important;touch-action:pan-y}
          #piggy-onboarding .on-result .sp-page[aria-label="My Limits"] .sp-limit-swipe,
          #piggy-onboarding .on-result .sp-page[aria-label="My Limits"] [data-limit-card]{display:block!important}
          #piggy-onboarding .on-result .sp-page[aria-label="My Limits"] .sp-limit-card-bottom{display:flex!important;margin-top:5px!important;font-size:11px!important}
          #piggy-onboarding .sp-limit-list{gap:10px!important}
          #piggy-onboarding [data-limit-card="shopping"] .sp-icon{background:#ff4d8d!important;box-shadow:0 4px 0 #9e204d!important}
          #piggy-onboarding [data-limit-card="transport"] .sp-icon{background:#28dce9!important;box-shadow:0 4px 0 #16818b!important}
          #piggy-onboarding [data-limit-card="transport"] .sp-limit-card-meter i{background:#ffad53!important}
          #piggy-onboarding [data-limit-card="transport"] .sp-limit-card-bottom{color:#ffd0a1!important}
          #piggy-onboarding [data-limit-card="fun"] .sp-icon{background:#b58cff!important;box-shadow:0 4px 0 #6a459d!important}`;
        doc.head.append(style);
        const forecastPig = doc.querySelector('.sp-limits-forecast-icon img');
        if (forecastPig) forecastPig.src = new URL('assets/piggy-forecast-adviser.png', location.href).href;
        const shoppingIcon = doc.querySelector('[data-limit-card="shopping"] .sp-icon img');
        if (shoppingIcon) shoppingIcon.src = base + 'assets/category-icons/Shopping.svg';
      }, {once:true});
      frame.srcdoc = '<base href="' + base + '">' + html;
    })
    .catch(() => { frame.title = 'Limits preview unavailable'; });
})();
