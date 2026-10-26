import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { escapeHtml, portfolio } from '../scripts/agent-content.mjs';
import { prerenderPortfolio } from '../scripts/prerender-portfolio.mjs';

const source = await readFile(new URL('../prototype/v2/07-2-trail-meadow/index.html', import.meta.url), 'utf8');
const home = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const main = home.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];

test('initial HTML contains the actual portfolio text and links without executing scripts', () => {
  for (const text of [portfolio.name, portfolio.headline, portfolio.intro, portfolio.now.title, portfolio.now.body, ...portfolio.principles.flatMap(item => [item.title, item.body])]) {
    assert.ok(main.includes(escapeHtml(text)), text);
  }
  for (const item of portfolio.timeline) {
    assert.ok(main.includes(escapeHtml(item.title)));
    for (const detail of item.highlights || [item.body]) assert.ok(main.includes(escapeHtml(detail)));
  }
  assert.equal((main.match(/class="marker(?: summit)?"/g) || []).length, portfolio.timeline.length);
  assert.equal((main.match(/class="pocket"/g) || []).length, portfolio.stack.length);
  assert.equal((main.match(/class="note-wrap"/g) || []).length, portfolio.principles.length);
  assert.equal((main.match(/class="pc-wrap"/g) || []).length, 6);
  for (const tool of portfolio.stack.flatMap(group => group.tools)) assert.ok(main.includes(escapeHtml(tool.name)));
  for (const url of [...Object.values(portfolio.links), `mailto:${portfolio.email}`]) assert.ok(main.includes(`href="${escapeHtml(url)}"`));
  assert.equal((main.match(/<!--email_off--><a\b[^>]*href="mailto:[^"]+"[^>]*>[\s\S]*?<\/a><!--\/email_off-->/g) || []).length, 3, 'Public contact links must remain usable through Cloudflare without a decode script');
  const publishedArticles = portfolio.articles.slice().sort((a, b) => a.date < b.date ? 1 : -1).slice(0, 6);
  for (const article of publishedArticles) {
    assert.ok(main.includes(escapeHtml(article.title)));
    assert.ok(main.includes(`href="${article.url}"`));
  }
  assert.ok(!/data-f="[^"]+"><\//.test(main), 'Text slots must not remain empty');
  assert.ok(!main.includes('../../../'), 'Production content must use production asset paths');
});

test('build rendering escapes text and attribute values from portfolio data', () => {
  const input = structuredClone(portfolio);
  input.intro = '<script>alert("intro")</script> & text';
  input.portrait.alt = 'Portrait" onerror="alert(1)';
  input.principles[0].title = '<img src=x onerror=alert(1)>';
  const rendered = prerenderPortfolio(source, input);
  assert.ok(rendered.includes(escapeHtml(input.intro)));
  assert.ok(rendered.includes('alt="Portrait&quot; onerror=&quot;alert(1)"'));
  assert.ok(rendered.includes('&lt;img src=x onerror=alert(1)&gt;'));
  assert.ok(!rendered.includes(input.intro));
  assert.ok(!rendered.includes('<img src=x onerror=alert(1)>'));
});

test('template drift fails generation instead of silently publishing missing content', () => {
  assert.throws(() => prerenderPortfolio(source.replace('data-timeline', 'data-removed'), portfolio), /Missing empty content slot: \[data-timeline\]/);
  assert.throws(() => prerenderPortfolio(source.replaceAll('data-f="mailto"', 'data-f="removed"'), portfolio), /Missing attribute target/);
});

test('rendering is deterministic and leaves stylesheet and animation module unchanged', () => {
  assert.equal(prerenderPortfolio(source, portfolio), prerenderPortfolio(source, portfolio));
  const styles = value => [...value.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(match => match[1]);
  const productionPaths = value => value.replaceAll("'./", "'./assets/portfolio/");
  assert.deepEqual(styles(home), styles(source).map(productionPaths));
  const animationModule = value => value.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
  assert.equal(animationModule(home), productionPaths(animationModule(source)));
  assert.match(home, /<html lang="en" data-content-rendered>/);
  assert.match(home, /if \(document.documentElement.hasAttribute\('data-content-rendered'\)\) return;/);
  assert.match(home, /src="\.\/assets\/portfolio\/portfolio-content.js"/);
  assert.match(home, /<noscript><style>[\s\S]*\.links \{ display: flex;/);
});
