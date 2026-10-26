import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import worker, { handleRequest, negotiate } from '../workers/agent-negotiation.mjs';
import { lastmod, pages, person, portfolio, site } from '../scripts/agent-content.mjs';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
const request = (path = '/', accept = 'text/markdown', options = {}) => new Request(`${site}${path}`, { ...options, headers: { Accept: accept, ...options.headers } });
const html = () => new Response('<!doctype html><p>Portfolio</p>', { headers: { 'Content-Type': 'text/html', Vary: 'Accept-Encoding' } });

test('negotiation honors preferences, wildcards, exclusions, parameters and unsupported types', () => {
  for (const [accept, expected] of [
    ['text/markdown', 'text/markdown'], ['text/html', 'text/html'], ['', 'text/html'],
    ['*/*', 'text/html'], ['text/*', 'text/html'], ['application/json', null],
    ['text/html;q=0.5, text/markdown;q=0.9', 'text/markdown'],
    ['text/html;q=1, text/markdown;q=0.5', 'text/html'],
    ['text/markdown;q=0, text/html;q=0', null],
    ['text/markdown;q=0, */*;q=0.8', 'text/html'],
    ['text/html;q=0, text/*;q=0.8', 'text/markdown'],
    ['text/markdown;charset=utf-8', 'text/markdown'],
    ['text/markdown;variant=unknown', null], ['text/markdown;q=2', null],
    ['TEXT/MARKDOWN', 'text/markdown'],
  ]) assert.equal(negotiate(accept), expected, accept);
});

