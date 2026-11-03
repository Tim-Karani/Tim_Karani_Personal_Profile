/* Interactive scenes. Each init* function only runs if its markup exists on the page. */

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

let M; // motion controller from main.js

export function init({ motion, scrollHooks }) {
  M = motion;
  initBuild();
  initSupport();
  initFlow();
  initDashboard();
  initArchive();
  initToolkit();
  initTimeline(scrollHooks);
  initMethod(scrollHooks);
  initPrototype();
  initWalk();
}

/* ======================================================= Scene A — layered build */
const SNIPPETS = {
  1: { file: 'login.html', lang: 'HTML', url: 'localhost/faulu/login.php', code: [
    '<span class="c">&lt;!-- illustrative --&gt;</span>',
    '<span class="t">&lt;form</span> action=<span class="s">"login.php"</span> method=<span class="s">"post"</span><span class="t">&gt;</span>',
    '  <span class="t">&lt;label</span> for=<span class="s">"email"</span><span class="t">&gt;</span>Email<span class="t">&lt;/label&gt;</span>',
    '  <span class="t">&lt;input</span> id=<span class="s">"email"</span> type=<span class="s">"email"</span> required<span class="t">&gt;</span>',
    '  <span class="t">&lt;input</span> name=<span class="s">"password"</span> type=<span class="s">"password"</span><span class="t">&gt;</span>',
    '  <span class="t">&lt;button&gt;</span>Sign in<span class="t">&lt;/button&gt;</span>',
    '<span class="t">&lt;/form&gt;</span>'] },
  2: { file: 'style.css', lang: 'CSS', url: 'localhost/faulu/login.php', code: [
    '<span class="c">/* illustrative */</span>',
    '<span class="t">.login</span> {',
    '  <span class="k">display</span>: grid; <span class="k">gap</span>: 1rem;',
    '  <span class="k">width</span>: min(100%, 22rem);',
    '}',
    '<span class="k">@media</span> (max-width: 600px) {',
    '  <span class="t">.login</span> { <span class="k">padding</span>: 1.25rem; }',
    '}'] },
  3: { file: 'register.php', lang: 'PHP', url: 'localhost/faulu/register.php', code: [
    '<span class="c">// register.php — excerpt</span>',
    '<span class="k">if</span> (<span class="t">empty</span>($password)) $errors[] = <span class="s">"Password is required."</span>;',
    '<span class="k">if</span> (!<span class="t">empty</span>($password)) {',
    '  $errors = <span class="t">array_merge</span>($errors,',
    '    <span class="t">validatePasswordStrength</span>($password));',
    '}',
    '<span class="k">if</span> ($password !== $confirm_password) { <span class="c">/* … */</span> }'] },
  4: { file: 'login.php', lang: 'PHP', url: 'localhost/faulu/dashboard.php', code: [
    '<span class="c">// login.php — excerpt</span>',
    '$stmt = $conn-&gt;<span class="t">prepare</span>(<span class="s">"SELECT id, username, password,</span>',
    '<span class="s">  email FROM users WHERE email = ? OR username = ?"</span>);',
    '$stmt-&gt;<span class="t">bind_param</span>(<span class="s">"ss"</span>, $email, $email);',
    '<span class="k">if</span> (<span class="t">verifyPassword</span>($password, $user[<span class="s">"password"</span>])) {',
    '  $_SESSION[<span class="s">"user_id"</span>] = $user[<span class="s">"id"</span>];',
    '  <span class="t">session_regenerate_id</span>(<span class="k">true</span>);',
    '}'] },
  5: { file: 'results.php', lang: 'PHP · SQL', url: 'localhost/faulu/results.php', code: [
    '<span class="c">// results.php — excerpt</span>',
    '<span class="k">foreach</span> ($selected_skills <span class="k">as</span> $skill) {',
    '  $s = $conn-&gt;<span class="t">real_escape_string</span>($skill);',
    '  $conditions[] = <span class="s">"skills_required LIKE \'%$s%\'"</span>;',
    '}',
    '$sql .= <span class="t">implode</span>(<span class="s">" OR "</span>, $conditions);'] },
};

