# Portfolio deployment

The selected source is `prototype/v2/07-2-trail-meadow/`, with shared copy in `prototype/v2/data.js`. Other designs are retired. The sibling `../prototypes/` archive is a frozen local backup and is not a release input.

Run `node scripts/publish-portfolio.mjs` after editing the selected source. It generates the root `index.html` and copies its runtime assets into `assets/portfolio/`, rewriting only asset paths and production metadata. No package installation is needed. Preview the root URL with the existing local static server at `http://localhost:8731/`.

Before publishing, check script syntax, local asset responses, both themes at desktop and 390px, menu navigation, footer direction controls and the absence of the old copyright/hero-image bleed. Review the staged diff. Stage the selected source, generated homepage/runtime assets, new logos and relevant project documentation explicitly. Do not stage local `output/` evidence, Downloads, resumes supplied for copy research, or scratch files.

GitHub Pages was observed on 2026-10-25 to publish `master` at `/`, with the custom domain `anmoltomer.com`. Confirm the actual source in the Pages API before pushing; a branch named `main` did not exist at that observation. Preserve `CNAME`. A different publishing branch requires an explicit source change.

After pushing, verify that the latest Pages build belongs to the release commit. Compare the served homepage and runtime asset hashes with the release files, and inspect the live page and interactions. A successful Git push is not deployment verification. Roll back a published release with a normal revert of its commit, followed by the same build/live checks; do not force-push history.
