# TalentDash — Frontend Engineering Trial

## Live URL

[Not yet deployed — see local setup]

## Quick Start (under 5 minutes)

```bash
git clone https://github.com/talentdash/talentdash.git
cd talentdash
npm install
npm run dev
# Open http://localhost:3000
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
