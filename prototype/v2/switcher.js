(() => {
  const VARIANTS = [
    ['01-atelier', 'Atelier'],
    ['02-aurora', 'Aurora'],
    ['03-orbit', 'Orbit 3D'],
    ['04-agent-graph', 'Agent graph'],
    ['05-bento', 'Bento motion'],
    ['06-horizon', 'Horizon scroll'],
    ['07-trail', 'Ghibli trail'],
    ['08-kinetic', 'Kinetic type'],
  ];
  if (new URLSearchParams(location.search).has('clean')) return;
  const slug = location.pathname.split('/').filter(Boolean).at(-1) === 'index.html'
    ? location.pathname.split('/').filter(Boolean).at(-2)
    : location.pathname.split('/').filter(Boolean).at(-1);
  const i = Math.max(0, VARIANTS.findIndex(([s]) => s === slug));
  const go = d => { location.href = `../${VARIANTS[(i + d + VARIANTS.length) % VARIANTS.length][0]}/${location.search}`; };

  const bar = document.createElement('div');
  bar.setAttribute('role', 'toolbar');
  bar.setAttribute('aria-label', 'Prototype switcher');
  bar.style.cssText = 'position:fixed;z-index:2147483000;left:50%;bottom:16px;transform:translateX(-50%);display:flex;align-items:center;gap:4px;padding:6px;border-radius:999px;background:#111;color:#fff;font:500 13px/1 system-ui,sans-serif;box-shadow:0 8px 28px rgb(0 0 0/.35)';
  const btn = (txt, label, fn) => {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = txt; b.setAttribute('aria-label', label);
    b.style.cssText = 'min-width:36px;height:36px;border:0;border-radius:999px;background:transparent;color:inherit;cursor:pointer;font:inherit';
    b.onmouseenter = () => (b.style.background = '#2a2a2a');
    b.onmouseleave = () => (b.style.background = 'transparent');
    b.onclick = fn; return b;
  };
  const label = document.createElement('a');
  label.href = '../';
  label.textContent = `${i + 1}/${VARIANTS.length} · ${VARIANTS[i][1]}`;
  label.style.cssText = 'padding:0 12px;white-space:nowrap;min-width:150px;text-align:center;color:#fff;text-decoration:none';
  bar.append(btn('←', 'Previous prototype', () => go(-1)), label, btn('→', 'Next prototype', () => go(1)));
  document.addEventListener('DOMContentLoaded', () => document.body.append(bar));
  addEventListener('keydown', e => {
    if (e.target.closest?.('input, textarea, [contenteditable], [role="dialog"]') || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === '[') go(-1);
    if (e.key === ']') go(1);
  });
})();
