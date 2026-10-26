# SEO and agent readiness

Read this guide when changing search discoverability, crawler access, machine-readable content, identity metadata, or the Cloudflare response layer. It explains the design and the next useful improvements. Use [portfolio deployment](portfolio-deployment.md) for release commands and rollback, and the [2026-10-26 release record](agent-readiness-release-2026-10-26.md) for historical deployment IDs and evidence.

The objective is to make Anmol’s actual work easy to find, read, and attribute while preserving the portfolio’s visual identity. A readiness score measures the audit’s technical checks. It does not measure Google rankings, traffic, client inquiries, or how often an AI recommends Anmol.

## Current evidence

On 2026-10-26, the deployed site passed all 26 checks in `make verify-public`. The latest completed [Is Agentic report](https://is-agentic.com/scan/anmoltomer.com), scanned at `2026-10-26T10:46:40.123Z` (16:16 IST), scored 94/100. Fetching that report again is not a new scan. Its one remaining issue was limited homepage text in the initial HTML response.

These are observations, not permanent guarantees. Recheck public responses and the report timestamp before making a new claim. Search Console ownership, Google indexing, search performance, and changes in AI referrals were not verified in this work.

## What was wrong and what changed

The homepage worked in a browser, but much of its meaningful copy was inserted by JavaScript. An HTTP client reading the initial HTML saw less than a browser that executed the scripts. Separately, asking for Markdown returned HTML because GitHub Pages served a static file without selecting a representation from the request’s `Accept` header.

| Issue | What we built | What it accomplishes |
| --- | --- | --- |
| Missing pages returned HTML errors to Markdown clients | Worker-generated Markdown error text with links, retaining HTTP 404; a custom HTML error page for browser requests | A client can recognize failure and find valid pages |
| `/` ignored `Accept: text/markdown` | Generated `index.md` plus a Worker that negotiates the response at `/` | An agent can read the portfolio without executing JavaScript |
| Identity was not explicitly structured | Person JSON-LD using the existing public name, description, role, email, image, and profile links | A parser can extract the identity and its references |
| No agent usage guidance | `llms.txt` with best-fit jobs, contact instructions, and resource links | Agents can understand when the portfolio is relevant and how to proceed |
| No sitemap | A UTF-8 XML sitemap with canonical page URLs and last-modification dates | Crawlers can discover the intended portfolio pages |
| Audit requested Organization/address fields | Kept the truthful Person identity and added a ContactPoint | Avoids inventing a business or publishing an address merely for a score |
| No substantial trust pages | About, Contact, and Privacy pages, in HTML and Markdown | Readers can inspect background, contact expectations, and data handling |
| Incomplete sharing/identity metadata | Retained the existing canonical URL and `lang`; added Open Graph type, image, title, description, and URL | Gives parsers and link-preview clients explicit attribution and presentation data |

The remaining initial-HTML limitation was preserved during that release. Markdown access fixes that reading path, but it does not populate the HTML placeholders for clients that never request Markdown.

## How the system works

There are two separate stages: generating the files before publication, and choosing a response when someone visits.

### Build time: one source, several readable representations

`prototype/v2/data.js` supplies the existing portfolio copy. `scripts/publish-portfolio.mjs` publishes the selected Meadow Trail design to the repository root. It also calls `scripts/agent-content.mjs`, which generates Markdown, discovery files, and the text pages, and supplies homepage metadata.

The Markdown is assembled from the portfolio data during generation. It is not written by an LLM at request time and is not a second manually maintained biography. The extra About/Contact/Privacy copy lives in the content module. Publishing the files makes them available from GitHub Pages.

### Request time: the Worker chooses the representation

```text
Client requests anmoltomer.com
             |
             v
Cloudflare Worker on anmoltomer.com/*
             |
             v
GitHub Pages: published HTML, Markdown, and assets
             |
             v
Worker returns the selected response to the client
```

GitHub Pages remains the origin, meaning the server holding the published site files. A Worker is a small program that runs on Cloudflare’s infrastructure before the response reaches the client. A [Worker route](https://developers.cloudflare.com/workers/configuration/routing/routes/) lets it operate in front of an existing origin. We retained the hosting setup and DNS instead of adding an application server.

For the homepage, the actual behavior is:

| Request | Worker behavior | Final response |
| --- | --- | --- |
| `GET /`, `Accept: text/html` | Fetch and preserve the homepage HTML body | HTTP 200, `Content-Type: text/html` |
| `GET /`, `Accept: text/markdown` | Check the origin page, then fetch `/index.md` | HTTP 200, `Content-Type: text/markdown` |
| Missing path, `Accept: text/markdown` | Observe the origin’s 404 and return explanatory Markdown with discovery links | HTTP 404, `Content-Type: text/markdown` |
| Missing path, `Accept: text/html` | Preserve the origin’s custom HTML error response | HTTP 404, `Content-Type: text/html` |
| `GET /`, only `Accept: application/json` | No supported representation matches | HTTP 406 |

`Accept` describes what format the client can consume. `Content-Type` describes what the server actually returned. The same public URL can serve different formats; agents do not have to guess a separate `.md` URL. The choice uses the request header, including quality weights and explicit exclusions, rather than browser identity or a bot user-agent list. Clients without a preference receive HTML.

The Worker does not run an AI model, rank the site, submit it to search engines, or create a service API. It changes HTTP delivery. The email contact method remains the way to reach Anmol.

### Why headers and caching matter

Negotiated responses include `Vary: Accept`, telling caches that format selection depends on that request header. Without correct separation, a cache could serve a previously stored Markdown response to a browser requesting HTML, or the reverse.

Cloudflare’s default cache behavior does not automatically vary responses on every `Vary` value. We therefore use `Cache-Control: private, no-store` and `Cloudflare-CDN-Cache-Control: no-store` on negotiated responses. This favors correct representation delivery over caching those final responses. Origin assets retain their existing caching behavior. See [Cloudflare’s cache-control documentation](https://developers.cloudflare.com/cache/concepts/cache-control/).

A homepage Markdown request currently makes an origin request for the page and another for its Markdown representation. That keeps the response tied to published files and checks that the page exists, at the cost of an additional origin subrequest. A cache optimization would need measured benefit and explicit representation isolation before changing this design.

### Boundaries future changes must preserve

- `markdownPaths` in `workers/agent-negotiation.mjs` explicitly covers the homepage and the three trust pages. Adding a new page does not automatically add same-URL Markdown negotiation; its mapping and verification must be added deliberately. Other existing HTML pages are not automatically converted.
- Direct Markdown files may be served by Pages as `text/plain`. The negotiated response at the HTML URL is where the Worker sets `text/markdown`. Verify that response, not only that a `.md` file exists.
- Canonical redirects pass through. `HEAD` returns the selected headers without a response body. HTML validators and byte-range headers are removed before fetching a different Markdown representation.
- Missing, empty, or incorrectly typed Markdown for a mapped page produces HTTP 502, rather than pretending a valid Markdown representation exists. A missing page remains HTTP 404.
- The route is `anmoltomer.com/*`; workers.dev and preview URLs are disabled in the checked configuration. Check current provider state before changing routes or deployment settings.

## How SEO and agent readiness relate

SEO helps search engines discover, understand, and present useful pages for relevant queries. Agent readiness also considers whether a tool can retrieve and use the content reliably. The two share useful foundations, but their consumers have different capabilities.

1. **Discovery:** internal links and a sitemap expose useful URLs. A sitemap is a discovery hint, not a promise of crawling or indexing. See [Google’s sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview).
2. **Access and reading:** HTTP responses, crawl policies, text content, and rendering determine what a client can read. Google can process JavaScript through a rendering stage; other agents may only fetch response text. Build-time HTML content and Markdown serve those clients more directly. See [Google’s JavaScript SEO guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).
3. **Understanding and attribution:** descriptive copy, headings, canonical URLs, and structured identity data help establish what a page covers and who it describes. JSON-LD is data inside a script element, not application code that a parser must execute. Its claims must match the public content. See [Google’s structured-data documentation](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data).
4. **Selection and presentation:** a search engine or AI system chooses whether a page is useful for a particular question. A technically readable site still needs relevant, specific, credible content. Passing an audit cannot establish improved rankings or recommendations; those require actual outcome measurements.

`llms.txt` is a [published proposal](https://llmstxt.org/) for a concise site guide. It supplements content and links for clients that use it. It is not universally consumed, an instruction that every agent must obey, or an access-control mechanism. Google explicitly says its AI Overviews and AI Mode do not require special AI text files or special schema beyond ordinary eligibility and SEO fundamentals. See [Google’s AI features guidance](https://developers.google.com/search/docs/appearance/ai-features).

`robots.txt` communicates crawler policy. It is not authentication and does not keep a secret URL private. `noindex` addresses indexing when a crawler can read the directive; private information needs actual access controls. Cloudflare can prepend managed bot rules to the published file, so inspect the served file as well as the repository source. Decisions about search crawling, user-requested AI retrieval, and model training are separate; do not remove existing bot restrictions merely to raise a readiness score. See [Google’s robots.txt guidance](https://developers.google.com/search/docs/crawling-indexing/robots/intro).

## Where future agents should make changes

| Area | Owning source | Maintenance rule |
| --- | --- | --- |
| Professional copy, timeline, tools, and public profiles | `prototype/v2/data.js` | Update facts here so generated representations stay consistent |
| Homepage layout and browser rendering | `prototype/v2/07-2-trail-meadow/index.html` | Preserve the selected design and interaction behavior |
| Person schema, Open Graph metadata, trust-page copy, Markdown, sitemap, robots | `scripts/agent-content.mjs` | Change the generator, then regenerate; advance `lastmod` for real published-content changes |
| Production HTML generation and asset path rewrites | `scripts/publish-portfolio.mjs` | Keep generation repeatable and source/output relationships intact |
| Negotiation, response headers, errors, and route configuration | `workers/agent-negotiation.mjs`, `workers/wrangler.jsonc` | Test both formats, failure cases, and caching before deploying |

Root `index.html`, `index.md`, `llms.txt`, `sitemap.xml`, `robots.txt`, `404.html`, and the trust-page HTML/Markdown are generated outputs. Hand-editing them alone creates changes that the next generation can overwrite. `assets/portfolio/info.css` owns the text-page styling.

Local behavior tests live in `tests/agent-readiness.test.mjs`; public acceptance checks live in `scripts/verify-public.mjs`. The Makefile names the supported check commands. The public agent guide describes how to use the portfolio; it is not the repository’s maintenance manual. Keep operational instructions in these repository docs.

## Prioritized future improvements

### 1. Publish the existing homepage copy in the initial HTML

This is the next confirmed technical gap. The latest audit counted only 347 characters of meaningful initial HTML. The 500-character audit threshold is a scoring rule, not a Google ranking requirement; the goal is to deliver the real content and useful links without JavaScript.

A bounded implementation would render the current copy during generation, using the same portfolio data, and retain JavaScript for enhancement and animation. Read the existing `data-f` bindings and list-building code before choosing how to render it. Avoid introducing a framework or a second content source just for this change.

Acceptance criteria:

- The HTTP HTML body includes the actual name, professional introduction, substantive experience, and working contact/navigation links before scripts run.
- With JavaScript unavailable, the content is visible and usable; animation classes do not leave it hidden. JSON-LD, HTML, and Markdown agree on identity and facts.
- With JavaScript enabled, text is not duplicated or removed, and the name treatment, theme switch, menu, animations, and 390px layout retain their behavior.
- Tests assert meaningful expected text and links, plus visual behavior, rather than only a character count. Deliberately revise the current unchanged-body regression assertion for this authorized change; do not simply disable it.

### 2. Measure search performance before choosing search work

Check whether an authorized Google Search Console property already exists. With owner-approved access, inspect homepage indexing, Google’s selected canonical, sitemap processing, and the query/page performance reports. Record observations and dates. Do not describe an unknown property as unconfigured or create another verification record without checking.

Choose the audience and desired outcome with Anmol: recruiting, engineering collaboration, consulting inquiries, or technical writing readership lead to different useful content. The outcome is a product decision; it cannot be inferred from a readiness score. Use [Google’s SEO starter guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) as the baseline, not promises of a particular rank.

### 3. Add evidence-rich content when there is a clear audience

Useful candidates include public project write-ups, specific problem/solution examples, and clearer descriptions of responsibilities and outcomes. Publish only substantiated facts and work that can be shared. Case-study selection and publication of employer/client material need owner input; keep confidential details out of generated formats as well as visible pages.

For a new indexable page, deliberately connect its HTML, discoverable internal links, canonical metadata, sitemap entry, and any Markdown representation/Worker mapping. Add the corresponding tests. Existing development prototypes and alternative representations should not become sitemap entries merely because they are files in the repository. A visible link to the trust pages is another possible navigation improvement; the current release exposes them through the sitemap, agent guide, and their own navigation without changing the homepage layout.

### 4. Revisit identity, previews, and performance only for a concrete need

Keep Person schema unless a real separate business identity should be represented. A public business address, service offers, pricing, or availability requires confirmed facts and an owner decision. A dedicated social-preview image is optional; the current metadata uses the existing portrait. Validate appearance before claiming that a preview image improved sharing.

Measure loading and rendering before changing caching or animation assets. If shared caching is introduced for negotiated content, test alternating HTML and Markdown requests, stale validators, errors, and both response bodies. A cache must not mix representations. Additional schema, protocol files, dependencies, or endpoints need an actual consumer and purpose.

## Workflow for the next SEO or agent task

1. Read this guide, then the owning source for the requested change. Use the release record for historical evidence and the deployment guide for operations. State the audience, observed failure, requested scope, and observable acceptance criteria before editing.
2. Capture a current baseline: inspect raw public responses and bodies, the final redirect destination, structured data, the served robots file, and the report’s timestamp. A rendered browser, a direct HTTP fetch, and a search-engine inspection establish different facts.
3. Make the smallest authorized source change and update affected tests and generated outputs. Keep content, metadata, and machine-readable representations consistent. If the task is docs-only, validate docs without running unrelated application tests or deployments.
4. For executable changes, follow the deployment guide’s checks and release sequence. Publish representations before enabling a Worker that depends on them. Verify the actual deployed commit/version and every affected public response; local tests and dry-run bundles are not deployment evidence.
5. Record the change, measured result, timestamp, limitations, and next bounded action in the existing release/handoff docs. Re-scan only when a new audit is useful, and confirm its timestamp. Report traffic or ranking improvement only with relevant before/after measurements.

For a quick read-only check of the existing public contract, run `make verify-public`. For an individual format negotiation check:

```sh
curl -sS -L -i -H 'Accept: text/markdown' https://anmoltomer.com/
curl -sS -L -i -H 'Accept: text/html' https://anmoltomer.com/
curl -sS -L -i -H 'Accept: text/markdown' https://anmoltomer.com/a-path-that-does-not-exist
```

Inspect the final status, Content-Type, Vary, and body together. A passing status alone does not verify a Markdown response, and a completed audit snapshot does not prove a search outcome.
