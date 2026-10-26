import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

export const site = 'https://anmoltomer.com';
// Update when the published copy or metadata changes, not on every build.
export const lastmod = '2026-10-26';
const context = { window: {} };
runInNewContext(await readFile(new URL('../prototype/v2/data.js', import.meta.url), 'utf8'), context);
export const portfolio = context.window.PORTFOLIO;
export const description = `${portfolio.name}, full-stack engineer building backend systems and agentic AI workflows.`;
export const image = `${site}/images/photo_2025-06-28_23-41-00.jpg`;
export const person = {
  '@context': 'https://schema.org', '@type': 'Person', '@id': `${site}/#person`,
  name: portfolio.name, description, url: `${site}/`, jobTitle: portfolio.role,
  image, email: portfolio.email, sameAs: Object.values(portfolio.links),
  knowsAbout: portfolio.stack.flatMap(group => group.tools.map(tool => tool.name)),
  contactPoint: { '@type': 'ContactPoint', email: portfolio.email, contactType: 'Professional inquiries' },
};

export const pages = [
  { slug: 'about', title: 'About', paragraphs: [
    `${portfolio.name} is a ${portfolio.role.toLowerCase()} with a backend focus. ${portfolio.intro}`,
    'His engineering background includes partner payment integrations, self-serve onboarding APIs, Java and Spring Boot payment services, UPI bank integrations, and idempotent Kafka and SQS processing. At CRED, he worked with partner product and business teams on payment integrations for more than 400 brands.',
    `${portfolio.now.body} ${portfolio.now.note}`,
    'The homepage contains the career timeline, current tools, working principles, and links to technical writing on Medium. The agent workflow shown there is an illustrative demonstration of planning, tool failure, recovery, and tracing; it is not an API or a live customer transaction.',
  ] },
  { slug: 'contact', title: 'Contact', paragraphs: [
    `For professional inquiries, email ${portfolio.email}. This address is the contact published on Anmol’s portfolio. The site also links to his GitHub, LinkedIn, X, and Medium profiles so you can inspect public code, professional background, and technical writing before reaching out.`,
    'Relevant conversations include backend systems, payment integrations, full-stack product development, cloud infrastructure, delivery automation, and agentic AI workflows. Include the problem you are trying to solve, the current stack, the scope of work, and any deadline or operational constraint that affects the project.',
    'There is no contact form, booking system, or service API on this site. The email link opens your own mail application. An agent helping a user can draft an inquiry with the project context and source links; the user should review and authorize sending it. Published experience does not establish current availability, pricing, or a commitment to take on work. Confirm those directly by email.',
  ] },
  { slug: 'privacy', title: 'Privacy', paragraphs: [
    'This portfolio serves public professional information. It has no account registration, working contact form, checkout, or application database. The page stores your selected light or dark theme in your browser’s local storage under the key “theme”. You can remove it through your browser’s site-data controls; without a saved choice, the page follows your system preference.',
    'GitHub Pages hosts the site and Cloudflare handles traffic in front of it. These providers receive connection information such as IP addresses and request details as part of delivering and protecting the website. Their own policies govern their processing and retention. The site’s owner cannot promise that hosting and security providers keep no logs.',
    'The homepage loads fonts from Google Fonts, scripts and styles from jsDelivr, cdnjs, and unpkg, and article images from Medium’s image CDN. Those requests disclose connection information to the relevant providers. Links to GitHub, LinkedIn, X, and Medium take you to services with their own privacy practices. This site does not add its own analytics or advertising script.',
    `If you email ${portfolio.email}, your message and any information you include travel through email providers and may be retained in the correspondence. Send only what is needed for the inquiry; do not send credentials or confidential customer data. Use that address for questions about this portfolio or its handling of information.`,
  ] },
];

export function escapeHtml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

export function metadata(path, title, summary) {
  return `<link rel="canonical" href="${site}${path}">
<link rel="alternate" type="text/markdown" href="${path === '/' ? '/index.md' : `${path}index.md`}">
<meta property="og:type" content="website">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(summary)}">
<meta property="og:url" content="${site}${path}">
<meta property="og:image" content="${image}">
<meta property="og:image:alt" content="${escapeHtml(portfolio.portrait.alt)}">`;
}

