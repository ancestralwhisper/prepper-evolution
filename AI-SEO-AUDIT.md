# AI SEO Audit — Prepper Evolution
**Date:** March 31, 2026 | **Framework:** GEO (Generative Engine Optimization)

---

## What's Already Done (Site-Level Fixes Applied Today)

### robots.txt — AI Crawlers Explicitly Allowed
All major AI search crawlers are now explicitly allowed:
- `GPTBot` + `ChatGPT-User` (ChatGPT)
- `PerplexityBot` (Perplexity)
- `ClaudeBot` + `anthropic-ai` (Claude)
- `Google-Extended` (Gemini + AI Overviews)
- `Bingbot` (Copilot)
- `CCBot` (Common Crawl training corpus) — **blocked** (not a search engine, just training data)

### Article Schema — Upgraded
Every article page now outputs enhanced JSON-LD:
- `BlogPosting` (more specific than `Article`)
- `dateModified` — freshness signal for AI
- `description` — from WP excerpt
- `publisher` org block — entity recognition
- `mainEntityOfPage` — canonical URL link
- Canonical URL passed to `og:url` and `<link rel="canonical">`

### "Last Updated" Byline
Articles modified more than 7 days after publish now show an "Updated [date]" label — visible freshness signal.

---

## Content-Level Audit — What's Missing

### The 5 New Tool Articles (Posts 1347–1351)

These are the highest-priority AI citation targets — high-intent queries, calculator-driven content.

| Article | Key Query | FAQ Section | Stats w/ Sources | Author Bio | Definition Block |
|---------|-----------|:-----------:|:----------------:|:----------:|:----------------:|
| How Many Solar Panels | "how many solar panels do i need" | No | Partial | No | Yes |
| Bug Out Bag List | "bug out bag list" | No | No | No | No |
| 72-Hour Survival Kit | "72 hour survival kit" | No | No | No | No |
| How Much Water to Store | "how much water to store for emergency" | No | Partial | No | No |
| Food Storage Calculator | "food storage calculator" | No | No | No | No |

**Priority fixes for each article:**

#### How Many Solar Panels (1347) — Live Now
- [ ] Add FAQ block at bottom: "How many solar panels to charge a battery bank?", "What size solar panel do I need for an RV?", "Can I run a refrigerator on solar panels?"
- [ ] Add stat with source: "The average US home uses 29 kWh/day (EIA, 2023)" — ties to calculator need
- [ ] Add `FAQPage` schema block (ContentForger: inject into WP content as HTML schema tag)

#### Bug Out Bag List (1348) — Live Apr 1
- [ ] First paragraph: add a clear 40-60 word definition — "A bug out bag (BOB) is a portable emergency kit designed to sustain you for 72 hours while evacuating a disaster zone. Most preppers build around a 25–35lb pack with water, food, shelter, comms, and first aid covering the basics."
- [ ] Add FAQ: "How heavy should a bug out bag be?", "What's the difference between a bug out bag and a get-home bag?", "How often should I rotate my bug out bag?"
- [ ] Add weight stat with FEMA or military source
- [ ] Add `FAQPage` schema

#### 72-Hour Survival Kit (1349) — Live Apr 2
- [ ] FEMA's recommendation is a natural stat to cite: "FEMA recommends a minimum 72-hour supply of food and water per person" — link to ready.gov
- [ ] Add definition block in first paragraph
- [ ] Add FAQ: "Is 72 hours enough for most disasters?", "What does FEMA recommend in a 72-hour kit?", "Can one kit work for a family of 4?"
- [ ] This article has the strongest E-E-A-T angle (Mike saw Sandy firsthand as a lineman) — make sure that's in the intro

#### How Much Water to Store (1350) — Live Apr 3
- [ ] FEMA stat: "FEMA recommends 1 gallon per person per day" — link to ready.gov (then explain why the real number is 2 gallons)
- [ ] Add definition block: exactly what "emergency water storage" means
- [ ] Add FAQ: "How long does stored water last?", "Can I store water in plastic soda bottles?", "How much water for a 2-week emergency?"
- [ ] The FEMA → real number contrast is a perfect AI citation pattern

