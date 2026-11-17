(() => {
  const root=document.querySelector('.limits-playground');
  const q=s=>root.querySelector(s);
  const categories={groceries:{name:'Groceries',icon:'Groceries',spent:120,limit:300,color:'#a7ff27'},eating:{name:'Eating Out',icon:'Eating_out',spent:65,limit:200,color:'#ff4d8d'},shopping:{name:'Shopping',icon:'Shopping',spent:90,limit:250,color:'#c6a5ff'}};
  let current, spent, limit, locked=false;
  const money=n=>new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR',maximumFractionDigits:Number.isInteger(n)?0:2}).format(n);
  function render(){
    const left=limit-spent;
    q('#limit-left').textContent=money(Math.abs(left));
    q('#limit-status-label').textContent=left<0?'over your limit':'left this month';
    q('#limit-spent').textContent=money(spent)+' spent';
    q('#limit-percent').textContent=Math.max(0,Math.round(left/limit*100))+'% left';
    q('.limit-example-card').classList.toggle('is-over',left<0);
    q('.limit-meter>span').style.width=Math.min(100,spent/limit*100)+'%';
    q('.limit-meter').setAttribute('aria-valuemax',limit);
    q('.limit-meter').setAttribute('aria-valuenow',Math.min(limit,spent));
    q('.limit-meter').setAttribute('aria-valuetext',money(spent)+' spent of '+money(limit));
    q('#limit-value').value=money(limit);
    q('#limit-range').setAttribute('aria-valuetext',money(limit)+' per month');
    q('.limit-editor').hidden=locked;q('#edit-limit').hidden=!locked;
    q('#saved-limit').hidden=!locked;q('#saved-limit').textContent='Monthly limit · '+money(limit);
    q('#add-limit-expense').disabled=!locked;
  }
  function reset(){
    current=categories[q('#limit-category').value];spent=current.spent;limit=current.limit;locked=false;
    q('#limit-range').value=limit;q('#limit-expense').value=42;
    q('#limit-name').textContent=current.name;
    q('#limit-icon').src='app-reference/dist/assets/category-icons/'+current.icon+'.svg';
    q('.limit-category-icon').style.background=current.color;
    q('#limit-feedback').textContent='Set your limit, then try adding an expense.';render();
  }
  q('#limit-category').onchange=reset;
  q('#limit-range').oninput=e=>{limit=Number(e.target.value);render();};
  q('#save-limit').onclick=()=>{locked=true;render();q('#limit-feedback').textContent='Limit set. Add an expense to see what’s left.';};
  q('#edit-limit').onclick=()=>{locked=false;render();q('#limit-feedback').textContent='Adjust your monthly limit and save it.';};
  q('#limit-expense-form').onsubmit=e=>{e.preventDefault();if(!locked||!e.target.reportValidity())return;const amount=Number(q('#limit-expense').value);spent=Math.round((spent+amount)*100)/100;render();q('#limit-feedback').textContent=money(amount)+' added to '+current.name+'. '+(spent>limit?money(spent-limit)+' over your limit. You can adjust it anytime.':money(limit-spent)+' left this month.');};
  q('#reset-limit').onclick=reset;reset();
})();
