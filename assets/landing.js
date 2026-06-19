/* ============================================================
   J&Co — JS compartido para las páginas de servicio (landing)
   Nav, menú móvil, Cal.com, revelado al scroll (con respaldo).
   ============================================================ */

/* Cal.com embed */
(function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if(typeof namespace === "string"){cal.ns[namespace] = cal.ns[namespace] || api;p(cal.ns[namespace], ar);p(cal, ["initNamespace", namespace]);} else p(cal, ar); return;} p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");
Cal("init", {origin:"https://cal.com"});
Cal("ui", {"hideEventTypeDetails":false,"layout":"month_view"});

(function(){
  /* año */
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* nav: fondo al hacer scroll */
  const nav = document.getElementById('nav');
  if (nav){
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, {passive:true});
  }

  /* menú móvil */
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (toggle && links){
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    });
    links.querySelectorAll('a, button').forEach(el => el.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.classList.remove('open');
    }));
  }

  /* revelado al scroll + respaldo manual (entornos donde IO no dispara) */
  const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveals = Array.from(document.querySelectorAll('.reveal'));
  if (RM){ reveals.forEach(el=>el.classList.add('in')); return; }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, {threshold:0.12, rootMargin:'0px 0px -8% 0px'});
  reveals.forEach(el => io.observe(el));

  const inView = el => {
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    return r.top < vh * 0.92 && r.bottom > vh * 0.08;
  };
  /* respaldo directo (sin requestAnimationFrame) por si el IO no dispara */
  let last = 0;
  const pass = () => { reveals.forEach(e => { if (inView(e)) e.classList.add('in'); }); };
  const schedule = () => { const n = Date.now(); if (n - last > 80){ last = n; pass(); } };
  pass();
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', () => pass(), {passive:true});
  window.addEventListener('load', () => { pass(); setTimeout(pass, 200); });
  setTimeout(pass, 60); setTimeout(pass, 400); setTimeout(pass, 1000);
  /* última red de seguridad: jamás dejar contenido oculto */
  setTimeout(() => reveals.forEach(e => { if (inView(e)) e.classList.add('in'); }), 1800);

  /* ---- Parallax sutil (hero + bandas de imagen) ---- */
  const pxEls = Array.from(document.querySelectorAll('[data-parallax]'));
  if (!pxEls.length) return;
  let ticking = false;
  const runPx = () => {
    ticking = false;
    const vh = window.innerHeight;
    for (const el of pxEls){
      const r = el.getBoundingClientRect();
      if (r.bottom < -80 || r.top > vh + 80) continue;
      const sp = parseFloat(el.getAttribute('data-parallax')) || 0.1;
      const mid = (r.top + r.height / 2) - vh / 2;
      const max = r.height * 0.1;
      let off = -mid * sp;
      if (off > max) off = max; else if (off < -max) off = -max;
      el.style.transform = 'translateY(calc(-50% + ' + off.toFixed(1) + 'px))';
    }
  };
  const onPx = () => { if (!ticking){ ticking = true; requestAnimationFrame(runPx); } };
  runPx();
  window.addEventListener('scroll', onPx, {passive:true});
  window.addEventListener('resize', onPx);
})();
