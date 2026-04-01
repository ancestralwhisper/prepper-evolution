/**
 * update-products.mjs
 * Patches existing product records in the Replit DB:
 *   - Replaces 10 Unsplash placeholder imageUrls with real product images
 *   - Fixes broken Bluetti AC200MAX Amazon link (old ASIN 404'd)
 *
 * Run on Replit after git pull:
 *   node tools/update-products.mjs
 */

import pg from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL not set — run this on Replit, not locally.");
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const UPDATES = [
  // ── Image fixes (Unsplash → real product images) ──────────────────────────
  {
    slug: "sawyer-squeeze-water-filter",
    imageUrl: "https://cdn.prod.website-files.com/61549f9352f3558157a226ea/6776e9804a8c2ee279d54f97_sawyer-squeeze-water-filteration.png",
  },
  {
    slug: "ikamper-skycamp-3-0",
    imageUrl: "https://ikamper.com/cdn/shop/files/Skycamp_3.0_FrontRight_1400x.jpg?v=1733271825",
  },
  {
    slug: "roofnest-falcon-2",
    imageUrl: "https://m.media-amazon.com/images/I/41vidLnwFAL._AC_SL1500_.jpg",
  },
  {
    slug: "arb-simpson-iii",
    imageUrl: "https://m.media-amazon.com/images/I/41lCBEpH2GL._AC_SL1500_.jpg",
  },
  {
    slug: "garmin-inreach-mini-2",
    imageUrl: "https://m.media-amazon.com/images/I/31pFvYsvGUL._AC_SL1500_.jpg",
  },
  {
    slug: "midland-gxt1000vp4",
    imageUrl: "https://midlandusa.com/cdn/shop/files/1.GXT1000VP4Front2.jpg?v=1726771934&width=2000",
  },
  {
    slug: "camp-chef-explorer-2x",
    imageUrl: "https://m.media-amazon.com/images/I/41Ntprn1juL._AC_SL1500_.jpg",
  },
  {
    slug: "dometic-cfx3-55im",
    imageUrl: "https://m.media-amazon.com/images/I/21Ob+OMr-NL._AC_SL1500_.jpg",
  },
  {
    slug: "molle-ii-rucksack",
    imageUrl: "https://m.media-amazon.com/images/I/51GGxHRoCCL._AC_SL1500_.jpg",
  },
  {
    slug: "renogy-200w-solar-panel",
    imageUrl: "https://m.media-amazon.com/images/I/41CvFaQf-fL._AC_SL1500_.jpg",
  },

  // ── Broken Amazon link fix ─────────────────────────────────────────────────
  {
    slug: "bluetti-ac200max",
    amazonLink: "https://www.amazon.com/dp/B09M8J9LY7?tag=prepperevo-20",
  },
];

async function run() {
  console.log("Updating product records...\n");
  let updated = 0;

  for (const patch of UPDATES) {
    const fields = [];
    const values = [];
    let i = 1;

    if (patch.imageUrl) {
      fields.push(`image_url = $${i++}`);
      values.push(patch.imageUrl);
    }
    if (patch.amazonLink) {
      fields.push(`amazon_link = $${i++}`);
      values.push(patch.amazonLink);
    }

    values.push(patch.slug);

    const sql = `UPDATE products SET ${fields.join(", ")} WHERE slug = $${i} RETURNING slug`;
    const result = await pool.query(sql, values);

    if (result.rowCount > 0) {
      console.log(`  ✓ ${patch.slug}`);
      updated++;
    } else {
      console.log(`  ⚠  not found: ${patch.slug}`);
    }
  }

  console.log(`\nDone. ${updated}/${UPDATES.length} records updated.`);
  await pool.end();
}

run().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