function initBuild() {
  const build = $('[data-scene="build"]');
  if (!build) return;
  const pre = $('[data-code]', build);
  const file = $('[data-code-file]', build);
  const lang = $('[data-code-lang]', build);
  const url = $('[data-build-url]', build);
  const steps = $$('[data-step-trigger]', build);
  let current = 0, token = 0;

  const show = async (n) => {
    if (n === current) return;
    current = n; const my = ++token;
    build.dataset.step = n;
    steps.forEach((s) => s.classList.toggle('is-active', +s.dataset.stepTrigger === n));
    const s = SNIPPETS[n];
    file.textContent = s.file; lang.textContent = s.lang; url.textContent = s.url;
    if (M.reduced) { pre.innerHTML = s.code.join('\n'); return; }
    pre.innerHTML = '';
    for (const line of s.code) {
      if (my !== token) return;
      pre.insertAdjacentHTML('beforeend', (pre.innerHTML ? '\n' : '') + line);
      await wait(70);
    }
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) show(+e.target.dataset.stepTrigger); });
  }, { rootMargin: matchMedia('(max-width: 959px)').matches ? '-72% 0px -26% 0px' : '-48% 0px -48% 0px' });
  steps.forEach((s) => io.observe(s));
  show(1);

  // Subtle pointer-driven camera tilt on desktop
  const browser = $('.browser', build);
  if (matchMedia('(pointer: fine) and (min-width: 960px)').matches) {
    build.addEventListener('pointermove', (e) => {
      if (M.reduced) return;
      const r = browser.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      browser.style.setProperty('--tilt-y', `${(-6 + x * 6).toFixed(2)}deg`);
      browser.style.setProperty('--tilt-x', `${(4 - y * 4).toFixed(2)}deg`);
    });
    build.addEventListener('pointerleave', () => { browser.style.removeProperty('--tilt-x'); browser.style.removeProperty('--tilt-y'); });
  }
}

/* ======================================================= Scene B — support console */
const SCENARIOS = {
  workstation: { title: 'Workstation · slow & freezing', lines: [
    ['warn', 'Reported: "My PC is very slow and apps keep freezing."'],
    ['step', 'Reproduce → Task Manager shows disk at 100% after login'],
    ['', 'Isolate → many startup programs; system drive nearly full'],
    ['', 'Fix → disable unneeded startup items, clear temp files, install pending updates'],
    ['', 'Verify → restart with the user present; login and apps responsive'],
    ['ok', '✓ Resolved · noted in fix log so it\'s quicker next time'] ] },
  printer: { title: 'Printer · queue stuck', lines: [
    ['warn', 'Reported: "Nothing is printing — jobs just sit in the queue."'],
    ['step', 'Check the physical first → paper, toner, error lights: all OK'],
    ['', 'Isolate → one stuck job blocking every job behind it'],
    ['', 'Fix → stop print spooler, clear the queue, restart spooler'],
    ['', 'Verify → test page from two different computers'],
    ['ok', '✓ Resolved · steps added to the printer troubleshooting guide'] ] },
  studio: { title: 'Studio PC · audio device missing', lines: [
    ['warn', 'Reported: studio computer not detecting its audio interface'],
    ['step', 'Prioritise → production-critical; act before the next segment'],
    ['', 'Isolate → cable and port fine; Device Manager shows a driver error'],
    ['', 'Fix → reinstall the driver, move to a known-good USB port'],
    ['', 'Verify → levels confirmed with studio staff before going live'],
    ['ok', '✓ Resolved · incident logged and escalated for follow-up'] ] },
  field: { title: 'Field device · not syncing', lines: [
    ['warn', 'Reported: field submissions not reaching the office system'],
    ['step', 'Check → connectivity OK, user signed in, app version outdated'],
    ['', 'Fix → update the app, sign out and back in, force a sync'],
    ['', 'Verify → submissions visible on the office side'],
    ['', 'Prevent → added "check app version" to the device checklist'],
    ['ok', '✓ Resolved · checklist updated for the whole field team'] ] },
  server: { title: 'Server room · routine check', lines: [
    ['step', 'Routine server-room check'],
    ['', 'UPS status and indicator lights → normal'],
    ['', 'Room temperature and airflow → within range'],
    ['', 'Cable labelling → two unlabelled patch cables noted'],
    ['warn', 'Anything unusual is escalated to senior IT, not improvised'],
    ['ok', '✓ Check recorded in the log'] ] },
  network: { title: 'Network · shared drive missing', lines: [
    ['warn', 'Reported: shared drive missing on one computer only'],
    ['step', 'Isolate → other PCs fine, so the network itself is OK'],
    ['', 'Check → ping the file server: reachable from this PC'],
    ['', 'Fix → stored credentials had expired; re-map the drive'],
    ['', 'Verify → user opens and saves a file on the share'],
    ['ok', '✓ Resolved · documented in the access how-to'] ] },
};

