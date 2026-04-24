/**
 * check-db-products.mjs
 * Prints all products from the Replit PostgreSQL DB with their current amazon_link.
 * Run on Replit: node tools/check-db-products.mjs
 * Purpose: diagnose slug mismatches causing fix-asin-links.mjs to miss products.
 */

import pg from "pg";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const res = await client.query(
  `SELECT slug, name, amazon_link FROM products ORDER BY slug`
);

console.log(`\n${"SLUG".padEnd(45)} ${"ASIN".padEnd(14)} NAME`);
console.log("─".repeat(100));

const OLD_ASINS = new Set([
  "B0DQ5C5BGF", // EcoFlow DELTA 3 Ultra old
  "B09P2JD3SR", // Bluetti AC200MAX old
  "B0CKV16CKZ", // Roofnest Falcon 2 old
  "B09JQPBJNF", // BioLite CampStove 2+ old
  "B001DZZJ6C", // ESEE 4 old
  "B0CFVBGWBT", // Jackery 1000 Plus old
]);

let flagged = 0;
for (const row of res.rows) {
  const asin = row.amazon_link?.match(/\/dp\/([A-Z0-9]{10})/)?.[1] ?? "none";
  const stale = OLD_ASINS.has(asin) ? " ⚠️  STALE" : "";
  if (stale) flagged++;
  if (stale || process.argv.includes("--all")) {
    console.log(`${row.slug.padEnd(45)} ${asin.padEnd(14)} ${row.name}${stale}`);
  }
}

if (!process.argv.includes("--all")) {
  console.log(`\n${flagged} stale product(s) found. Run with --all to see all products.`);
}

await client.end();
