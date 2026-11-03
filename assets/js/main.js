/* Tim Karani — core behaviour shared by every page.
   Heavy, page-specific scenes live in scenes.js and are loaded on demand. */

window.__tkReady = true;

const root = document.documentElement;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

export const motion = {
  get reduced() { return root.classList.contains('reduce-motion'); },
  listeners: new Set(),
  set(on) {
    root.classList.toggle('reduce-motion', !on);
    root.classList.toggle('motion-forced', on);
    try { localStorage.setItem('tk-motion', on ? 'on' : 'off'); } catch (e) {}
    this.listeners.forEach((fn) => fn(on));
  },
};

/* ---------------------------------------------------------------- Motion toggle */
function initMotionToggle() {
  const btn = $('[data-motion-toggle]');
  if (!btn) return;
  const sync = () => {
    const on = !motion.reduced;
    btn.setAttribute('aria-pressed', String(on));
    btn.textContent = on ? 'Motion: on' : 'Motion: off';
  };
  sync();
  btn.addEventListener('click', () => { motion.set(motion.reduced); sync(); if (motion.reduced) revealAll(); });
}

/* ---------------------------------------------------------------- Reveal on scroll */
let revealIO;
function revealAll() { $$('[data-reveal]').forEach((el) => el.classList.add('is-in')); }
function initReveals() {
  const els = $$('[data-reveal]');
  if (motion.reduced || !('IntersectionObserver' in window)) return revealAll();
  revealIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); revealIO.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });
  els.forEach((el) => revealIO.observe(el));
}

/* ---------------------------------------------------------------- Navigation */
function initNav() {
  const nav = $('#top-nav');
  const numEl = $('[data-chapter-num]');
  const nameEl = $('[data-chapter-name]');
  const links = $$('.nav-links a');
  const chapters = $$('[data-chapter]');

  if (chapters.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        if (numEl) numEl.textContent = el.dataset.chapter;
        if (nameEl) nameEl.textContent = el.dataset.chapterLabel;
        links.forEach((a) => a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + el.id)));
      });
    }, { rootMargin: '-45% 0px -54% 0px' });
    chapters.forEach((c) => io.observe(c));
    // Key light per chapter
    const lightIO = new IntersectionObserver((entries) => entries.forEach((e) => e.target.classList.toggle('is-lit', e.isIntersecting)), { rootMargin: '-20% 0px -20% 0px' });
    $$('.chapter').forEach((c) => lightIO.observe(c));
  }

  // Mobile menu with focus management
  const panel = $('#menu');
  const openBtn = $('[data-menu-open]');
  const closeBtn = $('[data-menu-close]');
  if (panel && openBtn) {
    let lastFocus = null;
    const focusables = () => $$('a, button', panel);
    const open = () => {
      lastFocus = document.activeElement;
      panel.hidden = false;
      requestAnimationFrame(() => panel.classList.add('is-open'));
      openBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      focusables()[1]?.focus();
    };
    const close = (restore = true) => {
      panel.classList.remove('is-open');
      openBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      setTimeout(() => { panel.hidden = true; }, motion.reduced ? 0 : 350);
      if (restore) lastFocus?.focus();
    };
    openBtn.addEventListener('click', open);
    closeBtn?.addEventListener('click', () => close());
    panel.addEventListener('click', (e) => { if (e.target.closest('a')) close(false); });
    panel.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {
        const f = focusables(); const first = f[0]; const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  // Scroll-driven chrome: progress bar + solid nav. One rAF-throttled listener.
  let ticking = false;
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    root.style.setProperty('--progress', max > 0 ? (scrollY / max).toFixed(4) : 0);
    nav?.classList.toggle('is-solid', scrollY > 40);
    scrollHooks.forEach((fn) => fn());
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  onScroll();
}
export const scrollHooks = new Set();

/* ---------------------------------------------------------------- Opening sequence */
function initIntro() {
  const hero = $('.hero');
  if (!hero) return;
  const nameFill = $('.hero__name .line--2 > span');
  const skip = $('[data-skip-intro]');
  const running = root.classList.contains('intro-run');

  if (!running) { nameFill?.classList.add('lit'); return; }

  try { sessionStorage.setItem('tk-intro', '1'); } catch (e) {}
  skip.hidden = false;
  const timers = [];
  const finish = (instant) => {
    timers.forEach(clearTimeout);
    if (instant) root.classList.add('no-trans');
    root.classList.remove('intro-run', 'intro-play', 'bars-on');
    nameFill?.classList.add('lit');
    skip.hidden = true;
    if (instant) requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('no-trans')));
    removeEventListener('scroll', onEarlyScroll);
    removeEventListener('keydown', onKey);
  };
  const onEarlyScroll = () => { if (scrollY > 60) finish(true); };
  const onKey = (e) => { if (e.key === 'Escape') finish(true); };
  skip.addEventListener('click', () => { finish(true); const h = $('#hero-name'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } });
  addEventListener('scroll', onEarlyScroll, { passive: true });
  addEventListener('keydown', onKey);

  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('intro-play')));
  timers.push(setTimeout(() => nameFill?.classList.add('lit'), 1500));
  timers.push(setTimeout(() => root.classList.remove('bars-on'), 2200));
  timers.push(setTimeout(() => finish(false), 3900));
}

