/**
 * optimize-and-schedule-articles.mjs
 * Sets categories, tags, RankMath SEO meta, and publish schedule for the 5 tool articles.
 * Post 1347 publishes NOW. Posts 1348–1351 schedule 9am EDT Apr 1–4.
 *
 * Run: node tools/optimize-and-schedule-articles.mjs
 */

const WP_API  = "https://wp.prepperevolution.com/wp-json/wp/v2";
const WP_USER = "pe_admin";
const WP_PASS = "S4U4 3447 gTtb uGvE Ga8f h4hi";
const AUTH    = "Basic " + Buffer.from(`${WP_USER}:${WP_PASS}`).toString("base64");

// ─── Existing category IDs (confirmed) ────────────────────────────────────
const CAT = {
  toolsCalculators:      248,
  bugOutBags:            249,
  emergencyPreparedness: 250,
  waterPreparedness:     251,
  foodStorage:           10,
  powerStations:         27,
  electronics:           31,
  bagsPacks:             29,
  gettingStarted:        8,
  preparedness:          3,
  water:                 9,
};

// ─── Existing tag IDs (confirmed) ─────────────────────────────────────────
const TAG = {
  // Solar
  solarPanels:          43,
  solarPower:           167,
  solarPowerCalculator: 73,
  emergencyPower:       171,
  portablePower:        42,
  powerStation:         170,
  offGrid:              168,
  prepperCalculator:    70,
  freePrepperTools:     69,
  survivalTools:        80,
  // BOB
  bugOutBag:            82,
  bugOutBagChecklist:   103,
  bugOutBagGearList:    121,
  bugOutBagEssentials:  119,
  bob:                  100,
  survivalGear:         120,
  emergencyBag:         101,
  bugOutBags:           41,
  // 72-hour
  _72hrKit:             76,
  _72hrBag:             102,
  emergencyPreparedness: 77,
  familyEmergencyKit:   112,
  disasterPrep:         205,
  fema:                 206,
  disasterPreparedness: 84,
  checklist:            204,
  // Food
  foodStorage:          50,
  foodStorageCalc:      75,
  emergencyFood:        139,
  prepperFood:          140,
  longTermStorage:      197,
  nonPerishableFood:    215,
  freezeDriedFood:      141,
  survivalPlanning:     85,
  // Shared
  survivalCalculator:   72,
  prepping4Beginners:   81,
  shtf:                 122,
};

