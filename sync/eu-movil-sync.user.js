// ==UserScript==
// @name         EU Movil – Sincronización SDS TPV
// @namespace    eu-movil-control
// @version      1.0
// @description  Lee stock, ventas y devoluciones de SDS TPV (solo lectura) y los envía a Supabase cada hora, 9–21 h, lun–sáb.
// @match        https://sdstpv.es/*
// @match        https://www.sdstpv.es/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(() => {
  'use strict';

  const ENDPOINT = 'https://jaltijjlgmeduiktbqzc.supabase.co/functions/v1/sds-sync';
  const SECRET = 'SYNC_SECRET_AQUI';
  const DAYS = 3;                  // días de ventas/devoluciones que se releen en cada pasada
  const EVERY_MIN = 60;            // cada cuánto sincronizar
  const HOURS = [9, 21];           // franja horaria (hora de Madrid, ambas incluidas)
  const LOCK_MS = 10 * 60e3;       // evita que dos pestañas sincronicen a la vez
  const K = { last: 'eumovil_sync_last', lock: 'eumovil_sync_lock', status: 'eumovil_sync_status', stock: 'eumovil_sync_stock_count' };

  const ls = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
    del: (k) => { try { localStorage.removeItem(k); } catch {} },
  };
  const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();

  // ---- Lectura de SDS (misma lógica que sds_sync.js) ----
  async function readSds() {
    const csrf = document.querySelector('meta[name*=csrf]')?.content || '';
    const H = { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json', 'X-CSRF-TOKEN': csrf };

    const stock = [], seen = new Set();
    for (let p = 1; p <= 50; p++) {
      const html = await fetch('/user/stock?page=' + p, { credentials: 'include' }).then((r) => r.text());
      if (/auth\/login/.test(html) && !/data-stock-id/.test(html)) throw new Error('Sesión de SDS caducada');
      const d = new DOMParser().parseFromString(html, 'text/html');
      let added = 0;
      for (const tr of d.querySelectorAll('tr[data-stock-id]')) {
        const id = tr.dataset.stockId;
        if (seen.has(id)) continue;
        seen.add(id); added++;
        const c = [...tr.querySelectorAll('td')].map((td) => clean(td.textContent));
        stock.push({ sds_id: id, product_type: c[2], category: c[3], name: c[4], buy: c[5], sale: c[6],
          condition: c[7], qty: c[8], sku: c[9], notes: clean((c[10] || '').replace(/\bSave\b/g, '')) });
      }
      if (!added) break;
    }
    if (stock.length < 10) throw new Error('Stock vacío o no leído (' + stock.length + ')');

    const fmt = (dt) => dt.toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });
    const end = new Date(), start = new Date(Date.now() - DAYS * 864e5);
    const sales = [], returns = [];
    for (let p = 1; p <= 200; p++) {
      const u = `/user/sales-report/filter?page=${p}&per_page=250&returns_page=${p}&returns_per_page=100&start_date=${fmt(start)}&end_date=${fmt(end)}`;
      const j = await fetch(u, { headers: H, credentials: 'include' }).then((r) => r.json());
      if (!j.success) throw new Error('Informe de ventas no disponible');
      const rd = j.data.reportData, rt = j.data.returnsData || {};
      sales.push(...(rd.data || []));
      if (p <= (rt.total_pages || 1)) returns.push(...(rt.data || []));
      if (p >= Math.max(rd.total_pages || 1, rt.total_pages || 1)) break;
    }
    return { stock, sales, returns };
  }

  async function sync() {
    const { stock, sales, returns } = await readSds();
    // Si el stock leído cae de golpe más de un 30 %, probablemente la lectura fue incompleta:
    // se actualiza lo leído pero no se marca nada como vendido.
    const prev = +ls.get(K.stock) || 0;
    const full = !prev || stock.length >= prev * 0.7;
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-sync-secret': SECRET },
      body: JSON.stringify({ source: 'sds-userscript', full_stock: full, stock, sales, returns }),
    }).then((r) => r.json());
    if (!res.ok) throw new Error(res.error || 'Supabase rechazó la sincronización');
    if (full) ls.set(K.stock, String(stock.length));
    return `${stock.length} stock · ${sales.length} ventas` + (full ? '' : ' · (stock parcial, revisar)');
  }

  // ---- Programación ----
  function madridNow() {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', weekday: 'short', hour: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date()).map((x) => [x.type, x.value]));
    return { day: p.weekday, hour: +p.hour };
  }
  function inWindow() {
    const { day, hour } = madridNow();
    return day !== 'Sun' && hour >= HOURS[0] && hour <= HOURS[1];
  }

  let running = false;
  async function run(force) {
    if (running) return;
    const now = Date.now();
    if (!force) {
      if (!inWindow()) return;
      if (now - (+ls.get(K.last) || 0) < (EVERY_MIN - 2) * 60e3) return;
    }
    if (now - (+ls.get(K.lock) || 0) < LOCK_MS) return;
    ls.set(K.lock, String(now));
    running = true;
    badge('⏳ Sincronizando…', '#555');
    try {
      const msg = await sync();
      ls.set(K.status, JSON.stringify({ ok: true, at: Date.now(), msg }));
    } catch (e) {
      ls.set(K.status, JSON.stringify({ ok: false, at: Date.now(), msg: e.message || String(e) }));
    } finally {
      ls.set(K.last, String(Date.now())); // también tras un fallo: se reintenta en la siguiente hora
      ls.del(K.lock);
      running = false;
      showStatus();
    }
  }

  // ---- Indicador en pantalla (clic = sincronizar ahora) ----
  let el;
  function badge(text, bg, title) {
    if (!el) {
      el = document.createElement('div');
      el.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:2147483647;padding:4px 8px;border-radius:6px;' +
        'font:12px/1.3 system-ui,sans-serif;color:#fff;cursor:pointer;opacity:.85;box-shadow:0 1px 4px rgba(0,0,0,.3)';
      el.addEventListener('click', () => run(true));
      document.body.appendChild(el);
    }
    el.textContent = text;
    el.style.background = bg;
    el.title = (title || '') + '\nClic para sincronizar ahora';
  }
  function showStatus() {
    let s = null;
    try { s = JSON.parse(ls.get(K.status) || 'null'); } catch {}
    if (!s) return badge('EU Movil · sin sincronizar', '#555');
    const t = new Date(s.at).toLocaleTimeString('es-ES', { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit' });
    if (s.ok) badge(`EU Movil ✓ ${t}`, '#1a7f37', s.msg);
    else badge(`EU Movil ✗ ${t} · ${s.msg}`, '#c62828', s.msg);
  }

  // No hacer nada en la pantalla de login
  if (/\/login/.test(location.pathname)) return;
  showStatus();
  window.addEventListener('storage', (e) => { if (e.key === K.status) showStatus(); });
  setTimeout(() => run(false), 5000);
  setInterval(() => run(false), 60e3);
})();