#### Food Storage Calculator (1351) — Live Apr 4
- [ ] Add first-paragraph hook with a specific stat: "FEMA recommends a 3-day supply minimum; the recommended standard for serious preparedness is 90 days (USDA, 2022)"
- [ ] Add FAQ: "How many calories per day for emergency food storage?", "What's the best food to stockpile for emergencies?", "How do I store food for 1 year?"
- [ ] Add comparison table: storage methods (freeze-dried vs. canned vs. bulk dry goods) — AI loves comparison tables

---

## Schema Markup Needed (ContentForger: Add to WP Article HTML)

Each of the 5 articles needs a `FAQPage` schema block injected into the WP content. Add this as a raw HTML block at the bottom of each post in WordPress:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "[FAQ QUESTION 1]",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[ANSWER — 40-60 words, self-contained]"
      }
    },
    {
      "@type": "Question",
      "name": "[FAQ QUESTION 2]",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[ANSWER]"
      }
    }
  ]
}
</script>
```

**How to add in WordPress:** Edit post → Add block → Custom HTML → paste the schema → update/publish.

---

## Older High-Value Articles — AI Citation Upgrades

These are the best candidates to get cited in AI answers for core prepper queries:

| Post | Slug | Priority Fix |
|------|------|-------------|
| 777 | overlanding-preparedness-guide | Add "what is overlanding" definition block, FAQ, cite stats on overlanding market growth |
| 47 | emergency-preparedness | Add definition block, FEMA stats, FAQ |
| 48 | bug-out-bags | Same as 1348 but check for duplicates |
| 1295 | project-nomad | Add "what is a Raspberry Pi offline server" definition, HowTo schema, FAQ |

---

## Authority Signals — Across All Articles

The Princeton GEO study shows these are the highest-impact changes:

| Action | Citation Boost | Status |
|--------|:--------------:|--------|
| Add cited statistics (with source links) | +37-40% | Missing on most articles |
| Add expert quotes or "according to" framing | +25-30% | Missing |
| Add FAQ blocks | Extraction-ready | Missing on all 5 new articles |
| Show "Last Updated" date | Freshness | Done (site-level) |
| Author bio with real credentials | +25% | Partially done (name shown, no bio page) |

**Mike's credentials to highlight in author bio or article intros:**
- Full-time electrical lineman (union, NJ)
- Mutual aid power restoration: Sandy, CA wildfires, TX winter storm, FL hurricanes, ME ice storms
- First-hand experience watching critical infrastructure fail during major disasters
- This is the strongest E-E-A-T angle on the site — it's not just prepper theory, it's someone who has been on the repair crew

---

## Author Bio Page

The site shows "author name" in the byline but links to `/about`. That page needs:
- Mike's real credentials (lineman, mutual aid states, years of experience)
- Specific disasters he's responded to (Sandy, CA, TX, etc.)
- A real photo
- This page should be optimized for the query "who writes Prepper Evolution" / brand authority

---

## AI Visibility Monitoring — What to Check Monthly

Run these queries across ChatGPT, Perplexity, and Google:

1. "how many solar panels do i need for emergency power"
2. "bug out bag checklist 2026"
3. "72 hour survival kit list"
4. "how much water to store for emergency"
5. "food storage calculator"
6. "project nomad raspberry pi offline server"
7. "overlanding preparedness guide"
8. "what is a bug out bag"

Track: Are we cited? If not, who is? Compare our structure to theirs.

---

## Quick Wins Summary

**Do this week (ContentForger tasks):**
1. Add FAQ blocks to all 5 new tool articles (posts 1347-1351) in WordPress
2. Add `FAQPage` schema to each via Custom HTML block
3. Add FEMA/EIA/USDA stat citations (with links to source) to each article
4. Add 40-60 word definition blocks to the top of each article

**Do this month:**
1. Build Mike's author bio page at `/about` with real credentials
2. Add FAQ + stats to top 5 older articles (post 777, 47, 48, 49, 1295)
3. Add `HowTo` schema to N.O.M.A.D. article (step-by-step build guide)

**Already done:**
- robots.txt — all AI bots explicitly allowed
- Article schema — enhanced with dateModified, publisher, canonical
- "Last Updated" byline visible on all articles
