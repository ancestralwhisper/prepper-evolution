# Prepper Evolution

## Overview

Prepper Evolution is a content-driven affiliate website for preppers, overlanders, and outdoor enthusiasts. It serves as a modern preparedness hub featuring gear reviews with Amazon affiliate links, blog articles pulled from a headless WordPress CMS, product comparison guides, and a newsletter signup. The site is built as a full-stack TypeScript application with a React frontend and Express backend, using PostgreSQL for storing products, comparisons, and newsletter subscribers.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (React + Vite)
- **Framework**: React with TypeScript, bundled by Vite
- **Routing**: Uses `wouter` for client-side routing (lightweight alternative to React Router)
- **Styling**: Tailwind CSS with CSS custom properties for theming. Uses shadcn/ui component library (New York style) with Radix UI primitives underneath
- **State Management**: TanStack React Query for server state (API calls, caching)
- **Animations**: Framer Motion for page transitions and scroll animations
- **Dark/Light Mode**: Class-based dark mode (`darkMode: 'class'`). Defaults to system preference, user can toggle manually, persisted in localStorage. The `useDarkMode` hook manages this
- **Fonts**: Inter (body) and Oswald (display/headings) loaded from Google Fonts

### Key Frontend Pages
- `/` — Landing page with hero, featured content, latest articles, newsletter signup, trust bar
- `/start-here` — Onboarding guide for new visitors
- `/articles/:slug` — Individual article pages (content from WordPress)
- `/articles` — Article listing with pagination
- `/products/:slug` — Individual product pages (data from PostgreSQL)
- `/products` — Shop Gear page with all products
- `/comparisons/:slug` — Head-to-head gear comparison pages
- `/category/:name` — Category-filtered content pages
- `/tools` — Tools index page with video hero, quiz banner, saved kits link, all 7 tools
- `/tools/bug-out-bag-calculator` — Interactive BOB weight calculator with 60+ gear items, donut chart, affiliate links, print/share
- `/tools/solar-power-calculator` — Solar panel & power station sizing calculator with device library, region-based sun hours, PDF export
- `/tools/water-storage-calculator` — Water storage calculator for household/emergency planning with usage breakdown donut chart
- `/tools/food-storage-calculator` — Food storage calculator with calorie planning, shelf life tracking, family size support
- `/tools/72-hour-kit-builder` — Guided questionnaire that generates a personalized 72-hour emergency kit checklist
- `/tools/shtf-simulator` — Scenario-based survival simulator with branching decisions and scoring
- `/tools/community` — Community gallery of shared builds (BOB, solar, water, food, kit) with submission form
- `/tools/my-kits` — Local kit library dashboard (saved kits stored in localStorage)
- `/quiz` — Preparedness quiz with scoring, results, and tool recommendations

### Backend (Express 5)
- **Runtime**: Node.js with TypeScript via `tsx`
- **Framework**: Express 5 with JSON body parsing
- **API Pattern**: REST API under `/api/` prefix
- **Dev Server**: Vite dev server integrated as middleware during development (HMR via `server/vite.ts`)
- **Production**: Static files served from `dist/public`, with SPA fallback to `index.html`

### API Routes
- `GET /api/products` — List all products
- `GET /api/products/:slug` — Single product by slug
- `GET /api/comparisons` — List all comparisons
- `GET /api/comparisons/:slug` — Single comparison by slug
- `POST /api/newsletter` — Newsletter email signup (also sends to Kit API)
- `POST /api/gear-requests` — Submit gear request with optional `source` field + Telegram notification
- `POST /api/gear-tracking` — Anonymous usage tracking for calculators
- `GET /api/community-builds` — List approved community builds (from JSON file)
- `POST /api/community-builds` — Submit new community build with profanity filter + Telegram notification
- `GET /api/wp/posts` — Proxy to WordPress REST API for blog posts (cached)
- `GET /api/wp/categories` — Proxy to WordPress categories
- `GET /api/link-health` — Link health check results
- WordPress proxy endpoints pass through to `https://wp.prepperevolution.com/wp-json/wp/v2`

