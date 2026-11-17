const form = document.querySelector('#waitlist-form');
form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  document.querySelector('#form-status').textContent = 'You’ve tried the signup preview! Your email hasn’t been saved or sent. Launch notifications will be available when signup opens.';
});

// First-screen spacing studies: `?hero=editorial`, `?hero=guided`, or `?hero=compact`.
const hero = new URLSearchParams(window.location.search).get('hero') || 'editorial';
document.documentElement.classList.add(`hero-${['editorial', 'guided', 'compact'].includes(hero) ? hero : 'editorial'}`);

// Small scroll-linked offsets, measured from stationary section anchors.
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const layers = [
  ['.welcome-floating-dollar', '.welcome', 32],
  ['.hero-cutout-dollar img', '.welcome', 13],
  ['.hero-cutout-coin-top img', '.welcome', -10],
  ['.hero-cutout-coin-right img', '.welcome', 11],
  ['.piggy-mascot', '.piggy-example', -12],
  ['.signup-art img', '.waitlist', -12],
  ['.dollar-one', '.waitlist', 20],
  ['.dollar-two', '.waitlist', -16],
  ['.coin-one', '.waitlist', -22],
  ['.coin-two', '.waitlist', 15]
].map(([selector, anchor, strength]) => ({element:document.querySelector(selector), anchor:document.querySelector(anchor), strength})).filter(x=>x.element&&x.anchor);
layers.forEach(({element})=>element.classList.add('parallax-decoration'));
let motionFrame = false;
function updateParallax() {
  motionFrame = false;
  const mobileScale = innerWidth < 701 ? .45 : 1;
  for (const {element,anchor,strength} of layers) {
    const rect = anchor.getBoundingClientRect();
    const progress = anchor.classList.contains('welcome') ? Math.max(0,Math.min(1,-rect.top/rect.height)) : Math.max(-1,Math.min(1,(innerHeight*.5-rect.top-rect.height*.5)/((innerHeight+rect.height)*.5)));
    element.style.setProperty('--parallax-y', `${motionPreference.matches ? 0 : progress*strength*mobileScale}px`);
  }
}
function requestMotionFrame(){if(!motionFrame){motionFrame=true;requestAnimationFrame(updateParallax)}}
addEventListener('scroll',requestMotionFrame,{passive:true});
addEventListener('resize',requestMotionFrame);
addEventListener('load',requestMotionFrame);
motionPreference.addEventListener('change',requestMotionFrame);
updateParallax();