function initSupport() {
  const scene = $('[data-scene="support"]');
  if (!scene) return;
  const log = $('[data-console-log]', scene);
  const title = $('[data-console-title]', scene);
  const state = $('[data-console-state]', scene);
  const nodes = $$('[data-node]', scene);
  let token = 0;

  const run = async (key) => {
    const my = ++token;
    const sc = SCENARIOS[key];
    nodes.forEach((n) => n.setAttribute('aria-pressed', String(n.dataset.node === key)));
    $$('.wires .flow', scene).forEach((w) => w.classList.toggle('is-on', w.dataset.wire === key || key === 'network'));
    title.textContent = sc.title;
    state.textContent = 'working…';
    log.innerHTML = '';
    for (let i = 0; i < sc.lines.length; i++) {
      if (my !== token) return;
      const [cls, text] = sc.lines[i];
      const li = document.createElement('li');
      li.innerHTML = `<span class="t">00:0${i}</span><span class="${cls}"></span>`;
      li.lastChild.textContent = text;
      log.append(li);
      requestAnimationFrame(() => li.classList.add('is-in'));
      if (!M.reduced) await wait(420);
    }
    if (my === token) state.textContent = 'resolved';
  };
  nodes.forEach((n) => n.addEventListener('click', () => run(n.dataset.node)));
}

/* ======================================================= Scene C — request flow demo */
const CAREERS = [
  { title: 'Software Developer', note: 'Designs and builds applications', tags: ['programming', 'problem solving'] },
  { title: 'IT Support Specialist', note: 'Keeps people and systems working', tags: ['communication', 'problem solving'] },
  { title: 'Web Designer', note: 'Shapes how websites look and work', tags: ['design', 'programming'] },
  { title: 'Data Analyst', note: 'Finds answers in numbers', tags: ['data analysis', 'problem solving'] },
  { title: 'Network Technician', note: 'Installs and maintains networks', tags: ['problem solving', 'organisation'] },
  { title: 'Project Coordinator', note: 'Keeps work on time and on track', tags: ['organisation', 'communication'] },
  { title: 'Graphic Designer', note: 'Communicates ideas visually', tags: ['design', 'communication'] },
  { title: 'Database Administrator', note: "Looks after an organisation's data", tags: ['data analysis', 'organisation', 'programming'] },
  { title: 'Technical Writer', note: 'Makes complex things understandable', tags: ['communication', 'organisation'] },
  { title: 'Teacher / Trainer', note: 'Helps others learn', tags: ['teaching', 'communication'] },
  { title: 'Accountant', note: 'Manages financial records', tags: ['data analysis', 'organisation'] },
  { title: 'UX Researcher', note: 'Studies how people use products', tags: ['design', 'communication', 'problem solving'] },
];

