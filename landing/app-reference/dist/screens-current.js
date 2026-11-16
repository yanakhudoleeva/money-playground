requestAnimationFrame(()=>requestAnimationFrame(()=>{
if(demoStage>1)document.querySelector('[data-tab="'+(demoStage===4?'analytics':'spending')+'"]').click();
if(demoStage===2){document.querySelector('[data-quick-picker-category="groceries"]')?.click();document.querySelector('[data-key="4"]')?.click();document.querySelector('[data-key="2"]')?.click();}
scrollTo(0,0);
}));