// ─── Article definitions ───────────────────────────────────────────────────
// Order: highest priority first (best traffic potential at top)
const ARTICLES = [
  {
    id:           1347,
    slug:         "how-many-solar-panels-do-i-need",
    title:        "How Many Solar Panels Do I Need? (Free Calculator + Real Numbers)",
    seoTitle:     "How Many Solar Panels Do I Need? Free Calculator + 2026 Guide",
    seoDesc:      "Stop guessing. Enter your devices and ZIP code to calculate exactly how many solar panels you need for emergency power — with real math, not ballpark estimates.",
    focusKw:      "how many solar panels do i need",
    categories:   [CAT.powerStations, CAT.toolsCalculators, CAT.electronics],
    tags:         [TAG.solarPanels, TAG.solarPower, TAG.solarPowerCalculator, TAG.emergencyPower, TAG.portablePower, TAG.powerStation, TAG.offGrid, TAG.prepperCalculator, TAG.freePrepperTools, TAG.survivalTools],
    // Publish immediately
    status:       "publish",
    date:         null,
  },
  {
    id:           1348,
    slug:         "bug-out-bag-list",
    title:        "Bug Out Bag List 2026: What to Pack (and What to Skip)",
    seoTitle:     "Bug Out Bag List 2026: What to Pack, What to Skip, and How Heavy Is Too Heavy",
    seoDesc:      "A real bug out bag list built around weight limits, not wish lists. 80+ items across 11 categories with a full weight breakdown — and a free calculator to build yours.",
    focusKw:      "bug out bag list",
    categories:   [CAT.bagsPacks, CAT.bugOutBags, CAT.gettingStarted, CAT.toolsCalculators],
    tags:         [TAG.bugOutBag, TAG.bugOutBagChecklist, TAG.bugOutBagGearList, TAG.bugOutBagEssentials, TAG.bob, TAG.survivalGear, TAG.emergencyBag, TAG.bugOutBags, TAG.prepperCalculator, TAG.freePrepperTools],
    status:       "future",
    date:         "2026-04-01T09:00:00",
  },
  {
    id:           1349,
    slug:         "72-hour-survival-kit",
    title:        "72-Hour Survival Kit: What FEMA Gets Right (and What It Misses)",
    seoTitle:     "72-Hour Survival Kit Checklist 2026: Beyond the FEMA Basics",
    seoDesc:      "FEMA's 72-hour kit is a starting point, not a finish line. Here's the complete list adjusted for your region, climate, and hazards — plus a free builder by ZIP code.",
    focusKw:      "72 hour survival kit",
    categories:   [CAT.emergencyPreparedness, CAT.gettingStarted, CAT.preparedness],
    tags:         [TAG._72hrKit, TAG._72hrBag, TAG.emergencyPreparedness, TAG.familyEmergencyKit, TAG.disasterPrep, TAG.fema, TAG.disasterPreparedness, TAG.checklist, TAG.survivalGear, TAG.freePrepperTools, TAG.prepperCalculator],
    status:       "future",
    date:         "2026-04-02T09:00:00",
  },
  {
    id:           1350,
    slug:         "how-much-water-to-store-for-emergency",
    title:        "How Much Water to Store for an Emergency (Real Numbers, Not FEMA Minimums)",
    seoTitle:     "How Much Water to Store for an Emergency: Real Household Numbers for 2026",
    seoDesc:      "FEMA says 1 gallon per person per day. The real number is 2 gallons. Calculate exactly how much water your family needs — with container recommendations for houses and apartments.",
    focusKw:      "how much water to store for emergency",
    categories:   [CAT.water, CAT.waterPreparedness, CAT.toolsCalculators],
    tags:         [TAG.emergencyPreparedness, TAG.fema, TAG.disasterPrep, TAG.disasterPreparedness, TAG.prepperCalculator, TAG.freePrepperTools, TAG.survivalTools, TAG.survivalPlanning, TAG.shtf, TAG.prepping4Beginners],
    status:       "future",
    date:         "2026-04-03T09:00:00",
    // Create new water-specific tags below
    newTags:      ["water storage", "emergency water", "water supply", "water containers"],
  },
  {
    id:           1351,
    slug:         "food-storage-calculator",
    title:        "Food Storage Calculator: How Much Food Do You Actually Need?",
    seoTitle:     "Food Storage Calculator: Exact Amounts by Household Size and Duration (2026)",
    seoDesc:      "How much food do you actually need for 30, 90, or 365 days? Free calculator gives calories, weight, and a shopping-ready breakdown — including a 3-month plan for a family of 4 under $800.",
    focusKw:      "food storage calculator",
    categories:   [CAT.foodStorage, CAT.toolsCalculators, CAT.gettingStarted],
    tags:         [TAG.foodStorage, TAG.foodStorageCalc, TAG.emergencyFood, TAG.prepperFood, TAG.prepperCalculator, TAG.freePrepperTools, TAG.longTermStorage, TAG.nonPerishableFood, TAG.freezeDriedFood, TAG.survivalPlanning],
    status:       "future",
    date:         "2026-04-04T09:00:00",
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

async function createTag(name) {
  const slug = name.toLowerCase().replace(/\s+/g, "-");
  // Check if it already exists first
  const checkRes = await fetch(`${WP_API}/tags?slug=${slug}&_fields=id,slug`, {
    headers: { Authorization: AUTH },
  });
  const existing = await checkRes.json();
  if (existing.length) {
    console.log(`    tag "${name}" already exists (ID ${existing[0].id})`);
    return existing[0].id;
  }
  const res = await fetch(`${WP_API}/tags`, {
    method: "POST",
    headers: { Authorization: AUTH, "Content-Type": "application/json" },
    body: JSON.stringify({ name, slug }),
  });
  if (!res.ok) throw new Error(`Tag create failed: ${res.status} ${await res.text()}`);
  const tag = await res.json();
  console.log(`    + created tag "${name}" (ID ${tag.id})`);
  return tag.id;
}

async function updatePost(article, extraTagIds = []) {
  const allTags = [...article.tags, ...extraTagIds];

  const payload = {
    title:      article.title,
    categories: article.categories,
    tags:       allTags,
    status:     article.status,
    meta: {
      rank_math_title:         article.seoTitle,
      rank_math_description:   article.seoDesc,
      rank_math_focus_keyword: article.focusKw,
    },
  };

  if (article.date) {
    payload.date = article.date; // site-local timezone (EDT)
  }

  const res = await fetch(`${WP_API}/posts/${article.id}`, {
    method: "POST",
    headers: { Authorization: AUTH, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Update failed for post ${article.id}: ${err}`);
  }

  return res.json();
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function run() {
  console.log("Optimizing + scheduling 5 tool articles...\n");

  for (const article of ARTICLES) {
    console.log(`[${article.slug}]`);

    // Create any new tags needed
    const extraTagIds = [];
    if (article.newTags?.length) {
      console.log(`  Creating ${article.newTags.length} new tags...`);
      for (const tagName of article.newTags) {
        const id = await createTag(tagName);
        extraTagIds.push(id);
      }
    }

    // Update the post
    const updated = await updatePost(article, extraTagIds);

    const scheduleLabel = article.status === "publish"
      ? "PUBLISHED NOW"
      : `scheduled → ${article.date}`;

    console.log(`  ✓ ${scheduleLabel}`);
    console.log(`    title:    ${updated.title?.rendered}`);
    console.log(`    status:   ${updated.status}`);
    console.log(`    cats:     ${article.categories.join(", ")}`);
    console.log(`    tags:     ${allTagCount(article, extraTagIds)} tags`);
    console.log(`    url:      ${updated.link}`);
    console.log();
  }

  console.log("All done. Publishing schedule:");
  console.log("  Mar 31 — LIVE NOW  → how-many-solar-panels-do-i-need");
  console.log("  Apr  1 — 9am EDT   → bug-out-bag-list");
  console.log("  Apr  2 — 9am EDT   → 72-hour-survival-kit");
  console.log("  Apr  3 — 9am EDT   → how-much-water-to-store-for-emergency");
  console.log("  Apr  4 — 9am EDT   → food-storage-calculator");
}

function allTagCount(article, extra) {
  return (article.tags?.length || 0) + extra.length;
}

run().catch(console.error);
