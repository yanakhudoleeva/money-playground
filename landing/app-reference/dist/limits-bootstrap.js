// These walkthroughs never read or write the visitor's app data.
window.demoStage = Number(new URLSearchParams(location.search).get('stage') || 1);
// Keep app focus changes inside the phone from scrolling the landing page.
const nativeFocus = HTMLElement.prototype.focus;
HTMLElement.prototype.focus = function(options) { nativeFocus.call(this, {...options, preventScroll:true}); };
Element.prototype.scrollIntoView = function() {};
const demoValues = new Map([['money-playground.clean-start.v3', 'done']]);
window.demoStorage = {
  getItem: key => demoValues.get(key) ?? null,
  setItem: (key, value) => demoValues.set(key, String(value)),
  removeItem: key => demoValues.delete(key)
};
if (demoStage > 1) {
  demoStorage.setItem('money-playground.personal-plan.v1', JSON.stringify({
    goal:'Travel', goalAmount:'1500', currency:'EUR', income:'2400', rent:'850',
    incomeRows:[], expenseRows:[], onboardingLimits:[]
  }));
}
if (demoStage >= 3) {
  const date = new Date();
  const today = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  demoStorage.setItem('money-playground-spending-v2', JSON.stringify({
    expenses:(demoStage === 4 ? [['groceries',14200],['eating',6800],['transport',3200],['shopping',9500]] : [['groceries',4200]]).map(([category,amount],i)=>({id:'demo-'+i,category,amount,date:today})),
    selected:['groceries'], custom:[]
  }));
}

window.demoStorage.setItem('money-playground.category-budgets.v1',JSON.stringify([
{id:'groceries',name:'Groceries',limitCents:40000,locked:true},
{id:'shopping',name:'Shopping',limitCents:20000,locked:true},
{id:'transport',name:'Transport',limitCents:12000,locked:true}
]));
