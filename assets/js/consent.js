/* Consentimiento de cookies + analítica (TuWebPronto).
   Base: consent.js de Dr. Carballo (cookie propia, UI con APIs DOM, sin <script> en línea)
       + cookies-analytics.html del kit Oros (Google Consent Mode, GA4, Clarity, borrado de cookies al rechazar,
         eventos click_whatsapp / click_llamar / click_como_llegar / click_resenas_google / generate_lead).
   Configuración por atributos data- del <script>: data-ga, data-clarity, data-pixel, data-policy.
   Si no hay ningún ID configurado no se muestra el banner (no hay nada que consentir) y no se carga ningún tercero.
   Los eventos NUNCA llevan datos personales ni de salud (solo "ubicacion", "formulario" e "idioma"). */
(function () {
  'use strict';
  var me = document.currentScript;
  var attr = function (n) { return (me && me.getAttribute(n)) || ''; };
  var GA = attr('data-ga'), CLARITY = attr('data-clarity'), PIXEL = attr('data-pixel'), POLICY = attr('data-policy') || '/politica-de-cookies/';
  var EN = (document.documentElement.lang || '').indexOf('en') === 0;
  var COOKIE = 'site_consent', VERSION = '1', DAYS = 180;
  var ANALYTICS = !!(GA || CLARITY), ADS = !!PIXEL, ANY = ANALYTICS || ADS;
  var debug = /[?&]ga_debug=1/.test(location.search);
  var local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) && !debug;

  var TXT = EN ? {
    title: 'Cookies on this site', body: 'We use a necessary cookie to remember your choice. With your permission we also use analytics' + (ADS ? ' and advertising' : '') + ' tools to understand, in aggregate, how the site is used. We never send them your name, phone or health information.',
    accept: 'Accept', reject: 'Reject', config: 'Settings', save: 'Save preferences', policy: 'Cookie policy',
    nec: 'Necessary', necD: 'Remembers your cookie choice. Always active.', ana: 'Analytics', anaD: 'Aggregated visits and button use.', adv: 'Advertising', advD: 'Ad campaign measurement (Meta).'
  } : {
    title: 'Cookies en este sitio', body: 'Usamos una cookie necesaria para recordar tu elección. Con tu permiso también usamos herramientas de analítica' + (ADS ? ' y publicidad' : '') + ' para entender, de forma agregada, cómo se usa el sitio. Nunca les enviamos tu nombre, teléfono ni datos de salud.',
    accept: 'Aceptar', reject: 'Rechazar', config: 'Configurar', save: 'Guardar preferencias', policy: 'Política de cookies',
    nec: 'Necesarias', necD: 'Recuerdan tu elección sobre cookies. Siempre activas.', ana: 'Analítica', anaD: 'Visitas y uso de botones, de forma agregada.', adv: 'Publicidad', advD: 'Medición de campañas (Meta).'
  };

  // Google Consent Mode: todo denegado por defecto (kit Oros, bloque A)
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });

  function read() {
    var m = document.cookie.match(/(?:^|;\s*)site_consent=([^;]+)/);
    if (!m) return null;
    var p = decodeURIComponent(m[1]).split('.');
    if (p[0] !== 'v' + VERSION) return null;
    return { analytics: p[1] === 'a1', advertising: p[2] === 'm1' };
  }
  function write(c) {
    var v = 'v' + VERSION + '.' + (c.analytics ? 'a1' : 'a0') + '.' + (c.advertising ? 'm1' : 'm0');
    document.cookie = COOKIE + '=' + encodeURIComponent(v) + '; expires=' + new Date(Date.now() + DAYS * 864e5).toUTCString() + '; path=/; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
  }
  function deleteCookies() {
    var host = location.hostname.split('.'), doms = [''];
    for (var i = 0; i < host.length - 1; i++) doms.push('; domain=.' + host.slice(i).join('.'));
    document.cookie.split(';').forEach(function (c) {
      var n = c.split('=')[0].trim();
      if (/^(_ga|_clck|_clsk|CLID|MUID|_fbp)/.test(n)) doms.forEach(function (d) { document.cookie = n + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + d; });
    });
  }
  var gaOn = false, clOn = false, pxOn = false;
  function loadGA() {
    if (!GA || gaOn || local) return; gaOn = true;
    gtag('consent', 'update', { analytics_storage: 'granted' });
    gtag('js', new Date());
    gtag('config', GA, debug ? { debug_mode: true, allow_google_signals: false } : { allow_google_signals: false, allow_ad_personalization_signals: false });
    var s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA); document.head.appendChild(s);
  }
  function loadClarity() {
    if (!CLARITY || clOn || local) return; clOn = true;
    window.clarity = window.clarity || function () { (window.clarity.q = window.clarity.q || []).push(arguments); };
    var s = document.createElement('script'); s.async = true; s.src = 'https://www.clarity.ms/tag/' + encodeURIComponent(CLARITY); document.head.appendChild(s);
  }
  function loadPixel() {
    if (!PIXEL || pxOn || local) return; pxOn = true;
    var n = window.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    if (!window._fbq) window._fbq = n; n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
    var s = document.createElement('script'); s.async = true; s.src = 'https://connect.facebook.net/en_US/fbevents.js'; document.head.appendChild(s);
    fbq('consent', 'grant'); fbq('init', PIXEL); fbq('track', 'PageView');
  }
  function apply(c) {
    if (c.analytics) { loadGA(); loadClarity(); }
    else { if (gaOn) gtag('consent', 'update', { analytics_storage: 'denied' }); gaOn = false; deleteCookies(); }
    if (c.advertising) loadPixel(); else if (pxOn && window.fbq) fbq('consent', 'revoke');
    window.siteConsent = c;
  }

  // Medición (sin datos personales). Otros scripts llaman window.siteTrack('generate_lead', {...}).
  window.siteTrack = function (name, params) {
    if (gaOn) gtag('event', name, params || {});
    if (pxOn && window.fbq) {
      if (name === 'generate_lead') fbq('track', 'Lead');
      else if (name === 'click_whatsapp' || name === 'click_llamar') fbq('track', 'Contact');
    }
  };
  function where(el) {
    var z = el.closest('[data-zona]');
    if (z) return z.getAttribute('data-zona');
    if (el.closest('header, nav')) return 'menu';
    var sec = el.closest('section[id], footer');
    return sec ? (sec.id || sec.tagName.toLowerCase()) : 'otro';
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (/^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(href)) window.siteTrack('click_whatsapp', { ubicacion: where(a) });
    else if (href.indexOf('tel:') === 0) window.siteTrack('click_llamar', { ubicacion: where(a) });
    else if (/google\.[a-z.]+\/maps\/dir|maps\.app\.goo\.gl/.test(href)) window.siteTrack('click_como_llegar', { ubicacion: where(a) });
    else if (/google\.[a-z.]+\/maps\?cid|g\.page|search\.google\.com\/local/.test(href)) window.siteTrack('click_resenas_google', { ubicacion: where(a) });
  });

  // UI (solo cadenas estáticas, construida con APIs DOM)
  var box;
  function el(tag, attrs, text) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (text) n.textContent = text;
    return n;
  }
  function row(id, label, desc, checked, disabled) {
    var r = el('label', { 'class': 'cc-row', 'for': id });
    var cb = el('input', { type: 'checkbox', id: id }); cb.checked = !!checked; cb.disabled = !!disabled;
    var t = el('span'); t.appendChild(el('strong', null, label)); t.appendChild(el('span', null, desc));
    r.appendChild(cb); r.appendChild(t); return r;
  }
  function close() { if (box) { box.remove(); box = null; } }
  function decide(c) { write(c); apply(c); close(); }
  function show(withSettings) {
    close();
    var cur = read() || { analytics: false, advertising: false };
    box = el('div', { 'class': 'cc', role: 'dialog', 'aria-modal': 'false', 'aria-labelledby': 'cc-title' });
    box.appendChild(el('p', { 'class': 'cc-title', id: 'cc-title' }, TXT.title));
    var body = el('p', null, TXT.body + ' '); body.appendChild(el('a', { href: POLICY }, TXT.policy)); box.appendChild(body);
    var set = el('div'); set.hidden = !withSettings;
    set.appendChild(row('cc-nec', TXT.nec, TXT.necD, true, true));
    if (ANALYTICS) set.appendChild(row('cc-ana', TXT.ana, TXT.anaD, cur.analytics));
    if (ADS) set.appendChild(row('cc-adv', TXT.adv, TXT.advD, cur.advertising));
    box.appendChild(set);
    var btns = el('div', { 'class': 'cc-btns' });
    var bA = el('button', { type: 'button', 'class': 'cc-btn cc-yes' }, TXT.accept);
    var bR = el('button', { type: 'button', 'class': 'cc-btn' }, TXT.reject);
    var bC = el('button', { type: 'button', 'class': 'cc-btn' }, withSettings ? TXT.save : TXT.config);
    bA.addEventListener('click', function () { decide({ analytics: ANALYTICS, advertising: ADS }); });
    bR.addEventListener('click', function () { decide({ analytics: false, advertising: false }); });
    bC.addEventListener('click', function () {
      if (set.hidden) { set.hidden = false; bC.textContent = TXT.save; return; }
      var a = document.getElementById('cc-ana'), m = document.getElementById('cc-adv');
      decide({ analytics: !!(a && a.checked), advertising: !!(m && m.checked) });
    });
    if (!ANY) { bA.hidden = true; bR.hidden = true; bC.textContent = 'OK'; bC.addEventListener('click', close); }
    btns.appendChild(bA); btns.appendChild(bR); btns.appendChild(bC); box.appendChild(btns);
    document.body.appendChild(box);
    (ANY ? bA : bC).focus({ preventScroll: true });
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-cookie-settings]');
    if (t) { e.preventDefault(); show(true); }
  });
  function init() {
    var c = read();
    if (c) apply(c);
    else { window.siteConsent = { analytics: false, advertising: false }; deleteCookies(); if (ANY) show(false); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
