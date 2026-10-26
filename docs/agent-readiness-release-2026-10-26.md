# Agent readiness release, 2026-10-26

The requested discovery and negotiation changes are deployed to `https://anmoltomer.com/`. A fresh Is Agentic snapshot reports **94/100**, scanned at `2026-10-26T10:46:40.123Z` (16:16 IST): <https://is-agentic.com/scan/anmoltomer.com>. The user-supplied baseline was 69; a newer pre-deployment snapshot reported 55. These snapshots used different site-type eligibility, so the score difference alone is not the verification evidence.

## Published artifacts

- GitHub Pages built `60285a9084ccf558a776551d345caf0fa19bf362` from `master` at `/`. The release introduced the content in `082b854cb6dc0cd7a8e9f715735e0d2c87446a30`; the second commit refined About copy and accounted for Cloudflare-managed robots directives in verification.
- Cloudflare Worker `portfolio-agent-negotiation`, version `7bd342dd-123e-492d-8d70-83ad93e90e35`, is deployed on route `anmoltomer.com/*` with compatibility date `2026-10-26`. The dashboard confirms both workers.dev and preview URLs are disabled. GitHub Pages remains the origin; DNS and `CNAME` were retained.
- Worker source SHA-256: `34cb1d8757b82f96f33f90d90576e72b46ae8eac39ddfcc3163a0636ff130e6d`. Wrangler uploaded the checked source from this checkout. Provider version metadata confirms the deployed ID and compatibility date; public behavior confirms the route is executing.
- The homepage has Person JSON-LD, canonical and Open Graph metadata, and a Markdown alternate link. Its body and interaction scripts are unchanged. Added files include `index.md`, `llms.txt`, `sitemap.xml`, `robots.txt`, custom `404.html`, and About/Contact/Privacy pages in HTML and Markdown.

## Verification

`make generate test worker-check` passed: eight Node tests and a Wrangler bundle/startup check. The tests include weighted Accept negotiation, wildcards and explicit exclusions, HEAD, unsupported types, Markdown 404s, origin failures, empty representations, preservation of HTML and assets, generated schema/discovery content, and an unchanged-homepage-body assertion. The controlled origin responses in unit tests do not verify GitHub Pages or Cloudflare; the live checks below cover those providers.

`make verify-public` passed all 26 checks against the public domain after activation. Those cover both homepage representations, both formats of all trust pages, all generated machine-readable files and the new stylesheet, the public Open Graph image, missing-path HTTP 404 in HTML and Markdown, the custom error document’s noindex metadata, slash redirects, HEAD, weighted Accept, and HTTP 406 for unsupported representations. The Markdown body checks compare published content with generated local files. Cloudflare’s existing managed robots block is retained; the verifier checks that origin directives remain present alongside it.

The served sitemap validated against the official Sitemaps XSD with `xmllint`. Direct `curl -sS -L -i` requests confirmed `200 text/markdown` with `Vary: Accept` at `/`, retained HTML for `Accept: text/html`, and `404 text/markdown` with links to the agent guide and sitemap on a unique missing path. Negotiated responses have `Cache-Control: private, no-store` so shared caches cannot mix formats.

Browser checks used the explicitly authorized Anmol Chrome profile. The homepage rendered at desktop and 390px, theme switching and the mobile menu worked, and no horizontal overflow appeared. The About page loaded its stylesheet and substantive text without JavaScript at 390px. These were focused checks, not an exhaustive animation or cross-browser regression suite. The original light theme and normal viewport were restored afterward.

Local, ignored evidence is in `output/agent-readiness/`: HTTP transcripts, `public-verification.txt`, the served sitemap, fresh audit JSON, and screenshots of the live route, homepage, mobile About page, and report. The Cloudflare dashboard and fresh report were left open.

## Decisions and remaining work

The site identifies a person. Person schema includes the existing public email, profile links, and a ContactPoint. No Organization or PostalAddress was invented or published. Adding a business identity or postal address requires a real business record and an explicit owner decision.

The fresh audit’s only remaining issue is `content-no-js`: it counts 347 characters of homepage content in raw HTML. The homepage’s existing client rendering was preserved within the supplied fix list. A follow-up could pre-render its existing copy while preserving appearance and hydration behavior; the negotiated Markdown homepage already provides complete text without executing JavaScript.

Cloudflare’s browser code editor stalled while loading. The user approved the official Wrangler OAuth alternative with account/user/zone read, Workers Scripts Write, Workers Routes Write, and background access. Authentication succeeded; its encrypted credential is protected by macOS Keychain. No broader Cloudflare scopes were granted, and no additional credentials are needed for this release.

Read the implementation in this order: `scripts/agent-content.mjs`, `scripts/publish-portfolio.mjs`, `workers/agent-negotiation.mjs`, `tests/agent-readiness.test.mjs`, then `docs/portfolio-deployment.md`. The final follow-up commit records verification and expands public checks; it does not change the deployed content or Worker source.
