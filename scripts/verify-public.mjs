import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pages, person, site } from './agent-content.mjs';

const base = process.argv[2] || site;
let failures = 0;
async function check(name, action) {
  try { await action(); console.log(`PASS ${name}`); }
  catch (error) { failures++; console.error(`FAIL ${name}: ${error.message}`); }
}
async function get(path, accept) {
  const response = await fetch(new URL(path, base), { headers: { Accept: accept }, signal: AbortSignal.timeout(20000) });
  return { response, body: await response.text() };
}
function varied(response) {
  assert.ok(response.headers.get('Vary')?.split(',').some(value => value.trim().toLowerCase() === 'accept'), 'Vary must include Accept');
}

for (const path of ['/', ...pages.map(page => `/${page.slug}/`)]) {
  await check(`${path} Markdown negotiation`, async () => {
    const { response, body } = await get(path, 'text/markdown');
    assert.equal(response.status, 200);
    assert.match(response.headers.get('Content-Type'), /^text\/markdown\b/);
    varied(response);
    const local = path === '/' ? 'index.md' : `${path.slice(1)}index.md`;
    assert.equal(body, await readFile(new URL(`../${local}`, import.meta.url), 'utf8'));
  });
  await check(`${path} HTML and identity`, async () => {
    const { response, body } = await get(path, 'text/html');
    assert.equal(response.status, 200);
    assert.match(response.headers.get('Content-Type'), /^text\/html\b/);
    varied(response);
    assert.match(body, /<html lang="en">/);
    assert.ok(body.includes(`<link rel="canonical" href="${site}${path}">`));
    assert.match(body, /property="og:image"/);
    assert.match(body, /property="og:type" content="website"/);
    if (path === '/') {
      const schema = JSON.parse(body.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
      assert.deepEqual(schema, JSON.parse(JSON.stringify(person)));
    } else {
      const text = body.match(/<p>.*?<\/p>/gs).join('').replace(/<[^>]*>/g, '');
      assert.ok(text.length >= 500);
    }
  });
}
for (const path of ['/index.md', '/about/index.md', '/contact/index.md', '/privacy/index.md', '/llms.txt', '/sitemap.xml', '/robots.txt', '/assets/portfolio/info.css']) {
  await check(`${path} published bytes`, async () => {
    const { response, body } = await get(path, '*/*');
    assert.equal(response.status, 200);
    const local = await readFile(new URL(`..${path}`, import.meta.url), 'utf8');
    // Cloudflare may prepend managed bot rules to the origin robots.txt.
    if (path === '/robots.txt') assert.ok(body.includes(local), 'Origin robots directives must remain present');
    else assert.equal(body, local);
  });
}
for (const accept of ['text/markdown', 'text/html']) {
  await check(`404 ${accept}`, async () => {
    const { response, body } = await get('/__agent-readiness-nonexistent-20261026', accept);
    assert.equal(response.status, 404);
    assert.ok(response.headers.get('Content-Type')?.startsWith(accept));
    varied(response);
    assert.ok(body.length >= 20);
    assert.ok(body.includes('/llms.txt'));
  });
}
await check('custom 404 document is excluded from indexing', async () => {
  const { response, body } = await get('/404.html', 'text/html');
  assert.equal(response.status, 200);
  assert.match(body, /name="robots" content="noindex"/);
});
for (const page of pages) {
  await check(`/${page.slug} redirects to its canonical page`, async () => {
    const { response } = await get(`/${page.slug}`, 'text/html');
    assert.equal(response.status, 200);
    assert.equal(response.url, new URL(`/${page.slug}/`, base).href);
  });
}
await check('HEAD negotiates Markdown without a body', async () => {
  const response = await fetch(new URL('/', base), { method: 'HEAD', headers: { Accept: 'text/markdown' }, signal: AbortSignal.timeout(20000) });
  assert.equal(response.status, 200);
  assert.match(response.headers.get('Content-Type'), /^text\/markdown\b/);
  varied(response);
  assert.equal(await response.text(), '');
});
await check('weighted Accept prefers HTML', async () => {
  const { response } = await get('/', 'text/markdown;q=0.2, text/html;q=0.9');
  assert.ok(response.headers.get('Content-Type')?.startsWith('text/html'));
});
await check('unsupported representation returns 406', async () => {
  const { response } = await get('/', 'application/json');
  assert.equal(response.status, 406);
});
await check('Open Graph image is available', async () => {
  const response = await fetch(person.image, { signal: AbortSignal.timeout(20000) });
  assert.equal(response.status, 200);
  assert.ok(response.headers.get('Content-Type')?.startsWith('image/'));
  assert.ok((await response.arrayBuffer()).byteLength > 0);
});
if (failures) process.exitCode = 1;