function initFlow() {
  const scene = $('[data-scene="flow"]');
  if (!scene) return;
  const form = $('[data-flow-form]', scene);
  const msg = $('[data-flow-msg]', scene);
  const sql = $('[data-flow-sql]', scene);
  const results = $('[data-flow-results]', scene);
  const packet = $('[data-packet]', scene);
  const stages = $$('[data-stage]', scene);
  const runBtn = $('[data-flow-run]', scene);
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  form.addEventListener('change', (e) => {
    const checked = $$('input:checked', form);
    if (checked.length > 3) { e.target.checked = false; msg.textContent = 'Up to three skills in this demo, please.'; }
    else msg.textContent = '';
  });

  const travel = async (from, to) => {
    const pos = (i) => `${12.5 + i * 25}%`;
    stages[to].classList.add('is-hot');
    if (M.reduced) { await wait(120); return; }
    const a = packet.animate([{ left: pos(from), opacity: 1 }, { left: pos(to), opacity: 1 }], { duration: 520, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' });
    await a.finished;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const picks = $$('input:checked', form).map((i) => i.value);
    if (!picks.length) { msg.textContent = 'Choose at least one skill first.'; return; }
    runBtn.disabled = true; msg.textContent = 'Request in flight…';
    stages.forEach((s) => s.classList.remove('is-hot'));
    results.innerHTML = '';

    stages[0].classList.add('is-hot');
    await travel(0, 1);
    sql.innerHTML = [
      '<span class="c">-- Faulu-style matching: one LIKE per chosen skill</span>',
      '<span class="k">SELECT</span> title, skills_required <span class="k">FROM</span> careers',
      ...picks.map((p, i) => `${i ? '   <span class="k">OR</span>' : '<span class="k">WHERE</span>'} skills_required <span class="k">LIKE</span> <span class="s">'%${esc(p)}%'</span>`),
      '<span class="c">-- then ranked by number of matching skills</span>',
    ].join('\n');
    await travel(1, 2);
    await wait(M.reduced ? 0 : 260);

    const ranked = CAREERS.map((c) => ({ ...c, score: c.tags.filter((t) => picks.includes(t)).length }))
      .filter((c) => c.score > 0).sort((a, b) => b.score - a.score || a.title.localeCompare(b.title)).slice(0, 3);

    await travel(2, 3);
    results.innerHTML = ranked.map((c, i) => `<li style="--i:${i}"><span class="rank">0${i + 1}</span><span><b>${esc(c.title)}</b><small>${esc(c.note)}</small></span><span class="match">${c.score}/${picks.length} match</span></li>`).join('');
    msg.textContent = `200 OK · ${ranked.length} result${ranked.length === 1 ? '' : 's'} returned`;
    if (!M.reduced) packet.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, fill: 'forwards' });
    runBtn.disabled = false;
  });
}

/* ======================================================= Scene D — ops dashboard */
function initDashboard() {
  const dash = $('[data-scene="dashboard"]');
  if (!dash) return;
  const tabs = $$('[role="tab"]', dash);
  const select = (tab, focus) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      $('#' + t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', (e) => {
      const k = e.key;
      if (k === 'ArrowRight' || k === 'ArrowLeft' || k === 'Home' || k === 'End') {
        e.preventDefault();
        const n = k === 'Home' ? 0 : k === 'End' ? tabs.length - 1 : (i + (k === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        select(tabs[n], true);
      }
    });
  });

  const board = $('[data-board]', dash);
  const lanes = $$('[data-lane]', board);
  const counts = () => lanes.forEach((l) => { $('[data-count]', l).textContent = $$('.card', l).length; });
  counts();
  board.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (!card || card.disabled) return;
    const lane = card.closest('[data-lane]');
    const next = lanes[+lane.dataset.lane + 1];
    if (!next) return;
    const firstCard = $('.card', next);
    firstCard ? next.insertBefore(card, firstCard) : next.append(card);
    card.classList.remove('is-moved'); void card.offsetWidth; card.classList.add('is-moved');
    if (+next.dataset.lane === lanes.length - 1) { card.disabled = true; $('small', card).textContent = $('small', card).textContent.replace(/·.*/, '· done'); }
    card.focus();
    counts();
  });
}

/* ======================================================= Work archive preview */
function initArchive() {
  const archive = $('[data-scene="archive"]');
  if (!archive) return;
  const covers = $$('[data-cover]', archive);
  const cap = $('[data-preview-cap]', archive);
  $$('[data-preview]', archive).forEach((entry) => {
    const show = () => {
      covers.forEach((c) => c.classList.toggle('is-shown', c.dataset.cover === entry.dataset.preview));
      cap.textContent = $('.entry__title', entry).textContent;
    };
    entry.addEventListener('pointerenter', show);
    entry.addEventListener('focusin', show);
  });
}

