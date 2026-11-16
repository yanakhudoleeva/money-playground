(() => {
  const dot = document.createElement('div');
  dot.className = 'demo-touch'; document.body.append(dot);
  function act(action) {
    const element = document.querySelector(action.selector);
    if (!element) throw new Error(`Missing demo target: ${action.selector}`);
    if (action.kind === 'input') {
      element.value = action.value;
      element.dispatchEvent(new Event('input', {bubbles:true}));
      element.dispatchEvent(new Event('change', {bubbles:true}));
    } else {
      const rect = element.getBoundingClientRect();
      dot.style.left = `${rect.x + rect.width/2}px`;
      dot.style.top = `${rect.y + rect.height/2}px`;
      dot.animate([{opacity:0,transform:'translate(-50%,-50%) scale(.8)'},{opacity:.8,offset:.25},{opacity:0,transform:'translate(-50%,-50%) scale(1.4)'}],650);
      element.click();
    }
    document.activeElement?.blur();
  }
  addEventListener('message', event => {
    if (event.source !== parent || event.data?.type !== 'walkthrough-action') return;
    try { act(event.data.action); }
    catch (error) { parent.postMessage({type:'walkthrough-error',stage:demoStage,message:error.message},location.origin); }
  });
  requestAnimationFrame(() => requestAnimationFrame(() => {
    if (demoStage > 1) document.querySelector(`[data-tab="${demoStage === 2 ? 'spending' : 'bank'}"]`)?.click();
    scrollTo(0,0);
    parent.postMessage({type:'walkthrough-ready',stage:demoStage},location.origin);
  }));
})();
