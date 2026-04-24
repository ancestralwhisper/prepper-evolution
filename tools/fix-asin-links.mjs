// fix-asin-links.mjs
// Run in Replit shell: node tools/fix-asin-links.mjs
// Updates dead Amazon ASINs in the live DB without touching anything else
// Updated 2026-04-22: Jackery 1000 Plus → B0C37CWBKZ, Bluetti → B09M8J9LY7

import pg from "pg";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

const fixes = [
  { slug: "ecoflow-delta-3-ultra",       url: "https://www.amazon.com/dp/B0FT32MCM9?tag=prepperevo-20" },
  { slug: "jackery-explorer-1000-plus",  url: "https://www.amazon.com/dp/B0C37CWBKZ?tag=prepperevo-20" },
  { slug: "bluetti-ac200max",            url: "https://www.amazon.com/dp/B09M8J9LY7?tag=prepperevo-20" },
  { slug: "biolite-campstove-2",         url: "https://www.amazon.com/dp/B0C31B18Y2?tag=prepperevo-20" },
  { slug: "esee-4",                      url: "https://www.amazon.com/dp/B07F3FKP3C?tag=prepperevo-20" },
  { slug: "roofnest-falcon-2",           url: "https://www.amazon.com/dp/B0CJCWY2DN?tag=prepperevo-20" },
];

await client.connect();

for (const fix of fixes) {
  const res = await client.query(
    `UPDATE products SET amazon_link = $1 WHERE slug = $2 RETURNING name`,
    [fix.url, fix.slug]
  );
  if (res.rowCount > 0) {
    console.log(`✓ ${res.rows[0].name}`);
  } else {
    console.log(`✗ Not found: ${fix.slug}`);
  }
}

await client.end();
console.log("Done.");
