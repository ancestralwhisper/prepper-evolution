/**
 * fix-dometic-asin.mjs
 * Patches the Dometic CFX3 55IM product record in the Replit DB:
 *   Old ASIN B085MM9B2D was for the CFX3 35 (wrong product)
 *   Correct ASIN B0F9LFBJHF is the CFX3 55IM with ice maker
 *
 * Run on Replit after git pull:
 *   node tools/fix-dometic-asin.mjs
 */

import pg from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL not set — run this on Replit, not locally.");
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const result = await pool.query(
    `UPDATE products
     SET amazon_link = $1
     WHERE slug = $2
     RETURNING slug, amazon_link`,
    [
      "https://www.amazon.com/dp/B0F9LFBJHF?tag=prepperevo-20",
      "dometic-cfx3-55im",
    ]
  );

  if (result.rowCount > 0) {
    console.log(`✓ dometic-cfx3-55im updated → B0F9LFBJHF`);
  } else {
    console.log(`⚠  dometic-cfx3-55im not found in DB`);
  }

  await pool.end();
}

run().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
