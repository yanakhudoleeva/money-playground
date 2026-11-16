const piggyFrame = document.querySelector('.piggy-example iframe');
const piggyStage = document.querySelector('.piggy-playground');
let depositTimer;
window.addEventListener('message', (event) => {
  if (event.origin !== location.origin || event.source !== piggyFrame.contentWindow || event.data?.type !== 'piggy-demo-update') return;
  const added = event.data.action === 'add';
  document.querySelector('.piggy-feedback').textContent = added ? `${event.data.amount} closer to your goal.` : `${event.data.amount} taken out. Your goal is up to date.`;
  piggyStage.classList.remove('is-depositing');
  clearTimeout(depositTimer);
  if (added) {
    void piggyStage.offsetWidth;
    piggyStage.classList.add('is-depositing');
    depositTimer = setTimeout(() => piggyStage.classList.remove('is-depositing'), 1500);
  }
});
piggyFrame.addEventListener('load', () => {
  const doc = piggyFrame.contentDocument;
  const update = () => {
    const overlay = doc.querySelector('.sp-overlay');
    piggyFrame.parentElement.classList.toggle('is-editing', !!overlay && !overlay.hidden && getComputedStyle(overlay).display !== 'none');
  };
  new MutationObserver(update).observe(doc.body, {subtree:true, childList:true, attributes:true, attributeFilter:['hidden','class']});
  update();
});
