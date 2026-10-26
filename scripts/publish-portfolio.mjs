import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { description, generateAgentContent, metadata, person, portfolio } from './agent-content.mjs';
import { prerenderPortfolio } from './prerender-portfolio.mjs';

const root = new URL('../', import.meta.url);
const source = new URL('prototype/v2/07-2-trail-meadow/', root);
const destination = new URL('assets/portfolio/', root);
const assets = [
  'agent-log.css', 'agent-log.js', 'day-meadow.js', 'scene-transition.js',
  'trail-backgrounds.css', 'trail-backgrounds.js', 'footer-life.js',
  'footer-farm-day.jpg', 'footer-farm-night.jpg',
  'portfolio-content.js',
];
await mkdir(destination, { recursive: true });
for (const name of assets) await copyFile(new URL(name, source), new URL(name, destination));

let data = await readFile(new URL('prototype/v2/data.js', root), 'utf8');
data = data.replaceAll('../../../images/', './images/').replaceAll('../../../assets/logos/', './assets/logos/');
await writeFile(new URL('data.js', destination), data);

let html = await readFile(new URL('index.html', source), 'utf8');
html = prerenderPortfolio(html, portfolio);
html = html.replace('<title>Anmol Tomer · Meadow trail</title>', '<title>Anmol Tomer · Full-stack engineer</title>');
html = html.replace('Anmol Tomer, full-stack engineer. A walk down the trail: milestones, stack, principles, writing.', description);
html = html.replaceAll('../../../images/', './images/');
html = html.replaceAll('../../../assets/logos/', './assets/logos/');
html = html.replace('src="../data.js"', 'src="./assets/portfolio/data.js"');
for (const name of assets) {
  html = html.replaceAll(`href="${name}"`, `href="./assets/portfolio/${name}"`);
  html = html.replaceAll(`'./${name}'`, `'./assets/portfolio/${name}'`);
  html = html.replaceAll(`src="./${name}"`, `src="./assets/portfolio/${name}"`);
}
html = html.replace('</title>', `</title>\n${metadata('/', 'Anmol Tomer · Full-stack engineer', description)}\n<script type="application/ld+json">${JSON.stringify(person).replaceAll('<', '\\u003c')}</script>`);
await writeFile(new URL('index.html', root), html);
await generateAgentContent(root);
console.log(`Published the selected portfolio to ${fileURLToPath(new URL('index.html', root))}`);
