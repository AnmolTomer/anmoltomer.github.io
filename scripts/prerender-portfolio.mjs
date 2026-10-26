import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { escapeHtml } from './agent-content.mjs';

const context = { window: {} };
runInNewContext(await readFile(new URL('../prototype/v2/07-2-trail-meadow/portfolio-content.js', import.meta.url), 'utf8'), context);
export const renderPortfolioContent = context.window.renderPortfolioContent;

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Fill the template's explicit empty content slots; fail if a slot has drifted. */
export function prerenderPortfolio(template, portfolio) {
  let html = template;
  for (const update of renderPortfolioContent(portfolio)) {
    const attribute = update.selector.startsWith('#') ? `id="${update.selector.slice(1)}"` : update.selector.slice(1, -1);
    const opening = `<([a-z][\\w:-]*)(\\b[^>]*\\s${escapeRegex(attribute)}(?=[\\s>])[^>]*)>`;
    if (update.text !== undefined || update.html !== undefined) {
      let matched = false;
      html = html.replace(new RegExp(`${opening}\\s*</\\1>`, 'g'), function (_, tag, attributes) {
        matched = true;
        const content = update.text === undefined ? update.html : escapeHtml(update.text);
        return `<${tag}${attributes}>${content}</${tag}>`;
      });
      if (!matched) throw new Error(`Missing empty content slot: ${update.selector}`);
    }
    if (update.attributes) {
      let matched = false;
      html = html.replace(new RegExp(opening, 'g'), function (_, tag, attributes) {
        matched = true;
        for (const [name, value] of Object.entries(update.attributes)) {
          attributes = attributes.replace(new RegExp(`\\s${name}="[^"]*"`, 'g'), '');
          attributes += ` ${name}="${escapeHtml(value)}"`;
        }
        return `<${tag}${attributes}>`;
      });
      if (!matched) throw new Error(`Missing attribute target: ${update.selector}`);
    }
  }
  return html.replace('<html lang="en">', '<html lang="en" data-content-rendered>');
}