/* ======================================================= Toolkit */
function initToolkit() {
  const bay = $('[data-bay]');
  if (!bay) return;
  const legend = $('[data-legend]');
  $$('button', legend).forEach((b) => b.addEventListener('click', () => {
    $$('button', legend).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    bay.dataset.filter = b.dataset.filter;
  }));
  $$('.tool', bay).forEach((t) => t.addEventListener('click', () => {
    t.setAttribute('aria-expanded', String(t.getAttribute('aria-expanded') !== 'true'));
  }));
}

/* ======================================================= Timeline rail */
function initTimeline(scrollHooks) {
  const tl = $('[data-timeline]');
  if (!tl) return;
  const rail = $('.timeline__rail i', tl);
  scrollHooks.add(() => {
    if (M.reduced) { rail.style.setProperty('--tl', 1); return; }
    const r = tl.getBoundingClientRect();
    const p = clamp((innerHeight * 0.6 - r.top) / r.height);
    rail.style.setProperty('--tl', p.toFixed(3));
  });
}

/* ======================================================= Method: fragments → solution */
function initMethod(scrollHooks) {
  const sec = $('[data-scene="method"]');
  if (!sec) return;
  const asm = $('[data-assembly]', sec);
  const steps = $$('[data-method-steps] li', sec);
  const update = () => {
    if (M.reduced) { steps.forEach((s) => s.classList.add('is-on')); return; }
    const r = sec.getBoundingClientRect();
    const p = clamp(-r.top / (r.height - innerHeight));
    asm.style.setProperty('--p', clamp(p * 1.18).toFixed(3));
    const idx = Math.min(steps.length - 1, Math.floor(p * steps.length * 1.05));
    steps.forEach((s, i) => { s.classList.toggle('is-on', i <= idx); s.classList.toggle('is-current', i === idx); });
  };
  scrollHooks.add(update);
  update();
}

/* ======================================================= Field ops concept prototype (case-study page) */
function initPrototype() {
  const proto = $('[data-scene="proto"]');
  if (!proto) return;
  const checks = $$('.check', proto);
  const submit = $('.phone__submit', proto);
  const feed = $('.feed', proto);
  const sync = () => { submit.disabled = !checks.every((c) => c.getAttribute('aria-pressed') === 'true'); };
  checks.forEach((c) => c.addEventListener('click', () => { c.setAttribute('aria-pressed', String(c.getAttribute('aria-pressed') !== 'true')); sync(); }));
  let n = 0;
  submit.addEventListener('click', () => {
    n++;
    const li = document.createElement('li');
    li.className = 'is-new';
    li.innerHTML = `<span class="label" style="color:var(--amber)">Now</span><span>Visit report · Sample Store ${String.fromCharCode(64 + ((n % 26) || 26))} · 4 checks complete</span><span class="pill pill--warn">Awaiting review</span>`;
    feed.prepend(li);
    checks.forEach((c) => c.setAttribute('aria-pressed', 'false'));
    sync();
    $('[data-proto-msg]', proto).textContent = 'Report submitted to the supervisor view (sample data).';
  });
  sync();
}

/* ======================================================= Faulu walkthrough (case-study page) */
function initWalk() {
  const walk = $('[data-scene="walk"]');
  if (!walk) return;
  const tabs = $$('[role="tab"]', walk);
  const url = $('[data-walk-url]', walk);
  const select = (tab, focus) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = $('#' + t.getAttribute('aria-controls'));
      panel.hidden = !on;
      if (on) url.textContent = panel.dataset.url;
    });
    if (focus) tab.focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', (e) => {
      const k = e.key;
      if (['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(k)) {
        e.preventDefault();
        const n = k === 'Home' ? 0 : k === 'End' ? tabs.length - 1 : (i + (k === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        select(tabs[n], true);
      }
    });
  });
}
