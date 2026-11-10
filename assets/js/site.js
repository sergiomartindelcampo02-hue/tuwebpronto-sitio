/* Interacción del sitio (TuWebPronto). Base: main.js + motion.js de Dentissimo.
   Sin innerHTML con datos del usuario; sin manejadores en línea (la CSP no permite scripts en línea). */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;

  // Header con fondo al hacer scroll
  var header = doc.querySelector('.site-header');
  var onScroll = function () { if (header) header.classList.toggle('scrolled', window.scrollY > 30); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Menú de pantalla completa
  var toggle = doc.querySelector('.menu-toggle'), menu = doc.getElementById('site-menu');
  var setMenu = function (open) {
    if (!menu) return;
    doc.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    if (open) { var f = menu.querySelector('a'); if (f) f.focus(); } else if (toggle) toggle.focus({ preventScroll: true });
  };
  if (toggle) toggle.addEventListener('click', function () { setMenu(!doc.body.classList.contains('menu-open')); });
  if (menu) menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { doc.body.classList.remove('menu-open'); toggle.setAttribute('aria-expanded', 'false'); menu.hidden = true; }); });
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && doc.body.classList.contains('menu-open')) setMenu(false); });

  // Horario: resalta el día de hoy (hora de Mexicali / Tijuana)
  try {
    var dias = ['do', 'lu', 'ma', 'mi', 'ju', 'vi', 'sa'];
    var wd = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Tijuana', weekday: 'short' }).format(new Date());
    var hoy = dias[['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(wd)];
    doc.querySelectorAll('.horas tr[data-dias]').forEach(function (tr) {
      if ((' ' + tr.getAttribute('data-dias') + ' ').indexOf(' ' + hoy + ' ') > -1) {
        tr.classList.add('hoy');
        var lbl = doc.querySelector('[data-hoy-label]'), hrs = doc.querySelector('[data-hoy-horas]');
        if (lbl && hrs) { lbl.textContent = (root.lang.indexOf('en') === 0 ? 'Today' : 'Hoy'); hrs.textContent = tr.querySelector('td').textContent; }
      }
    });
  } catch (err) { /* sin Intl: se queda el horario general */ }

  // FAQ: una respuesta abierta a la vez
  var faqs = doc.querySelectorAll('.faq-item');
  faqs.forEach(function (it) { it.addEventListener('toggle', function () { if (it.open) faqs.forEach(function (o) { if (o !== it && o.closest('.faq') === it.closest('.faq')) o.open = false; }); }); });

  // Mapa: se carga solo cuando la persona lo pide (patrón Dr. Carballo)
  doc.querySelectorAll('[data-map-load]').forEach(function (b) {
    b.addEventListener('click', function () {
      var box = b.closest('.map');
      var f = doc.createElement('iframe');
      f.src = box.getAttribute('data-map-src'); f.title = box.getAttribute('data-map-title');
      f.loading = 'lazy'; f.referrerPolicy = 'strict-origin-when-cross-origin'; f.allowFullscreen = true;
      box.textContent = ''; box.appendChild(f);
      if (window.siteTrack) window.siteTrack('ver_mapa', { ubicacion: 'ubicacion' });
    });
  });

  // Formulario (Netlify Forms): valida, envía sin salir de la página y muestra confirmación.
  doc.querySelectorAll('.appt-form').forEach(function (form) {
    var status = form.querySelector('.appt-status');
    var req = [].slice.call(form.querySelectorAll('input[required], input[type=email]'));
    var check = function (el) {
      var ok = el.type === 'checkbox' ? el.checked : (el.value.trim() === '' ? !el.required : el.checkValidity());
      if (el.type === 'tel' && ok) ok = el.value.replace(/\D/g, '').length >= 10;
      if (el.type === 'checkbox') form.classList.toggle('consent-invalid', !ok);
      else el.closest('.field').classList.toggle('invalid', !ok);
      el.setAttribute('aria-invalid', String(!ok));
      return ok;
    };
    req.forEach(function (el) { el.addEventListener(el.type === 'checkbox' ? 'change' : 'blur', function () { check(el); }); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = req.filter(function (el) { return !check(el); });
      if (bad.length) { bad[0].focus(); return; }
      var btn = form.querySelector('.appt-submit');
      btn.disabled = true; status.textContent = form.getAttribute('data-enviando');
      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(new FormData(form)).toString() })
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          form.hidden = true;
          var ok = form.parentElement.querySelector('.appt-success');
          ok.hidden = false; ok.focus();
          if (window.siteTrack) window.siteTrack('generate_lead', { formulario: 'contacto', idioma: root.lang.slice(0, 2) });
        })
        .catch(function () {
          status.textContent = form.getAttribute('data-err-red') + ' ';
          var a = doc.createElement('a'); a.href = 'tel:' + form.getAttribute('data-tel'); a.textContent = form.getAttribute('data-tel-txt');
          status.appendChild(a); btn.disabled = false;
        });
    });
  });

  // WhatsApp flotante: se oculta mientras el formulario está en pantalla (no tapa el botón de enviar)
  var wa = doc.querySelector('.wa-float'), contacto = doc.getElementById('contacto');
  if (wa && contacto && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { wa.classList.toggle('wa-hide', en[0].isIntersecting); }, { threshold: 0.12 }).observe(contacto);
  }

  // Motion (Dentissimo): revelado escalonado, títulos con máscara, barra de progreso, parallax decorativo
  if (!root.classList.contains('motion') || !('IntersectionObserver' in window)) return;
  var sel = '.section-head, .svc-card, .svc-row, .checklist li, .steps li, .facts, .pilar, .faq-item, .info-list > li, .map, .appt-card, .final-copy, .doc-card, .review, .about-photo, .toc, .prose section, .aside-card, .related li';
  doc.querySelectorAll(sel).forEach(function (n) { if (!n.closest('.hero')) n.classList.add('reveal'); });
  var parents = new Set([].map.call(doc.querySelectorAll('.reveal'), function (n) { return n.parentElement; }));
  parents.forEach(function (p) { [].filter.call(p.children, function (c) { return c.classList.contains('reveal'); }).forEach(function (n, i) { n.style.setProperty('--d', Math.min(i, 6) * 80 + 'ms'); }); });
  doc.querySelectorAll('.section .title, .final-cta .title').forEach(function (t) { t.classList.add('title-anim'); });
  var io = new IntersectionObserver(function (ens) {
    ens.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
  doc.querySelectorAll('.reveal, .title-anim').forEach(function (n) { io.observe(n); });
  // Si algo quedó oculto (pestaña en segundo plano, impresión), se muestra todo a los 4 s
  setTimeout(function () { doc.querySelectorAll('.reveal:not(.in), .title-anim:not(.in)').forEach(function (n) { n.classList.add('in'); }); }, 4000);

  var bar = doc.createElement('div'); bar.className = 'scroll-progress'; bar.setAttribute('aria-hidden', 'true');
  if (header) header.appendChild(bar);
  var para = [].map.call(doc.querySelectorAll('.hero-mark, .hero-glow'), function (n) { return { n: n, f: n.classList.contains('hero-mark') ? 0.16 : 0.08 }; });
  var ticking = false;
  var update = function () {
    ticking = false;
    var vh = window.innerHeight, max = root.scrollHeight - vh;
    bar.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
    para.forEach(function (p) { var r = p.n.getBoundingClientRect(); p.n.style.setProperty('--py', ((r.top + r.height / 2 - vh / 2) * -p.f).toFixed(1) + 'px'); });
  };
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
})();