/* ---------------------------------------------------------------- Hero canvas: "the signal"
   A camera travelling down a lit corridor of interface planes. The planes carry fragments
   of the actual work (a form tag, a SQL query, a support log line), so the environment is
   made of the skills the rest of the page demonstrates. One 2D canvas, no WebGL. */
const PLANE_LABELS = [
  '<form method="post">', 'SELECT title FROM careers', '$_SESSION["user_id"]', 'password_verify()',
  '@media (max-width: 600px)', 'addEventListener("submit")', 'ping 10.0.0.1 — ok', 'spooler: restarted',
  'ticket → verified', 'git commit -m "fix"', 'UPS status: normal', 'docs/setup-checklist.md',
  '200 OK', 'JOIN career_interests', 'driver reinstalled', 'backup: complete',
];

function initHeroCanvas() {
  const canvas = $('.hero__canvas');
  if (!canvas) return;
  const hero = canvas.closest('.hero');
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, dpr = 1, t = 0, raf = 0, visible = true;
  let camZ = 0, lastScroll = scrollY, scrollKick = 0;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const lowPower = (navigator.hardwareConcurrency || 4) <= 4 || matchMedia('(max-width: 640px)').matches;
  const introMode = root.classList.contains('intro-run');
  let dust = [], planes = [];

  const rand = (a, b) => a + Math.random() * (b - a);
  const newPlane = (z) => {
    const side = Math.random() < 0.5 ? -1 : 1;
    return { x: side * rand(0.5, 1.7), y: rand(-0.55, 0.35), z: z ?? rand(0.6, 3.2), s: rand(0.8, 1.3),
             label: PLANE_LABELS[(Math.random() * PLANE_LABELS.length) | 0], teal: Math.random() < 0.3 };
  };

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, lowPower ? 1 : 1.5);
    w = r.width; h = r.height;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dust = Array.from({ length: lowPower ? 36 : 80 }, () => ({ x: Math.random() * w, y: Math.random() * h, z: rand(0.2, 1), s: rand(0.05, 0.35) }));
    if (!planes.length) planes = Array.from({ length: lowPower ? 7 : 14 }, () => newPlane());
    if (motion.reduced) draw(0);
  };

  function draw(dt) {
    t += dt;
    ctx.clearRect(0, 0, w, h);
    pointer.x += (pointer.tx - pointer.x) * 0.04;
    pointer.y += (pointer.ty - pointer.y) * 0.04;

    // Camera: a fast dolly that settles (the opening move), plus a push whenever the visitor scrolls.
    const sy = scrollY;
    scrollKick = Math.min(scrollKick * 0.9 + Math.abs(sy - lastScroll) * 0.00006, 0.004);
    lastScroll = sy;
    const settle = Math.exp(-t / (introMode ? 650 : 420));
    const speed = 0.00011 * (1 + (introMode ? 16 : 5) * settle) + scrollKick;
    camZ += speed * dt;

    const heroP = Math.min(1, sy / Math.max(h, 1));          // 0..1 as the hero scrolls away
    const vx = w / 2 + pointer.x * 34;                          // camera pan
    const base = w < 700 ? 0.8 : 0.6;                          // lower horizon on phones keeps it behind clear space
    const hy = h * (base - heroP * 0.22) + pointer.y * 14;       // camera tilt: horizon rises as you leave
    const cy = h * 0.42;

    // Horizon light
    const g = ctx.createLinearGradient(0, hy - 140, 0, hy + 50);
    g.addColorStop(0, 'rgba(37,99,235,0)'); g.addColorStop(0.75, 'rgba(37,99,235,0.2)'); g.addColorStop(1, 'rgba(37,99,235,0)');
    ctx.fillStyle = g; ctx.fillRect(0, hy - 140, w, 190);

    // Floor: converging rails
    ctx.lineWidth = 1;
    const cols = 22;
    for (let i = -cols; i <= cols; i++) {
      const a = 0.16 * (1 - Math.abs(i) / cols);
      ctx.strokeStyle = `rgba(125,211,252,${a.toFixed(3)})`;
      ctx.beginPath(); ctx.moveTo(vx + i * 2, hy); ctx.lineTo(vx + i * (w / cols) * 1.6, h + 40); ctx.stroke();
    }
    // Floor + faint ceiling: cross-lines rushing toward the camera
    const rows = 16;
    for (let i = 0; i < rows; i++) {
      const z = ((i / rows) + camZ) % 1;
      const p = z * z * z;
      const yf = hy + (h - hy + 40) * p;
      ctx.strokeStyle = `rgba(125,211,252,${(0.22 * z).toFixed(3)})`;
      ctx.beginPath(); ctx.moveTo(0, yf); ctx.lineTo(w, yf); ctx.stroke();
      const yc = hy - (hy + 40) * p;
      ctx.strokeStyle = `rgba(125,211,252,${(0.05 * z).toFixed(3)})`;
      ctx.beginPath(); ctx.moveTo(0, yc); ctx.lineTo(w, yc); ctx.stroke();
    }

    // Interface planes at depth — the layered environment the camera travels through
    planes.sort((a, b) => b.z - a.z);
    for (const pl of planes) {
      pl.z -= speed * dt * 3.2;
      if (pl.z < 0.45) Object.assign(pl, newPlane(3.2));
      const k = 1 / pl.z;
      const px = vx + pl.x * k * w * 0.32;
      const py = cy + pl.y * k * h * 0.45;
      const pw = 150 * pl.s * k * (w / 1440 + 0.35);
      const ph = pw * 0.58;
      const fadeIn = Math.min(1, (3.2 - pl.z) / 1.2);
      const fadeOut = Math.min(1, (pl.z - 0.45) / 0.5);
      // Bright while the camera is moving fast, then recede so the type stays easy to read
      const a = 0.34 * fadeIn * fadeOut * (0.32 + 0.68 * settle);
      if (a <= 0.01 || px + pw < 0 || px - pw > w) continue;
      const col = pl.teal ? '45,212,191' : '125,211,252';
      ctx.fillStyle = `rgba(11,18,40,${(a * 1.3).toFixed(3)})`;
      ctx.fillRect(px - pw / 2, py - ph / 2, pw, ph);
      ctx.strokeStyle = `rgba(${col},${a.toFixed(3)})`;
      ctx.strokeRect(px - pw / 2, py - ph / 2, pw, ph);
      ctx.beginPath(); ctx.moveTo(px - pw / 2, py - ph / 2 + ph * 0.18); ctx.lineTo(px + pw / 2, py - ph / 2 + ph * 0.18); ctx.stroke();
      const fs = Math.max(7, Math.min(14, 10 * k * (w / 1440 + 0.4)));
      ctx.font = `${fs.toFixed(1)}px "JetBrains Mono", ui-monospace, monospace`;
      ctx.fillStyle = `rgba(${col},${Math.min(0.75, a * 2).toFixed(3)})`;
      ctx.fillText(pl.label, px - pw / 2 + fs * 0.6, py + fs * 0.2, pw - fs);
    }

    // The signal: horizon line with a travelling pulse and waveform
    ctx.strokeStyle = 'rgba(125,211,252,0.55)';
    ctx.beginPath(); ctx.moveTo(0, hy); ctx.lineTo(w, hy); ctx.stroke();
    const px = ((t * 0.00018) % 1.4 - 0.2) * w;
    const pg = ctx.createRadialGradient(px, hy, 0, px, hy, 160);
    pg.addColorStop(0, 'rgba(45,212,191,0.9)'); pg.addColorStop(0.15, 'rgba(45,212,191,0.25)'); pg.addColorStop(1, 'rgba(45,212,191,0)');
    ctx.fillStyle = pg; ctx.fillRect(px - 160, hy - 6, 320, 12);
    ctx.strokeStyle = 'rgba(45,212,191,0.6)'; ctx.beginPath();
    for (let x = px - 120; x < px + 120; x += 3) {
      const kk = 1 - Math.abs(x - px) / 120;
      const y = hy + Math.sin(x * 0.09 + t * 0.01) * 10 * kk * kk;
      x === px - 120 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Anamorphic flare: one streak of light crosses the frame as the name is revealed
    if (introMode && t > 950 && t < 2300) {
      const f = (t - 950) / 1350;
      const fx = -0.3 * w + f * 1.6 * w;
      const fy = h * 0.4;
      const fa = Math.sin(f * Math.PI) * 0.55;
      const lg = ctx.createLinearGradient(fx - w * 0.45, 0, fx + w * 0.45, 0);
      lg.addColorStop(0, 'rgba(125,211,252,0)'); lg.addColorStop(0.5, `rgba(186,230,253,${fa.toFixed(3)})`); lg.addColorStop(1, 'rgba(125,211,252,0)');
      ctx.fillStyle = lg; ctx.fillRect(fx - w * 0.45, fy - 1, w * 0.9, 2);
      const rg = ctx.createRadialGradient(fx, fy, 0, fx, fy, 90);
      rg.addColorStop(0, `rgba(224,242,254,${(fa * 0.7).toFixed(3)})`); rg.addColorStop(1, 'rgba(125,211,252,0)');
      ctx.fillStyle = rg; ctx.fillRect(fx - 90, fy - 90, 180, 180);
    }

    // Atmospheric dust with depth parallax
    for (const d of dust) {
      d.y -= d.s * d.z * (dt * 0.06) * (1 + settle * 3);
      if (d.y < -4) { d.y = h + 4; d.x = Math.random() * w; }
      const x = d.x + pointer.x * 24 * d.z;
      ctx.fillStyle = `rgba(203,213,225,${(0.15 + d.z * 0.35).toFixed(2)})`;
      ctx.fillRect(x, d.y, d.z * 1.6, d.z * 1.6);
    }
  }

  let last = performance.now();
  const loop = (now) => {
    const dt = Math.min(now - last, 50); last = now;
    draw(dt);
    raf = requestAnimationFrame(loop);
  };
  const start = () => { if (!raf && visible && !document.hidden && !motion.reduced) { last = performance.now(); raf = requestAnimationFrame(loop); } };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };

  resize();
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop(); }).observe(canvas);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  motion.listeners.add((on) => { on ? start() : (stop(), draw(0)); });
  if (matchMedia('(pointer: fine)').matches) {
    addEventListener('pointermove', (e) => { pointer.tx = e.clientX / innerWidth - 0.5; pointer.ty = e.clientY / innerHeight - 0.5; }, { passive: true });
  }
  if (motion.reduced) { t = 5000; draw(0); } else start();

  // Scroll-linked camera: the hero's type drifts back and dims as the camera moves on
  scrollHooks.add(() => {
    if (!hero) return;
    const p = motion.reduced ? 0 : Math.min(1, scrollY / innerHeight);
    hero.style.setProperty('--hs', p.toFixed(3));
  });

  // Running film timecode (hh:mm:ss:ff at 24fps) — updates 4x/sec, only while the hero is on screen
  const tc = $('[data-timecode]');
  if (tc) {
    const t0 = performance.now();
    const pad = (n) => String(n).padStart(2, '0');
    setInterval(() => {
      if (!visible || document.hidden) return;
      const s = (performance.now() - t0) / 1000;
      tc.textContent = `TC ${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(Math.floor(s) % 60)}:${pad(Math.floor((s % 1) * 24))}`;
    }, 250);
  }
}

