/* FitPulse+ : streaks, badges, body log, routines & PRs, macros, grocery list. */
(() => {
  'use strict';
  const q = (s, r = document) => r.querySelector(s);
  const esc = (v) => (typeof escapeHTML === 'function' ? escapeHTML(v) : String(v));
  const acct = () => { try { return JSON.parse(localStorage.getItem('fp_current')); } catch { return null; } };
  const key = () => `fp_ext_${acct()}`;
  const blank = () => ({ body: [], sets: [], routines: [], macros: { p: 120, c: 250, f: 70 }, ach: {} });
  let X = blank();
  const load = () => { try { X = { ...blank(), ...(JSON.parse(localStorage.getItem(key())) || {}) }; } catch { X = blank(); } };
  const save = () => { try { localStorage.setItem(key(), JSON.stringify(X)); } catch { toast('Storage is full. Export a backup first.', 'error'); } };
  const num = (v) => (Number.isFinite(+v) && +v > 0 ? +v : 0);
  const day = (off = 0) => { const d = new Date(); d.setDate(d.getDate() + off); return d.toLocaleDateString('sv'); };
  const epley = (w, r) => (r === 1 ? w : w * (1 + r / 30));

  /* ---- streaks & achievements ---- */
  function streak() {
    const days = new Set([...state.workouts, ...state.meals].map((i) => i.date));
    let n = 0, off = days.has(day()) ? 0 : -1;
    while (days.has(day(off))) { n++; off--; }
    return n;
  }
  const prs = () => {
    const best = {};
    X.sets.forEach((s) => { const e = epley(s.w, s.r); if (!best[s.ex] || e > best[s.ex].e) best[s.ex] = { e, w: s.w, r: s.r, d: s.d }; });
    return best;
  };
  const BADGES = [
    ['First workout', () => state.workouts.length >= 1], ['10 workouts', () => state.workouts.length >= 10],
    ['50 workouts', () => state.workouts.length >= 50], ['3-day streak', () => streak() >= 3],
    ['7-day streak', () => streak() >= 7], ['30-day streak', () => streak() >= 30],
    ['Weight logged', () => X.body.length >= 1], ['First PR', () => X.sets.length >= 1],
    ['Water goal hit', () => Object.values(state.water).some((w) => w.amount >= w.goal)],
  ];

  /* ---- sparkline (inline SVG, works offline) ---- */
  function spark(vals) {
    if (vals.length < 2) return '<p class="muted">Add at least two entries to see a trend.</p>';
    const lo = Math.min(...vals), hi = Math.max(...vals), span = hi - lo || 1;
    const pts = vals.map((v, i) => `${(i / (vals.length - 1)) * 300},${50 - ((v - lo) / span) * 44}`).join(' ');
    return `<svg viewBox="0 0 300 54" class="fx-spark" role="img" aria-label="Trend from ${lo} to ${hi}"><polyline points="${pts}" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>`;
  }

  /* ---- grocery list from the recipe planner ---- */
  function grocery() {
    const plans = JSON.parse(localStorage.getItem(`fp_recipe_plans_${acct()}`) || '{}');
    const recipes = window.FitPulseRecipes || [];
    const list = {};
    for (let i = 0; i < 7; i++) (plans[day(i)] || []).forEach((p) => {
      const r = recipes.find((x) => x.id === p.recipe);
      (r?.ingredients || []).forEach((ing) => { list[ing] = (list[ing] || 0) + (p.servings || 1); });
    });
    return Object.entries(list).map(([k, n]) => `<li><label><input type="checkbox"> ${esc(k)}${n > 1 ? ` <b>×${n}</b>` : ''}</label></li>`).join('')
      || '<li class="muted">Plan meals in Nutrition to build a 7-day shopping list.</li>';
  }

  function render() {
    const root = q('#fxRoot'); if (!root) return;
    load();
    const t = state.meals.filter((m) => m.date === day());
    const sum = (k) => t.reduce((a, m) => a + (m[k] || 0), 0);
    const bar = (l, v, g) => `<div class="fx-bar"><span>${l} ${Math.round(v)}/${g} g</span><div class="progress"><div class="progress-fill" style="width:${Math.min(100, (v / g) * 100)}%"></div></div></div>`;
    const done = BADGES.filter(([, f]) => f());
    done.forEach(([n]) => { if (!X.ach[n]) { X.ach[n] = day(); toast(`Badge unlocked: ${n}`, 'success'); } });
    save();
    const p = prs();
    const sets = X.sets.slice(-5).reverse().map((s) => `<li>${esc(s.d)} · ${esc(s.ex)} · ${s.w} × ${s.r}</li>`).join('');
    root.innerHTML = `
    <div class="card glass"><h3><i class="fa-solid fa-fire"></i> Streak: ${streak()} day${streak() === 1 ? '' : 's'}</h3>
      <div class="fx-badges">${BADGES.map(([n, f]) => `<span class="fx-badge ${f() ? 'on' : ''}">${f() ? '🏅' : '🔒'} ${esc(n)}</span>`).join('')}</div></div>
    <div class="card glass"><h3><i class="fa-solid fa-weight-scale"></i> Body log</h3>
      <form id="fxBody" class="fx-row"><input name="w" type="number" step="0.1" min="1" placeholder="Weight kg" required>
        <input name="waist" type="number" step="0.1" min="1" placeholder="Waist cm"><input name="fat" type="number" step="0.1" min="1" max="70" placeholder="Body fat %">
        <button class="btn btn-primary">Add</button></form>
      ${spark(X.body.map((b) => b.w))}
      <ul class="fx-list">${X.body.slice(-5).reverse().map((b) => `<li>${esc(b.d)} · ${b.w} kg${b.waist ? ` · waist ${b.waist}` : ''}${b.fat ? ` · ${b.fat}% fat` : ''}</li>`).join('')}</ul></div>
    <div class="card glass"><h3><i class="fa-solid fa-dumbbell"></i> Sets & personal records</h3>
      <form id="fxSet" class="fx-row"><input name="ex" list="fxEx" placeholder="Exercise" required>
        <datalist id="fxEx">${(window.EXERCISES || (typeof EXERCISES !== 'undefined' ? EXERCISES : [])).map((e) => `<option value="${esc(e.n)}">`).join('')}</datalist>
        <input name="w" type="number" step="0.5" min="0" placeholder="Weight" required><input name="r" type="number" min="1" max="50" placeholder="Reps" required>
        <button class="btn btn-primary">Log set</button></form>
      <ul class="fx-list">${Object.entries(p).map(([ex, b]) => `<li>🏆 <b>${esc(ex)}</b>: ${b.w} × ${b.r} (≈${Math.round(b.e)} 1RM)</li>`).join('') || '<li class="muted">No sets yet.</li>'}</ul>
      <details><summary>Recent sets</summary><ul class="fx-list">${sets}</ul></details>
      <form id="fxSession" class="fx-row"><input name="name" placeholder="Session name" required><input name="min" type="number" min="1" placeholder="Minutes" required>
        <button class="btn btn-outline">Save today's session as workout</button></form></div>
    <div class="card glass"><h3><i class="fa-solid fa-bullseye"></i> Macro targets (today)</h3>
      ${bar('Protein', sum('protein'), X.macros.p)}${bar('Carbs', sum('carbs'), X.macros.c)}${bar('Fat', sum('fat'), X.macros.f)}
      <form id="fxMacro" class="fx-row"><input name="p" type="number" min="1" value="${X.macros.p}" aria-label="Protein g"><input name="c" type="number" min="1" value="${X.macros.c}" aria-label="Carbs g"><input name="f" type="number" min="1" value="${X.macros.f}" aria-label="Fat g"><button class="btn btn-outline">Save targets</button></form></div>
    <div class="card glass"><h3><i class="fa-solid fa-basket-shopping"></i> 7-day grocery list</h3><ul class="fx-list fx-groc">${grocery()}</ul></div>`;
  }

  document.addEventListener('submit', (e) => {
    const f = e.target; if (!f.id?.startsWith('fx')) return;
    e.preventDefault(); load();
    const v = Object.fromEntries(new FormData(f));
    if (f.id === 'fxBody') X.body.push({ d: day(), w: +v.w, waist: num(v.waist), fat: num(v.fat) });
    if (f.id === 'fxSet') { X.sets.push({ d: day(), ex: v.ex.slice(0, 80), w: +v.w, r: Math.round(+v.r) }); }
    if (f.id === 'fxMacro') X.macros = { p: num(v.p) || 120, c: num(v.c) || 250, f: num(v.f) || 70 };
    if (f.id === 'fxSession') {
      const todays = X.sets.filter((s) => s.d === day());
      const lib = typeof EXERCISES !== 'undefined' ? EXERCISES : [];
      const cat = lib.find((x) => x.n === todays[0]?.ex)?.m || 'Core';
      state.workouts.unshift({ id: uid(), name: v.name.slice(0, 80), category: cat, duration: Math.round(+v.min), calories: Math.round(+v.min * 6), date: day(), notes: `${todays.length} sets logged` });
      try { localStorage.setItem(`fp_user_data_${acct()}`, JSON.stringify(userData())); } catch {}
      if (typeof renderAll === 'function') renderAll();
      toast('Session saved as workout', 'success');
    }
    save(); render();
  });

  function mount() {
    if (q('#sec-plus') || !q('#sec-settings')) return;
    const sec = document.createElement('section'); sec.id = 'sec-plus'; sec.className = 'section';
    sec.innerHTML = '<div class="section-head"><h1><i class="fa-solid fa-chart-simple"></i> Progress+</h1></div><div id="fxRoot"></div>';
    q('#sec-settings').before(sec);
    const a = document.createElement('a'); a.href = '#plus'; a.className = 'nav-link'; a.dataset.section = 'plus';
    a.innerHTML = '<i class="fa-solid fa-chart-simple"></i><span>Progress+</span>';
    a.onclick = (e) => { e.preventDefault(); navigateTracker('plus'); };
    q('.nav-link[data-section="settings"]').before(a);
    TRACKER_SECTIONS.add('plus');
    window.addEventListener('fitpulse:navigate', (e) => { if (e.detail.section === 'plus') render(); });
    window.addEventListener('fitpulse:account', render);
    if (location.hash === '#plus' && acct()) navigateTracker('plus');
  }

  /* backup hooks used by app.js export/import */
  window.FPX = {
    dump: () => { load(); return X; },
    load: (d) => { if (d && typeof d === 'object') { X = { ...blank(), ...d }; save(); render(); } },
  };
  window.addEventListener('DOMContentLoaded', mount);
  if (document.readyState !== 'loading') mount();
})();