test('homepage and trust pages negotiate their actual Markdown file', async () => {
  for (const path of ['/', '/index.html', '/about/', '/contact/', '/privacy/', '/about/index.html']) {
    const calls = [];
    const response = await handleRequest(request(path, 'text/markdown', { headers: { 'If-None-Match': 'html-etag', Range: 'bytes=0-3' } }), async req => {
      calls.push(req);
      if (calls.length === 1) return html();
      assert.equal(req.headers.has('If-None-Match'), false);
      assert.equal(req.headers.has('Range'), false);
      return new Response('# Anmol Tomer\n\nPortfolio content.', { headers: { 'Content-Type': 'text/plain' } });
    });
    assert.equal(response.status, 200);
    assert.match(response.headers.get('Content-Type'), /^text\/markdown/);
    assert.match(response.headers.get('Vary'), /Accept/);
    assert.match(response.headers.get('Cache-Control'), /no-store/);
    assert.match(await response.text(), /^# Anmol/);
    assert.match(new URL(calls[1].url).pathname, /index\.md$/);
  }
});

test('HTML bytes, redirects, assets, methods and origin failures are preserved', async () => {
  const response = await handleRequest(request('/', 'text/html'), html);
  assert.equal(await response.text(), '<!doctype html><p>Portfolio</p>');
  assert.equal(response.headers.get('Vary'), 'Accept-Encoding, Accept');
  for (const [path, method, status, type] of [
    ['/about', 'GET', 301, 'text/html'], ['/assets/test.js', 'GET', 200, 'application/javascript'],
    ['/', 'POST', 405, 'text/plain'], ['/', 'GET', 503, 'text/html'],
  ]) {
    const upstream = new Response('unchanged', { status, headers: { 'Content-Type': type } });
    const result = await handleRequest(request(path, 'text/markdown', { method }), async () => upstream);
    assert.equal(result.status, status);
    assert.equal(await result.text(), 'unchanged');
  }
});

test('missing pages keep 404 with useful Markdown and discovery links', async () => {
  for (const path of ['/missing', '/missing.json', '/nested/missing', '/%3Cscript%3E']) {
    const response = await handleRequest(request(path), async () => new Response('HTML error', { status: 404, headers: { 'Content-Type': 'text/html' } }));
    assert.equal(response.status, 404);
    assert.match(response.headers.get('Content-Type'), /^text\/markdown/);
    const body = await response.text();
    assert.ok(body.length > 20);
    assert.match(body, /\[agent guide\]\(https:\/\/anmoltomer.com\/llms.txt\)/);
    assert.ok(!body.includes('<script>'));
  }
  const response = await handleRequest(request('/missing', 'text/html'), async () => new Response('HTML error', { status: 404, headers: { 'Content-Type': 'text/html' } }));
  assert.equal(response.status, 404);
  assert.equal(await response.text(), 'HTML error');
});

test('HEAD has no body, unacceptable types return 406, missing Markdown fails explicitly', async () => {
  const head = await handleRequest(request('/missing', 'text/markdown', { method: 'HEAD' }), async () => new Response(null, { status: 404 }));
  assert.equal(head.status, 404);
  assert.equal(await head.text(), '');
  const unacceptable = await handleRequest(request('/', 'application/json'), html);
  assert.equal(unacceptable.status, 406);
  const unavailable = await handleRequest(request(), async req => new URL(req.url).pathname.endsWith('.md') ? new Response('missing', { status: 404 }) : html());
  assert.equal(unavailable.status, 502);
  assert.match(await unavailable.text(), /temporarily unavailable/);
  const empty = await handleRequest(request(), async req => new URL(req.url).pathname.endsWith('.md') ? new Response('', { headers: { 'Content-Type': 'text/plain' } }) : html());
  assert.equal(empty.status, 502);
  const homepageHead = await handleRequest(request('/', 'text/markdown', { method: 'HEAD' }), async req => new Response(null, { headers: { 'Content-Type': new URL(req.url).pathname.endsWith('.md') ? 'text/plain' : 'text/html' } }));
  assert.equal(homepageHead.status, 200);
  assert.match(homepageHead.headers.get('Content-Type'), /^text\/markdown/);
  assert.equal(await homepageHead.text(), '');
});

test('Cloudflare entry point accepts environment and context without treating them as fetch', async t => {
  t.mock.method(globalThis, 'fetch', async () => html());
  const response = await worker.fetch(request('/', 'text/html'), {}, {});
  assert.equal(response.status, 200);
});

test('generated identity and metadata match public portfolio without inventing an organization', async () => {
  const home = await read('index.html');
  assert.match(home, /<html lang="en">/);
  assert.match(home, /<link rel="canonical" href="https:\/\/anmoltomer.com\/">/);
  assert.match(home, /property="og:type" content="website"/);
  assert.match(home, /property="og:image" content="https:\/\/anmoltomer.com\/images\//);
  const schema = JSON.parse(home.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  assert.deepEqual(schema, JSON.parse(JSON.stringify(person)));
  assert.equal(schema['@type'], 'Person');
  assert.equal(schema.contactPoint.email, portfolio.email);
  assert.ok(!('address' in schema));
  const source = await read('prototype/v2/07-2-trail-meadow/index.html');
  assert.equal(home.slice(home.indexOf('<body')), source.slice(source.indexOf('<body')).replaceAll('../../../images/', './images/').replace('src="../data.js"', 'src="./assets/portfolio/data.js"').replaceAll("'./", "'./assets/portfolio/"));
});

test('discovery files follow llms.txt and sitemap formats and trust pages contain substantive text', async () => {
  const guide = await read('llms.txt');
  assert.match(guide, /^# Anmol Tomer\n\n> /);
  assert.match(guide, /\*\*When to use this:\*\*/);
  for (const section of guide.split(/^## .+$/m).slice(1)) {
    for (const line of section.trim().split('\n')) if (line) assert.match(line, /^- \[[^\]]+\]\(https:\/\/[^)]+\)/);
  }
  const sitemap = await read('sitemap.xml');
  assert.match(sitemap, /^<\?xml version="1.0" encoding="UTF-8"\?>/);
  assert.match(sitemap, /xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9"/);
  assert.equal([...sitemap.matchAll(/<url>/g)].length, 4);
  assert.ok(Buffer.byteLength(sitemap) < 50 * 1024 * 1024);
  assert.match(await read('robots.txt'), /Sitemap: https:\/\/anmoltomer.com\/sitemap.xml/);
  for (const page of pages) {
    assert.ok(page.paragraphs.join(' ').length >= 500, page.slug);
    const html = await read(`${page.slug}/index.html`);
    assert.ok(html.includes(`<h1>${page.title}</h1>`));
    assert.ok(sitemap.includes(`<loc>${site}/${page.slug}/</loc><lastmod>${lastmod}</lastmod>`));
    assert.match(await read(`${page.slug}/index.md`), new RegExp(`^# ${page.title}`));
  }
  const markdown = await read('index.md');
  for (const article of portfolio.articles) assert.ok(markdown.includes(article.url));
  assert.match(await read('404.html'), /name="robots" content="noindex"/);
});
