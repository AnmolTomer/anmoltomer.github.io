/* Shared by build-time rendering and the unbuilt design preview. */
window.renderPortfolioContent = function (P) {
  var content = [];
  function add(selector, values) { content.push({ selector: selector, ...values }); }
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  var rot = function (i, amp) { var v = [-1.6, 1.2, -0.8, 1.8, -1.3, 0.9, -1.9, 1.4]; return (v[i % v.length] * (amp || 1)).toFixed(2) + 'deg'; };
  function set(k, value) { add('[data-f="' + k + '"]', { text: String(value) }); }

  set('role', P.role); set('name', P.name); set('last', P.last);
  add('#nameA', { html: Array.from(P.first).map(function (c) { return '<span class="ch">' + esc(c) + '</span>'; }).join('') });
  set('headline', P.headline); set('intro', P.intro); set('quote', P.quote);
  add('[data-f="mailto"]', { attributes: { href: 'mailto:' + P.email } });
  add('[data-f="mail-big"]', { attributes: { href: 'mailto:' + P.email }, text: P.email });
  add('[data-f="portrait"]', { attributes: { src: P.portrait.src, alt: P.portrait.alt } });
  add('[data-f="portrait-sm"]', { attributes: { src: P.portrait.src } });

  var ICONS = {
    github: ['GitHub', '0 0 24 24', 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12'],
    linkedin: ['LinkedIn', '0 0 16 16', 'M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z'],
    x: ['X', '0 0 24 24', 'M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z'],
    medium: ['Medium', '0 0 24 24', null]
  };
  var socials = Object.keys(ICONS).filter(function (k) { return P.links[k]; }).map(function (k) {
    var I = ICONS[k];
    var inner = I[2] ? '<path d="' + I[2] + '"/>' : '<circle cx="6.8" cy="12" r="5.6"/><ellipse cx="15.6" cy="12" rx="2.7" ry="5.3"/><ellipse cx="21.2" cy="12" rx="1.1" ry="4.7"/>';
    return '<a class="icon-btn" href="' + esc(P.links[k]) + '" target="_blank" rel="noopener" aria-label="' + I[0] + '"><svg viewBox="' + I[1] + '" fill="currentColor" aria-hidden="true">' + inner + '</svg></a>';
  }).join('');
  add('[data-socials]', { html: socials });

  var badge = P.stats[3];
  add('[data-stat="3"]', { html: '<span><small>' + esc(badge.label) + '</small><b>' + badge.value + badge.suffix + '</b></span>' });
  P.personal.forEach(function (item, i) {
    add('[data-personal="' + i + '"]', { html: '<div class="stat-in"><b>' + esc(item.title) + '</b><span>' + esc(item.body) + '</span></div>' });
  });
  var tl = P.timeline || [];
  add('[data-timeline]', { html: tl.map(function (t, i) {
    var last = i === tl.length - 1;
    var detail = t.highlights ? '<ul class="highlights">' + t.highlights.map(function (text) { return '<li>' + esc(text) + '</li>'; }).join('') + '</ul>' : '<p>' + esc(t.body) + '</p>';
    return '<li class="marker' + (last ? ' summit' : '') + '">' +
      '<div class="sign" style="--r:' + rot(i, .8) + '"><span class="yr">' + (t.year === 2019 ? '2019–20' : t.year) + (last ? ' <small>you are here</small>' : '') + '</span>' + (t.year === 2019 ? '' : '<span class="period">' + esc(t.period || '') + '</span>') + '<h3>' + esc(t.title) + '</h3>' + detail + '</div>' +
      '<span class="post" aria-hidden="true"></span><span class="foot" aria-hidden="true"></span></li>';
  }).join('') });

  add('[data-stack]', { html: P.stack.map(function (g) {
    return '<article class="pocket"><h3>' + esc(g.group) + '</h3><p>' + esc(g.note) + '</p><ul class="patches">' +
      g.tools.map(function (t, i) {
        var src = t.logo ? P.logoBase + t.logo : '', full = /\.(jpe?g|png)$/.test(t.logo || '');
        var mark = t.monogram ? '<span class="tool-monogram" aria-hidden="true">' + esc(t.monogram) + '</span>' : '<img src="' + esc(src) + '" alt="" class="' + (full ? 'full' : '') + '" loading="lazy" width="19" height="19">';
        return '<li class="patch-wrap"><span class="patch" style="--r:' + rot(i + g.group.length, .9) + '"><span class="lg">' + mark + '</span>' + esc(t.name) + '</span></li>';
      }).join('') + '</ul></article>';
  }).join('') });

  add('[data-principles]', { html: P.principles.map(function (p, i) {
    return '<li class="note-wrap"><article class="note" style="--r:' + rot(i + 1, 1.1) + '"><span class="tape" aria-hidden="true"></span><p class="no">No. ' + (i + 1) + '</p><h3>' + esc(p.title) + '</h3><p>' + esc(p.body) + '</p></article></li>';
  }).join('') });

  set('now-title', P.now.title); set('now-body', P.now.body); set('now-note', P.now.note);
  add('[data-agent]', { html: (P.agentRun || []).map(function (s, i) {
    return '<li' + (s.fail ? ' class="fail"' : '') + '><span class="node" aria-hidden="true">' + (s.fail ? '✕' : i + 1) + '</span><div><p class="step">' + esc(s.step) + '</p><p class="detail">' + esc(s.detail) + '</p></div></li>';
  }).join('') });

  var art = P.stats.filter(function (s) { return /article/i.test(s.label); })[0];
  set('article-count', art ? art.value : P.articles.length); set('article-label', art ? art.label : 'Articles');
  add('[data-f="medium"]', { attributes: { href: P.links.medium, target: '_blank', rel: 'noopener' } });
  var STAMPS = ['#c4513a', '#2a4c7a', '#3d7a48', '#d39a36', '#7a5a8c', '#2f7b80'];
  var arts = P.articles.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; }).slice(0, 6);
  add('[data-articles]', { html: arts.map(function (a, i) {
    var d = new Date(a.date + 'T00:00:00'), dd = ('0' + d.getDate()).slice(-2), mm = MON[d.getMonth()], yy = d.getFullYear();
    return '<li class="pc-wrap"><a class="postcard" href="' + esc(a.url) + '" target="_blank" rel="noopener" style="--r:' + rot(i + 2, .9) + '">' +
      '<div class="pc-img"><img src="' + esc(a.cover) + '" alt="" loading="lazy" referrerpolicy="no-referrer"></div>' +
      '<div class="pc-body">' +
        '<span class="stamp" aria-hidden="true"><span class="stamp-in" style="--sc:' + STAMPS[i % STAMPS.length] + '"><svg viewBox="0 0 48 60" preserveAspectRatio="none"><circle cx="34" cy="16" r="6" fill="#fff3d6" opacity=".9"/><path d="M0,44 L14,26 L22,36 L30,24 L48,44 V60 H0Z" fill="#fff3d6" opacity=".35"/><path d="M0,52 C14,44 30,48 48,42 V60 H0Z" fill="#fff3d6" opacity=".55"/></svg><b>No.' + ('0' + (i + 1)).slice(-2) + '</b></span></span>' +
        '<svg class="postmark" viewBox="0 0 128 66" aria-hidden="true"><circle cx="33" cy="33" r="29" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="33" cy="33" r="24" fill="none" stroke="currentColor" stroke-width=".8"/><text x="33" y="22" text-anchor="middle">MEDIUM</text><text class="big" x="33" y="38" text-anchor="middle">' + dd + ' ' + mm + '</text><text x="33" y="50" text-anchor="middle">' + yy + '</text><path d="M66,20 q7,-5 14,0 t14,0 t14,0 t14,0 M66,30 q7,-5 14,0 t14,0 t14,0 t14,0 M66,40 q7,-5 14,0 t14,0 t14,0 t14,0" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>' +
        '<h3>' + esc(a.title) + '</h3><p>' + esc(a.blurb) + '</p>' +
        '<ul class="tags">' + a.tags.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
        '<p class="pc-from"><time datetime="' + a.date + '">' + dd + ' ' + mm.charAt(0) + mm.slice(1).toLowerCase() + ' ' + yy + '</time><span>read on Medium ↗</span></p>' +
      '</div></a></li>';
  }).join('') });
  return content;
};
