(()=>{
  const monthKey=date=>date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0');
  const cents=value=>{const number=Number(String(value||'').replace(/[^0-9,.-]/g,'').replace(',','.'));return Number.isFinite(number)?Math.round(number*100):0};
  const money=value=>new Intl.NumberFormat('en',{style:'currency',currency:'EUR',minimumFractionDigits:2}).format(Math.max(0,value)/100).replace(/\u00a0/g,' ');
  function updateGuide(){
    const panel=document.querySelector('[data-spending-plan]'),bank=document.querySelector('#piggy-bank-plan');if(!panel||!bank||bank.dataset.incomeEntered==='false')return;
    const now=new Date(),period=monthKey(now),lastDay=new Date(now.getFullYear(),now.getMonth()+1,0).getDate(),daysLeft=Math.max(1,lastDay-now.getDate()+1),income=cents(bank.querySelector('#pb-income')?.value),fixed=[...bank.querySelectorAll('.pb-expenses input')].reduce((sum,input)=>sum+cents(input.value),cents(bank.querySelector('#pb-housing')?.value));
    let data={};try{data=JSON.parse(localStorage.getItem('money-playground-spending-v2')||'{}')}catch(_){}
    const spent=(data.expenses||[]).filter(item=>item.date?.slice(0,7)===period).reduce((sum,item)=>sum+Number(item.amount||0),0),reserved=(data.piggyAdjustments||[]).filter(item=>item.budgetPeriod===period).reduce((sum,item)=>sum+Number(item.amount||0),0)+(data.piggyTransfers||[]).filter(item=>item.period===period).reduce((sum,item)=>sum+Number(item.amount||0),0),available=income-fixed-spent-reserved,safeToday=Math.max(0,Math.floor(available/daysLeft)),weekday=(now.getDay()+6)%7,weekDaysLeft=7-weekday,weekBudget=Math.max(0,Math.min(available,safeToday*weekDaysLeft)),over=available<0;
    panel.innerHTML='<section class="sp-guidance '+(over?'is-over':'')+'" aria-label="Dynamic spending guide"><div class="sp-guidance-head"><span>YOUR SPENDING GUIDE</span><small>Updates after every expense</small></div><div class="sp-guidance-cards"><article><span>Safe to spend today</span><strong>'+money(safeToday)+'</strong><small>'+ (over?'Your monthly budget is already exceeded.':'Based on '+daysLeft+' day'+(daysLeft===1?'':'s')+' left this month.') +'</small></article><article><span>This week’s budget</span><strong>'+money(weekBudget)+'</strong><small>'+ (over?'Add income or adjust expenses to reset the plan.':weekDaysLeft+' day'+(weekDaysLeft===1?'':'s')+' left this week.') +'</small></article></div><p class="sp-guidance-note">'+(over?'You are '+money(Math.abs(available))+' over your monthly plan.':'If you spend less today, tomorrow’s safe amount increases automatically.')+'</p></section>';
  }
  const queue=()=>requestAnimationFrame(updateGuide);
  window.addEventListener('money-playground-spending-updated',queue);
  window.addEventListener('money-playground-plan-updated',queue);
  document.addEventListener('input',event=>{if(event.target.closest('#piggy-bank-plan'))queue()},true);
  document.addEventListener('click',queue,true);
  requestAnimationFrame(updateGuide);
})();