### Database (PostgreSQL + Drizzle ORM)
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema** (in `shared/schema.ts`):
  - `products` — Gear/product listings (slug, name, description, price, salePrice, onSale, category, imageUrl, amazonLink, features array)
  - `comparisons` — Head-to-head comparison guides (slug, title, description, productSlugs array, verdict)
  - `newsletter_subscribers` — Email signups (email, subscribedAt timestamp)
- **Migrations**: Managed via `drizzle-kit push` (schema push approach, not migration files)
- **Validation**: Drizzle-zod for insert schema generation, Zod for runtime validation
- **Seed Data**: `server/seed.ts` contains product and comparison seed data with real Amazon affiliate links (tag: `prepperevo-20`)

### Content Strategy
- **Products & Comparisons**: Stored in PostgreSQL, seeded with real affiliate product data
- **Articles/Blog**: Fetched from WordPress headless CMS at `wp.prepperevolution.com/wp-json/wp/v2` via server-side proxy
- **Article Images**: Slug-based fallback image map using Unsplash URLs when WordPress featured images aren't available
- **Caching**: WordPress API responses cached for 5 minutes on the server side

### Build System
- **Dev**: `tsx server/index.ts` runs the Express server with Vite middleware for HMR
- **Build**: Custom `script/build.ts` that runs Vite build for client and esbuild for server, outputting to `dist/`
- **Production**: `node dist/index.cjs` serves the built app

### SEO
- Custom `useSEO` hook sets document title, meta description, and Open Graph tags per page
- JSON-LD schema markup for product pages
- OpenGraph image plugin (`vite-plugin-meta-images.ts`) for social sharing
- Article pages include table of contents parsed from heading elements

### Project Structure
```
client/          — Frontend React app
  src/
    pages/       — Route-level page components
    pages/tools/ — Tools section (ToolsIndex, BugOutBagCalculator, SolarPowerCalculator, WaterStorageCalculator, FoodStorageCalculator, KitBuilder, SHTFSimulator, CommunityGallery, MyKits, gear-data, device-data, water-data, food-data, kit-data, scenarios)
    components/  — shadcn/ui components
    components/tools/ — Tool-specific components (DonutChart, PdfExport)
    content/     — Static content data (products, articles, comparisons)
    hooks/       — Custom React hooks (dark mode, SEO, toast, mobile detection)
    lib/         — Utilities (queryClient, WordPress API helpers, cn utility)
    assets/      — Static images
  public/        — Public static files (images, favicon)
server/          — Express backend
  index.ts       — Server entry point
  routes.ts      — API route definitions
  storage.ts     — Database access layer (IStorage interface + DatabaseStorage)
  db.ts          — Database connection setup
  seed.ts        — Seed data for products and comparisons
  vite.ts        — Vite dev server integration
  static.ts      — Production static file serving
shared/          — Shared code between client and server
  schema.ts      — Drizzle database schema and Zod validators
```

## External Dependencies

### Database
- **PostgreSQL** — Primary data store, connected via `DATABASE_URL` environment variable
- **pg** (node-postgres) — PostgreSQL client driver
- **Drizzle ORM** — Type-safe ORM for database queries
- **connect-pg-simple** — PostgreSQL session store (available but sessions not actively used)

### WordPress CMS
- **WordPress REST API** at `https://wp.prepperevolution.com/wp-json/wp/v2` — Headless CMS for all blog/article content
- Posts fetched with `?_embed` parameter for featured images, authors, and categories in single requests

### Amazon Affiliate Program
- Product links use affiliate tag `prepperevo-20`
- All product Amazon URLs follow pattern `https://www.amazon.com/dp/{ASIN}?tag=prepperevo-20`

### UI Libraries
- **Radix UI** — Accessible primitive components (dialog, dropdown, tabs, etc.)
- **shadcn/ui** — Pre-styled component library built on Radix
- **Framer Motion** — Animation library for page transitions and scroll effects
- **Embla Carousel** — Carousel component
- **Lucide React** — Icon library
- **cmdk** — Command palette component

### Image Sources
- **Unsplash** — Fallback images for articles and some products
- Local images in `client/public/images/` for select products