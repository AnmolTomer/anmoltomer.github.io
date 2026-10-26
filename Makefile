.PHONY: generate test verify-public worker-check
generate:
	node scripts/publish-portfolio.mjs

test:
	node --test tests/*.test.mjs

verify-public:
	node scripts/verify-public.mjs https://anmoltomer.com

worker-check:
	pnpm dlx wrangler@4.152.0 deploy --dry-run --config workers/wrangler.jsonc
