const $=s=>document.querySelector(s),duration=12000;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');let playing=!reduced.matches,time=0,prev=null;
const els={widget:$('.widget'),pig:$('.pig'),income:$('.income'),expenses:$('.expenses'),coin:$('.coin-top'),small:$('.coin-small'),cash:$('.cash'),card:$('.payment'),stack:$('.stack')};
function resize(){const r=$('.viewport').getBoundingClientRect();$('.scene').style.setProperty('--scale',Math.min(r.width/(innerWidth<=600?700:1200),r.height/(innerWidth<=600?1000:860))*.96)}
new ResizeObserver(resize).observe($('.viewport'));resize();
function render(ms){const p=ms/duration*Math.PI*2,s=Math.sin(p),c=Math.cos(p);
els.widget.style.transform=`perspective(1800px) translate(${c*5}px,${s*10}px) rotateX(${4+s*1.5}deg) rotateY(${-9+c*2}deg) rotateZ(${-5+s*1.4}deg)`;
els.pig.style.transform=`translateY(${-s*7}px) rotate(${s*3}deg)`;
els.coin.style.transform=`translate(${Math.sin(p)*18}px,${Math.cos(p)*24}px) rotate(${-18+s*12}deg) scaleX(${.68+.32*Math.cos(p*2)})`;
els.small.style.transform=`translate(${-s*15}px,${-c*22}px) rotate(${25-s*15}deg) scaleX(${.75+.25*Math.sin(p*2)})`;
els.cash.style.transform=`translate(${c*13}px,${s*22}px) rotate(${12+s*7}deg)`;
els.card.style.transform=`perspective(900px) translate(${s*13}px,${-c*15}px) rotateY(${-17+s*7}deg) rotate(${-21+s*6}deg)`;
els.stack.style.transform=`translate(${-c*10}px,${s*11}px) rotate(${-8-s*5}deg)`;
$('.glint-a').style.opacity=.25+.5*(s+1)/2;$('.glint-b').style.opacity=.25+.5*(c+1)/2;
$('#timeline').value=ms;
}
function sync(){ $('#play').textContent=playing?'Пауза':'Играть';$('#play').setAttribute('aria-label',playing?'Приостановить анимацию':'Воспроизвести анимацию') }
function tick(now){if(prev!==null&&playing&&!document.hidden)time=(time+Math.min(now-prev,80))%duration;prev=now;render(time);requestAnimationFrame(tick)}
$('#play').onclick=()=>{playing=!playing;sync()};$('#restart').onclick=()=>{time=0;render(time)};$('#timeline').oninput=e=>{playing=false;time=Number(e.target.value);render(time);sync()};
$('#clean').onclick=()=>{document.body.classList.add('clean');$('#restore').hidden=false};$('#restore').onclick=()=>{document.body.classList.remove('clean');$('#restore').hidden=true};document.addEventListener('keydown',e=>{if(e.key==='Escape')$('#restore').click()});reduced.addEventListener('change',e=>{playing=!e.matches;sync()});sync();render(0);requestAnimationFrame(tick);
