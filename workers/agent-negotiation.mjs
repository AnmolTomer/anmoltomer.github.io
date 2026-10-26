const markdownPaths = new Map([
  ['/', '/index.md'], ['/index.html', '/index.md'],
  ...['about', 'contact', 'privacy'].flatMap(slug => [
    [`/${slug}/`, `/${slug}/index.md`], [`/${slug}/index.html`, `/${slug}/index.md`],
  ]),
]);
const markdown404 = '# Page not found\n\nThe requested page does not exist or has moved. Find current pages in the [agent guide](https://anmoltomer.com/llms.txt) or [sitemap](https://anmoltomer.com/sitemap.xml).\n';

// An exact exclusion (q=0) takes precedence over a broader wildcard.
function quality(accept, offered) {
  let specificity = -1;
  let result = 0;
  for (const range of accept.toLowerCase().split(',')) {
    const [media, ...parameters] = range.trim().split(';').map(value => value.trim());
    const [type, subtype] = media.split('/');
    const [offeredType, offeredSubtype] = offered.split('/');
    if (!((type === '*' || type === offeredType) && (subtype === '*' || subtype === offeredSubtype))) continue;
    let q = 1;
    let parameterCount = 0;
    let matches = true;
    for (const parameter of parameters) {
      const [name, rawValue] = parameter.split('=').map(value => value.trim());
      const value = rawValue?.replace(/^"|"$/g, '');
      if (name === 'q') {
        q = /^(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/.test(value ?? '') ? Number(value) : 0;
        break;
      }
      if (name !== 'charset' || value !== 'utf-8') matches = false;
      parameterCount++;
    }
    if (!matches) continue;
    const rank = (type === '*' ? 0 : subtype === '*' ? 1 : 2) * 100 + parameterCount;
    if (rank > specificity || (rank === specificity && q > result)) {
      specificity = rank;
      result = q;
    }
  }
  return result;
}

export function negotiate(accept) {
  const header = accept || '*/*';
  const html = quality(header, 'text/html');
  const markdown = quality(header, 'text/markdown');
  if (!html && !markdown) return null;
  return markdown > html ? 'text/markdown' : 'text/html';
}

function variedHeaders(original) {
  const headers = new Headers(original);
  const vary = (headers.get('Vary') || '').split(',').map(value => value.trim()).filter(Boolean);
  if (!vary.some(value => value.toLowerCase() === 'accept' || value === '*')) vary.push('Accept');
  headers.set('Vary', vary.join(', '));
  // Cloudflare's default cache key ignores Accept. Keep negotiated responses out
  // of shared caches; origin assets retain their existing caching behavior.
  headers.set('Cache-Control', 'private, no-store');
  headers.set('Cloudflare-CDN-Cache-Control', 'no-store');
  headers.delete('Expires');
  return headers;
}

function textResponse(request, body, status, type) {
  const headers = variedHeaders();
  headers.set('Content-Type', `${type}; charset=utf-8`);
  headers.set('X-Content-Type-Options', 'nosniff');
  return new Response(request.method === 'HEAD' ? null : body, { status, headers });
}

export async function handleRequest(request, originFetch = fetch) {
  if (!['GET', 'HEAD'].includes(request.method)) return originFetch(request);
  const url = new URL(request.url);
  const origin = await originFetch(request);
  const mapped = markdownPaths.get(url.pathname);
  const isHtml = origin.headers.get('Content-Type')?.includes('text/html');
  if (!mapped && !isHtml && origin.status !== 404) return origin;
  if (origin.status >= 300 && origin.status < 400 && origin.status !== 304) return origin;
  const type = negotiate(request.headers.get('Accept'));
  if (!type) return textResponse(request, 'Supported representations: text/html, text/markdown.\n', 406, 'text/plain');
  if (origin.status === 404 && type === 'text/markdown') return textResponse(request, markdown404, 404, type);
  if (mapped && type === 'text/markdown' && (origin.ok || origin.status === 304)) {
    url.pathname = mapped;
    const headers = new Headers(request.headers);
    // Validators and byte ranges for HTML must not constrain the other body.
    for (const name of ['If-None-Match', 'If-Modified-Since', 'If-Match', 'If-Unmodified-Since', 'Range', 'If-Range']) headers.delete(name);
    headers.set('Accept', 'text/plain, text/markdown');
    const markdown = await originFetch(new Request(url, { method: request.method, headers, redirect: 'manual' }));
    const contentType = markdown.headers.get('Content-Type') || '';
    if (markdown.status !== 200 || !/^text\/(plain|markdown)\b/i.test(contentType)) {
      return textResponse(request, 'The Markdown representation is temporarily unavailable.\n', 502, 'text/plain');
    }
    const responseHeaders = variedHeaders(markdown.headers);
    responseHeaders.set('Content-Type', 'text/markdown; charset=utf-8');
    responseHeaders.set('X-Content-Type-Options', 'nosniff');
    const body = request.method === 'HEAD' ? null : await markdown.text();
    if (body !== null && !body.trim()) return textResponse(request, 'The Markdown representation is temporarily unavailable.\n', 502, 'text/plain');
    return new Response(body, { status: 200, headers: responseHeaders });
  }
  return new Response(origin.body, { status: origin.status, statusText: origin.statusText, headers: variedHeaders(origin.headers) });
}

export default {
  fetch(request) { return handleRequest(request); },
};
