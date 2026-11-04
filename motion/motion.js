/* Silverback / TuWebPronto · Kit de motion (sin librerías). Ver CATALOGO.md. */
(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
  // palabras: partir el texto en palabras
  if(!reduce)$$('[data-m~="palabras"]').forEach(function(el){
    var i=0,w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),ns=[];while(w.nextNode())ns.push(w.currentNode);
    ns.forEach(function(n){var f=document.createDocumentFragment();n.textContent.split(/(\s+)/).forEach(function(p){
      if(!p)return;if(/^\s+$/.test(p)){f.appendChild(document.createTextNode(p));return}
      var o=document.createElement('span'),s=document.createElement('span');o.className='m-w';s.textContent=p;s.style.setProperty('--m-wd',(i++*.06)+'s');o.appendChild(s);f.appendChild(o)});
      n.parentNode.replaceChild(f,n)});
  });
  // dibujar: medir trazos
  $$('[data-m~="dibujar"] path').forEach(function(p){try{p.style.setProperty('--m-len',Math.ceil(p.getTotalLength()))}catch(e){}});
  // avance
  var bars=$$('[data-m~="avance"]'),par=$$('[data-vel]'),tick=false;
  function frame(){tick=false;var h=document.documentElement.scrollHeight-innerHeight;
    bars.forEach(function(b){b.style.setProperty('--m-p',h>0?Math.min(1,scrollY/h):0)});
    if(!reduce&&innerWidth>=700)par.forEach(function(el){var r=el.getBoundingClientRect(),c=(r.top+r.height/2-innerHeight/2);el.style.translate='0 '+(c*parseFloat(el.dataset.vel)).toFixed(1)+'px'});}
  addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(frame)}},{passive:true});frame();
  if(reduce||!('IntersectionObserver' in window))return;
  // revelados: solo lo que está fuera de pantalla al cargar (lo visible al abrir nunca se oculta)
  var sel='[data-m~="enfoque"],[data-m~="palabras"],[data-m~="linea"],[data-m~="dibujar"],[data-m~="cortina"]',grupos=new Map();
  $$(sel).forEach(function(el){
    if(el.getBoundingClientRect().top<innerHeight)return;
    var p=el.closest('[data-m~="cascada"]')||el.parentElement,i=grupos.get(p)||0;grupos.set(p,i+1);
    el.style.setProperty('--m-d',Math.min(i,6)*.08+'s');el.classList.add('m-pre');
  });
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.remove('m-pre');io.unobserve(e.target)}})},{rootMargin:'0px 0px -10% 0px'});
  $$('.m-pre').forEach(function(el){io.observe(el)});
  // contador: data-hasta="15" data-prefijo="+" data-sufijo=" años"
  $$('[data-m~="contador"]').forEach(function(el){
    var hasta=parseFloat(el.dataset.hasta),pre=el.dataset.prefijo||'',suf=el.dataset.sufijo||'';if(isNaN(hasta))return;
    if(el.getBoundingClientRect().top<innerHeight)return;
    new IntersectionObserver(function(es,o){if(!es[0].isIntersecting)return;o.disconnect();var t0=performance.now();
      (function f(t){var k=Math.min(1,(t-t0)/1200),v=Math.round(hasta*(1-Math.pow(1-k,3)));el.textContent=pre+v.toLocaleString('en-US')+suf;if(k<1)requestAnimationFrame(f)})(t0)},{threshold:.6}).observe(el);
  });
  // inclinar: solo con mouse
  if(matchMedia('(hover: hover) and (pointer: fine)').matches)$$('[data-m~="inclinar"]').forEach(function(el){
    el.addEventListener('pointermove',function(e){var r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      el.style.setProperty('--m-ry',(x*12)+'deg');el.style.setProperty('--m-rx',(-y*8)+'deg')});
    el.addEventListener('pointerleave',function(){el.style.removeProperty('--m-ry');el.style.removeProperty('--m-rx')});
  });
})();
