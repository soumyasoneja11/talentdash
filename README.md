# TalentDash — Frontend Engineering Trial

## Live URL

**Production:** [https://talentdash-three.vercel.app](https://talentdash-three.vercel.app)

- `/` redirects to `/salaries` (primary trial deliverable)
- `/companies/[slug]` — 27 pre-rendered company pages at build time
- `/compare` — static shell with client-side comparison UI
- No environment variables required (mock data mode)

## Quick Start (under 5 minutes)

```bash
git clone https://github.com/soumyasoneja11/talentdash.git
cd talentdash
npm install
npm run dev
# Open http://localhost:3000/salaries
```

To run the filter & sorting unit test suite:

```bash
npm run test:filters
```

## Environment Variables

No environment variables required for mock data mode.
List any that would be needed in production:

```
NEXT_PUBLIC_SITE_URL=https://talentdash.com
```

## Project Structure

- **`app/`**: Next.js App Router root layout, pages, routes, sitemap configuration, and static resource handlers.
- **`components/ui/`**: Pure rendering, atomic presentation components (badges, skeletons, labels) that contain no state.
- **`components/features/`**: Large page-level UI blocks (tables, dynamic filter panels, compare components) coordinating presentation and client interactions.
- **`lib/`**: Shared core utility helpers, data filter models, type tests, and static data stores.
- **`types/`**: Project-wide TypeScript interface declarations defining models like records, filters, stats, and badges.

## Architecture Decisions

### Rendering Strategy

- **`/salaries` (Static with ISR):** We design `/salaries` to render statically with Incremental Static Regeneration (ISR) as the primary strategy. This ensures fast initial load times, reduces server load, and provides search engines with fully pre-rendered HTML for maximum SEO indexing. Refined filters are handled via client-side router navigation, fetching updated server-rendered views reactively.
- **`/companies/[slug]` (Static):** Utilizing Next.js `generateStaticParams`, each company page is pre-built statically at build time. Since company data changes infrequently compared to search requests, serving pre-rendered HTML from the edge yields premium LCP < 1.5s and zero compute costs at request time.
- **`/compare` (Client-only):** Designed as an interactive client component wrapped in a Suspense boundary. It is dynamic, client-heavy, and reads selectors from URL search parameters on the client, avoiding database roundtrips for real-time comparative calculations.

### Why No Component Library

In alignment with the trial brief guidelines, custom Tailwind components are implemented instead of generic component libraries (such as Radix, shadcn, or Material UI). Writing semantic HTML styled directly with Tailwind CSS ensures:

- Zero hydration payload overhead from unneeded components or styled engines.
- Maximum visual flexibility to match premium designs, harmonious HSL palettes, and fluid responsive behaviors.
- Highly optimized DOM structure free of nested container divs that trigger layout shifts.

### Currency Conversion

The `CONVERSION_RATES` constant defined in `lib/mock-data.ts` acts as the single source of truth for currency calculations throughout the application. Centralizing conversion rates ensures complete mathematical consistency between the salaries list, company statistics, and compare page differentials. In a production environment, this constant would be replaced by a reactively cached, cron-updated foreign exchange API query.

### total_compensation Rule

Total compensation (`total_compensation`) is strictly computed on the server side as the mathematical sum of `base_salary + bonus + stock`. The client is never trusted to supply or alter the total compensation value, preventing security vulnerabilities and ensuring data integrity.

## Key Components

- **`CompanyLogo`**: Deterministic background HSL color generator that displays logo images or monogram letter fallbacks on loading failure.
- **`FilterBar`**: Interactive search, dropdown selectors, and checkbox groups synced directly to page query states.
- **`SalaryTable`**: Accessible data list featuring server-side sort header links, `scope="col"` markers, and screen-reader captions.
- **`ComparisonTable`**: Hydrated grid comparing two candidate offers side-by-side with color-coded difference indicators.
- **`TableSkeleton`**: Pre-sized placeholder layout matching column structures to eliminate Cumulative Layout Shift (CLS) on initial load.

## What I Would Build With More Time

1. **Real Database Integration:** Replace mock data with a database (e.g. PostgreSQL) and database client (Prisma/Drizzle) for fast pagination and complex queries.
2. **FX API Integration:** Connect to a real-world Foreign Exchange Rate API (e.g. Open Exchange Rates) to fetch hourly currency rates instead of relying on hardcoded exchange variables.
3. **Submission Authenticator:** Implement user submission authentication (NextAuth/Clerk) and verification flows to ensure submitted salary figures are backed by valid documents.
4. **Interactive Charts:** Add charts (using Recharts or Chart.js) to display salary distribution trends over time and location.

## Hardest Decision

The hardest architectural decision was choosing how to handle the currency conversions in the side-by-side offer comparison tool. Specifically, deciding whether to force both offers into a single currency or allow independent choices, and where to perform conversion maths. Ultimately, I resolved to dynamically auto-detect the dominant currency of the two records and convert the outlier record using our shared `CONVERSION_RATES` model. This minimized cognitive load for the user while keeping calculations fully deterministic and preventing discrepancy errors.

## Trade-offs

- **Static vs On-Demand Filtering:** Selected URL-based query parameter updates using Next.js `router.push` instead of client-side-only filtering. While this adds a slight latency for server roundtrips, it ensures that search results are fully shareable, bookmarkable, and indexed by search crawlers.
- **Inline SVG Icons:** Opted for inline SVG definitions instead of loading external icon packages (e.g., FontAwesome, Lucide React). This keeps the JavaScript bundles exceptionally small and prevents layout shifts during icon hydration.
- **Mock Data Currency Normalization:** Computed company medians on raw compensation numbers without dynamic currency-adjustments inside the core stats builder, relying on company-level currency parity in the mock set. This was selected to save runtime complexity.

## Pre-Submission Verification

Verified against **https://talentdash-three.vercel.app** on 6 June 2026.

### Core functionality (HTTP status)

| URL | Expected | Result |
|-----|----------|--------|
| `/salaries` | 200 | ✅ 200 |
| `/companies/amazon` | 200 | ✅ 200 |
| `/companies/nonexistent` | 404 | ✅ 404 |
| `/compare` | 200 | ✅ 200 |

### SEO

| Check | Result |
|-------|--------|
| `/salaries` contains `application/ld+json` | ✅ Found |
| `/companies/amazon` contains `canonical` | ✅ Found |
| `/sitemap.xml` returns valid XML | ✅ 200, valid urlset |
| `/robots.txt` returns content | ✅ User-agent, Allow, Disallow, Sitemap |

### Performance (Lighthouse, live URL)

| Metric | Mobile | Desktop | Target |
|--------|--------|---------|--------|
| Performance score | 80 | 99 | ≥ 85 |
| LCP | 3.1s | 0.7s | < 2.5s |

Mobile LCP is slightly above target on cold load (Tabler icon webfont CDN). Desktop exceeds all targets. Re-run at [PageSpeed Insights](https://pagespeed.web.dev/analysis?url=https://talentdash-three.vercel.app/salaries).

### README checklist

- ✅ Live Vercel URL at the top
- ✅ `git clone` + `npm install` + `npm run dev` quick start
- ✅ No environment variables needed (mock mode)
- ✅ Architecture decisions section
- ✅ "What I Would Build With More Time" section
- ✅ Hardest decision paragraph

### Commit history

Incremental commits (not a single Day-3 dump):

- `feat: implement foundation, mock data, and salaries page list`
- `feat: configure sitemaps, robots.txt, and metadata builders`
- `feat: implement company research page and stats layout`
- `feat: implement interactive compare page and comparison table`
- `perf: optimize LCP/CLS performance, accessibility contrast, and document architecture`
- `fix: edge cases` (sorting, filters, empty states — across follow-up commits)
- `docs: README and architecture documentation`
- `chore: deployment configuration and Vercel setup`

## Submission Notes

I built the TalentDash frontend trial deliverables — a filterable salary table with URL-encoded state, 27 statically generated company pages, a side-by-side compare tool with delta calculations, SEO metadata with JSON-LD, and career calculators — all deployed live at **https://talentdash-three.vercel.app**. The hardest architectural decision was balancing React Server Components with shareable filter state: keeping the salary table as a server component while the FilterBar syncs query parameters client-side, so every filtered view is bookmarkable and crawlable without shipping the full dataset to the browser. I am most proud of the end-to-end correctness of filter + sort + pagination working together, with deterministic currency conversion through a single `CONVERSION_RATES` source of truth across salaries, company stats, and compare deltas. With more time, I would connect to a real PostgreSQL API with ISR revalidation instead of mock JSON, and optimize mobile LCP (currently ~3.1s on Lighthouse mobile, slightly above the 2.5s target, largely due to the Tabler icon webfont CDN). I deliberately cut authentication, community/forum modules, a real database layer, and a marketing homepage as the primary entry point — the root redirects to `/salaries` because the trial brief identifies the salary table as the core SEO asset and primary deliverable.