/* ---------------------------------------------------------------- Small utilities */
function initCopy() {
  $$('[data-copy]').forEach((btn) => btn.addEventListener('click', async () => {
    const status = $('[data-copy-status]');
    try { await navigator.clipboard.writeText(btn.dataset.copy); if (status) status.textContent = 'Copied'; }
    catch { if (status) status.textContent = 'Copy failed — select the address above'; }
    setTimeout(() => { if (status) status.textContent = ''; }, 2500);
  }));
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
}

/* ---------------------------------------------------------------- Contact form (Netlify Forms) */
function initForm() {
  const form = $('[data-contact-form]');
  if (!form) return;
  const status = $('[data-form-status]', form);
  const rules = {
    name: (v) => v.trim().length > 1 || 'Please enter your name.',
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'Please enter a valid email address.',
    topic: (v) => !!v || 'Please choose a topic.',
    message: (v) => v.trim().length >= 10 || 'Please write at least 10 characters.',
  };
  const check = (field) => {
    const res = rules[field.name]?.(field.value);
    const err = $(`[data-err="${field.name}"]`, form);
    const ok = res === true || res === undefined;
    field.setAttribute('aria-invalid', String(!ok));
    if (err) err.textContent = ok ? '' : res;
    return ok;
  };
  form.addEventListener('blur', (e) => { if (rules[e.target.name]) check(e.target); }, true);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fields = Object.keys(rules).map((n) => form.elements[n]);
    const valid = fields.map(check).every(Boolean);
    if (!valid) { fields.find((f) => f.getAttribute('aria-invalid') === 'true')?.focus(); return; }
    const btn = $('button[type="submit"]', form);
    btn.disabled = true; status.className = 'form__status'; status.textContent = 'Sending…';
    try {
      const res = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(new FormData(form)).toString() });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      status.classList.add('is-ok');
      status.textContent = 'Message sent. Thank you — I\'ll get back to you soon.';
    } catch (err) {
      status.classList.add('is-err');
      status.innerHTML = 'Sorry, the message couldn\'t be sent. Please email me directly at <a href="mailto:timothykarani001@gmail.com">timothykarani001@gmail.com</a>.';
    } finally { btn.disabled = false; }
  });
}

/* ---------------------------------------------------------------- Boot */
initMotionToggle();
initReveals();
initNav();
initIntro();
initHeroCanvas();
initCopy();
initForm();

// Load the interactive scenes when the browser is idle (or on first scroll), keeping first paint light.
if (document.querySelector('[data-scene]')) {
  let loaded = false;
  const load = () => { if (loaded) return; loaded = true; import('./scenes.js').then((m) => m.init({ motion, scrollHooks })); };
  ('requestIdleCallback' in window) ? requestIdleCallback(load, { timeout: 1500 }) : setTimeout(load, 600);
  addEventListener('scroll', load, { once: true, passive: true });
}
