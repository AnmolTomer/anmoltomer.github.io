const STEPS = [
  { id: 'plan', title: 'Plan', detail: 'Choose tools and checkpoints.' },
  { id: 'call', title: 'Call a tool', detail: '<code>orders.read()</code>' },
  { id: 'timeout', title: 'Timeout', detail: 'The call reaches its time limit.' },
  { id: 'recovery', title: 'Recovery', detail: 'Retry once. Use the cached read.' },
  { id: 'trace', title: 'Trace', detail: 'Record the failure, recovery and source.' },
  { id: 'answer', title: 'Answer', detail: 'Reply and disclose the cached source.' },
];

const ROUTES = [
  { from: 'plan', to: 'call', start: 0.02, end: 0.16 },
  { from: 'call', to: 'timeout', start: 0.18, end: 0.34 },
  { from: 'timeout', to: 'recovery', start: 0.39, end: 0.56 },
  { from: 'recovery', to: 'trace', start: 0.60, end: 0.74 },
  { from: 'trace', to: 'answer', start: 0.78, end: 0.93 },
];

function clamp(value) {
  return Math.max(0, Math.min(1, value));
}

/** Mount a scroll-driven illustrative run. No network or provider calls. */
export function mountAgentLog(host, { reducedMotion = false } = {}) {
  if (!host) return { dispose() {}, refresh() {} };

  const originalMarkup = host.innerHTML;
  host.classList.add('agent-demo');
  host.dataset.motion = reducedMotion ? 'reduced' : 'scroll';
  host.innerHTML = `
    <div class="agent-heading"><h3>Agent run</h3><span>Field log</span></div>
    <div class="agent-map">
      <svg class="agent-routes" aria-hidden="true" focusable="false">
        <path class="agent-route agent-route--closed" data-closed></path>
        ${ROUTES.map(function (_, index) {
          return `<path class="agent-route" data-route-base="${index}"></path><path class="agent-route agent-route--travel" data-route="${index}" pathLength="1"></path>`;
        }).join('')}
      </svg>
      <ol class="agent-steps" aria-label="Illustrative agent workflow">
        ${STEPS.map(function (step) {
          return `<li class="agent-step agent-step--${step.id}" data-agent-step="${step.id}">
            <span class="agent-marker" aria-hidden="true"><svg viewBox="0 0 16 16"><path class="agent-marker-check" d="m4 8 2.5 2.5L12 5"/><path class="agent-marker-cross" d="m5 5 6 6m0-6-6 6"/><circle class="agent-marker-dot" cx="8" cy="8" r="2"/></svg></span>
            <div class="agent-step-copy"><div class="agent-step-title"><h4>${step.title}</h4><span class="agent-step-state">Waiting</span></div><p>${step.detail}</p></div>
          </li>`;
        }).join('')}
      </ol>
      <div class="agent-bypass"><span aria-hidden="true"></span>Direct path<br>closed</div>
    </div>
    <p class="agent-caption">Illustrative workflow</p>`;

  const section = host.closest('section') || host;
  const map = host.querySelector('.agent-map');
  const nodes = STEPS.map(function (step) { return host.querySelector(`[data-agent-step="${step.id}"]`); });
  const routes = ROUTES.map(function (_, index) { return host.querySelector(`[data-route="${index}"]`); });
  const statusLabels = ['Planning', 'Calling', 'Timed out', 'Recovering', 'Recording', 'Composing'];
  let disposed = false;
  let frame = 0;
  let visible = true;
  let phase = -1;
  let trigger;
  let observer;
  let resizeObserver;

  function drawGeometry() {
    const rect = map.getBoundingClientRect();
    const points = {};
    nodes.forEach(function (node, index) {
      const marker = node.querySelector('.agent-marker').getBoundingClientRect();
      points[STEPS[index].id] = { x: marker.left - rect.left + marker.width / 2, y: marker.top - rect.top + marker.height / 2, r: marker.height / 2 + 3 };
    });
    ROUTES.forEach(function (route, index) {
      const from = points[route.from];
      const to = points[route.to];
      let path = `M${from.x} ${from.y + from.r} L${to.x} ${to.y - to.r}`;
      if (route.to === 'recovery') {
        path = `M${from.x} ${from.y + from.r} V${to.y - 14} Q${from.x} ${to.y} ${from.x + 14} ${to.y} H${to.x - to.r}`;
      }
      if (route.from === 'recovery') {
        const turnY = to.y - to.r - 13;
        path = `M${from.x} ${from.y + from.r} V${turnY - 10} Q${from.x} ${turnY} ${from.x - 10} ${turnY} H${to.x + 10} Q${to.x} ${turnY} ${to.x} ${turnY + 10} V${to.y - to.r}`;
      }
      routes[index].setAttribute('d', path);
      host.querySelector(`[data-route-base="${index}"]`).setAttribute('d', path);
    });
    host.querySelector('.agent-bypass').style.top = `${points.recovery.y + 17}px`;
    const failed = points.timeout;
    const trace = points.trace;
    host.querySelector('[data-closed]').setAttribute('d', `M${failed.x} ${failed.y + failed.r} V${trace.y - trace.r}`);
  }

  function render(progress) {
    ROUTES.forEach(function (route, index) {
      const traveled = reducedMotion ? 1 : clamp((progress - route.start) / (route.end - route.start));
      routes[index].style.strokeDashoffset = String(1 - traveled);
    });
    let nextPhase = 0;
    if (progress >= 0.16) nextPhase = 1;
    if (progress >= 0.34) nextPhase = 2;
    if (progress >= 0.48) nextPhase = 3;
    if (progress >= 0.74) nextPhase = 4;
    if (progress >= 0.93) nextPhase = 5;
    if (progress >= 0.995) nextPhase = 6;
    if (phase === nextPhase) return;
    phase = nextPhase;
    host.dataset.phase = String(phase);
    host.dataset.failed = String(phase >= 2);
    nodes.forEach(function (node, index) {
      let state = 'waiting';
      let label = 'Waiting';
      if (index < phase) { state = 'done'; label = 'Done'; }
      if (index === phase) { state = 'active'; label = statusLabels[index]; }
      if (index === 1 && phase > 1) label = 'Attempted';
      if (index === 2 && phase >= 2) { state = 'failed'; label = 'Timed out'; }
      if (index === 3 && phase > 3) label = 'Recovered';
      node.dataset.state = state;
      node.querySelector('.agent-step-state').textContent = label;
      if (index === phase) node.setAttribute('aria-current', 'step');
      else node.removeAttribute('aria-current');
    });
  }

  function readProgress() {
    const rect = section.getBoundingClientRect();
    return clamp((window.innerHeight * 0.75 - rect.top) / (rect.height + window.innerHeight * 0.4));
  }

  function update() {
    frame = 0;
    if (disposed || document.hidden || !visible) return;
    render(reducedMotion ? 1 : readProgress());
  }

  function schedule() {
    if (!frame && !disposed && !document.hidden && visible) frame = requestAnimationFrame(update);
  }

  function refresh() {
    if (disposed) return;
    drawGeometry();
    schedule();
  }

  function onVisibilityChange() {
    if (document.hidden && frame) { cancelAnimationFrame(frame); frame = 0; }
    else schedule();
  }

  drawGeometry();
  render(reducedMotion ? 1 : readProgress());
  if (!reducedMotion) {
    if (window.ScrollTrigger) {
      trigger = window.ScrollTrigger.create({ trigger: section, start: 'top 75%', end: 'bottom 35%', onUpdate: schedule, onRefresh: refresh });
    } else {
      window.addEventListener('scroll', schedule, { passive: true });
    }
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (!visible && frame) { cancelAnimationFrame(frame); frame = 0; }
        schedule();
      });
      observer.observe(section);
    }
    document.addEventListener('visibilitychange', onVisibilityChange);
  }
  if ('ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(refresh);
    resizeObserver.observe(map);
  }
  window.addEventListener('resize', refresh, { passive: true });
  document.fonts?.ready.then(function () { if (!disposed) refresh(); });

  return {
    refresh,
    dispose() {
      disposed = true;
      if (frame) cancelAnimationFrame(frame);
      trigger?.kill();
      observer?.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', refresh);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      host.classList.remove('agent-demo');
      delete host.dataset.motion;
      delete host.dataset.phase;
      delete host.dataset.failed;
      host.innerHTML = originalMarkup;
    },
  };
}