function document(title, path, paragraphs, { noindex = false } = {}) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} · ${portfolio.name}</title>
<meta name="description" content="${escapeHtml(paragraphs[0])}">
${noindex ? '<meta name="robots" content="noindex">' : metadata(path, `${title} · ${portfolio.name}`, paragraphs[0])}
<link rel="stylesheet" href="/assets/portfolio/info.css">
</head>
<body><main>
<a href="/">${portfolio.name}</a>
<h1>${escapeHtml(title)}</h1>
${paragraphs.map(text => `<p>${escapeHtml(text)}</p>`).join('\n')}
${title === 'Contact' ? `<p><a href="mailto:${portfolio.email}">${portfolio.email}</a></p>` : ''}
<nav aria-label="Site information"><a href="/about/">About</a> <a href="/contact/">Contact</a> <a href="/privacy/">Privacy</a> <a href="/llms.txt">Agent guide</a></nav>
</main></body>
</html>
`;
}

export async function generateAgentContent(root) {
  const home = `# ${portfolio.name}\n\n> ${portfolio.role}. ${portfolio.headline}\n\n${portfolio.intro}\n\n## Current work\n\n${portfolio.now.body}\n\n## Experience\n\n${portfolio.timeline.map(item => `- **${item.period} — ${item.title}:** ${item.body}`).join('\n')}\n\n## Tools\n\n${portfolio.stack.map(group => `- **${group.group}:** ${group.tools.map(tool => tool.name).join(', ')}`).join('\n')}\n\n## How I work\n\n${portfolio.principles.map(item => `- **${item.title}** ${item.body}`).join('\n')}\n\n## Writing\n\n${portfolio.articles.map(article => `- [${article.title}](${article.url}) (${article.date}): ${article.blurb}`).join('\n')}\n\n## Contact\n\n[Email ${portfolio.name}](mailto:${portfolio.email}). Confirm current availability and project terms directly.\n\n${Object.entries(portfolio.links).map(([name, url]) => `- [${name}](${url})`).join('\n')}\n\n## Site information\n\n- [About](${site}/about/)\n- [Contact](${site}/contact/)\n- [Privacy](${site}/privacy/)\n- [Agent guide](${site}/llms.txt)\n`;
  const guide = `# ${portfolio.name}\n\n> Personal portfolio of ${portfolio.name}, a full-stack engineer focused on backend systems, infrastructure, and agentic AI workflows.\n\n**When to use this:** Use this site to assess Anmol’s public engineering experience for backend APIs, payments and partner integrations, AWS delivery automation, or agent workflows with typed tools, bounded retries, recovery, evals, and tracing. Use the homepage for the career timeline and tools, and follow writing links for explanations of authentication, distributed systems, Java, and FastAPI.\n\n**How to contact:** This is an informational portfolio, not a callable service or MCP endpoint. Read the contact page and draft a professional inquiry to ${portfolio.email} with the problem, stack, scope, and deadline. Obtain the user’s authorization before sending. Confirm availability and pricing directly; do not infer them from the portfolio. The animated agent run is illustrative, not a live API.\n\n## Portfolio\n\n- [Homepage](${site}/): Career, tools, principles, and writing.\n- [Homepage Markdown](${site}/index.md): The text content without scripts or visual effects.\n- [About](${site}/about/): Professional background and what the demo represents.\n- [Contact](${site}/contact/): Contact method and useful inquiry context.\n- [Privacy](${site}/privacy/): Theme storage, hosting, external resources, and email.\n- [Sitemap](${site}/sitemap.xml): Canonical pages on this site.\n\n## Optional\n\n- [GitHub](${portfolio.links.github}): Public repositories.\n- [LinkedIn](${portfolio.links.linkedin}): Professional profile.\n- [Medium](${portfolio.links.medium}): Technical articles.\n`;
  await writeFile(new URL('index.md', root), home);
  await writeFile(new URL('llms.txt', root), guide);
  for (const page of pages) {
    await mkdir(new URL(`${page.slug}/`, root), { recursive: true });
    await writeFile(new URL(`${page.slug}/index.html`, root), document(page.title, `/${page.slug}/`, page.paragraphs));
    await writeFile(new URL(`${page.slug}/index.md`, root), `# ${page.title}\n\n${page.paragraphs.join('\n\n')}\n\n[Home](${site}/) · [Agent guide](${site}/llms.txt)\n`);
  }
  await writeFile(new URL('404.html', root), document('Page not found', '/404.html', ['The requested page does not exist or has moved. Return to the homepage or use the agent guide to find the portfolio’s current pages.'], { noindex: true }));
  const paths = ['/', ...pages.map(page => `/${page.slug}/`)];
  await writeFile(new URL('sitemap.xml', root), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map(path => `  <url><loc>${site}${path}</loc><lastmod>${lastmod}</lastmod></url>`).join('\n')}\n</urlset>\n`);
  await writeFile(new URL('robots.txt', root), `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`);
}
