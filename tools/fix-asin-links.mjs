// fix-asin-links.mjs
// Run in Replit shell: node tools/fix-asin-links.mjs
// Updates dead Amazon ASINs in the live DB without touching anything else
// Updated 2026-04-24: switched to ILIKE slug match + old-ASIN fallback to catch slug variations

import pg from "pg";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

// Each fix: try slug ILIKE match first, then fall back to matching the old ASIN directly.
// This handles slug variations (e.g. "biolite-campstove-2-plus" vs "biolite-campstove-2").
const fixes = [
  { slug: "ecoflow-delta-3-ultra",      oldAsin: "B0DQ5C5BGF", url: "https://www.amazon.com/dp/B0FT32MCM9?tag=prepperevo-20" },
  { slug: "jackery-explorer-1000-plus", oldAsin: "B0CFVBGWBT", url: "https://www.amazon.com/dp/B0C37CWBKZ?tag=prepperevo-20" },
  { slug: "bluetti-ac200max",           oldAsin: "B09P2JD3SR", url: "https://www.amazon.com/dp/B09M8J9LY7?tag=prepperevo-20" },
  { slug: "biolite-campstove-2",        oldAsin: "B09JQPBJNF", url: "https://www.amazon.com/dp/B0C31B18Y2?tag=prepperevo-20" },
  { slug: "esee-4",                     oldAsin: "B001DZZJ6C", url: "https://www.amazon.com/dp/B07F3FKP3C?tag=prepperevo-20" },
  { slug: "roofnest-falcon-2",          oldAsin: "B0CKV16CKZ", url: "https://www.amazon.com/dp/B0CJCWY2DN?tag=prepperevo-20" },
];

await client.connect();

for (const fix of fixes) {
  // Try slug match first
  let res = await client.query(
    `UPDATE products SET amazon_link = $1 WHERE slug ILIKE $2 RETURNING name, slug`,
    [fix.url, `%${fix.slug}%`]
  );

  // Fall back to old ASIN match if slug didn't hit
  if (res.rowCount === 0) {
    res = await client.query(
      `UPDATE products SET amazon_link = $1 WHERE amazon_link ILIKE $2 RETURNING name, slug`,
      [fix.url, `%${fix.oldAsin}%`]
    );
  }

  if (res.rowCount > 0) {
    res.rows.forEach(r => console.log(`✓ ${r.name} (slug: ${r.slug})`));
  } else {
    console.log(`✗ Not found by slug or old ASIN: ${fix.slug} / ${fix.oldAsin}`);
  }
}

await client.end();
console.log("Done.");
