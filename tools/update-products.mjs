/**
 * update-products.mjs
 * Patches existing product records in the Replit DB:
 *   - Replaces all Unsplash placeholder imageUrls with real product images
 *   - Fixes broken Amazon links (old ASINs 404'd)
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

  // ── Round 2: remaining 13 placeholder images ─────────────────────────────
  {
    slug: "lifestraw-personal-water-filter",
    imageUrl: "https://lifestraw.com/cdn/shop/products/LifeStrawonGreyw-Shadows-3_650x.jpg?v=1750227239",
  },
  {
    slug: "berkey-water-filter",
    imageUrl: "https://m.media-amazon.com/images/I/61u7kJNAdcL._AC_SL1500_.jpg",
  },
  {
    slug: "jackery-explorer-1000-plus",
    imageUrl: "https://m.media-amazon.com/images/I/61JVKysP1nL._AC_SL1500_.jpg",
  },
  {
    slug: "bluetti-ac200max",
    imageUrl: "https://m.media-amazon.com/images/I/71tjvpo4RrL._AC_SL1500_.jpg",
  },
  {
    slug: "baofeng-uv-5r",
    imageUrl: "https://m.media-amazon.com/images/I/61b8+ekfccL._AC_SL1500_.jpg",
  },
  {
    slug: "solo-stove-ranger-2",
    imageUrl: "https://m.media-amazon.com/images/I/61Q1SiBCO5L._AC_SL1500_.jpg",
  },
  {
    slug: "biolite-campstove-2",
    imageUrl: "https://m.media-amazon.com/images/I/71935nPZwsL._AC_SL1500_.jpg",
  },
  {
    slug: "arb-classic-series-ii-50qt",
    imageUrl: "https://cdn11.bigcommerce.com/s-wg9nennc1z/images/stencil/1035x1035/products/11999/13136692/arb-50-quart-classic-series-ii-fridge-freezer-10801472__35281.1752171001.jpg?c=1",
  },
  {
    slug: "511-tactical-rush72",
    imageUrl: "https://www.511tactical.com/media/catalog/product/5/6/56565_019_01_1.jpg?quality=100&bg-color=255,255,255&fit=bounds&height=855&width=855",
  },
  {
    slug: "mora-companion-hd",
    imageUrl: "https://www.morakniv.com/cdn/shop/files/Companion_Heavy_Duty_S_Black_Main_Product.webp?crop=center&height=2000&v=1756795211&width=2000",
  },
  {
    slug: "esee-4",
    imageUrl: "https://eseeknives.com/sites/default/files/styles/product_full/public/esee-4.jpg?itok=2JpLk0D1",
  },
  {
    slug: "benchmade-bugout-535",
    imageUrl: "https://cdn.shopify.com/s/files/1/0574/8041/3232/files/rpykt0cquscpbqynqblh.jpg?v=1771435479",
  },
  {
    slug: "goal-zero-yeti-1000-core",
    imageUrl: "https://m.media-amazon.com/images/I/711+wL8KJQL._AC_SL1500_.jpg",
  },

  // ── Broken Amazon link fixes ───────────────────────────────────────────────
  {
    slug: "bluetti-ac200max",
    amazonLink: "https://www.amazon.com/dp/B0GKRTX336?tag=prepperevo-20",
  },
  {
    slug: "ecoflow-delta-3-ultra",
    amazonLink: "https://www.amazon.com/dp/B0FT32MCM9?tag=prepperevo-20",
  },
  {
    slug: "roofnest-falcon-2",
    amazonLink: "https://www.amazon.com/dp/B0CJCWY2DN?tag=prepperevo-20",
  },
  {
    slug: "biolite-campstove-2",
    amazonLink: "https://www.amazon.com/dp/B0C31B18Y2?tag=prepperevo-20",
  },
  {
    slug: "esee-4",
    amazonLink: "https://www.amazon.com/dp/B07F3FKP3C?tag=prepperevo-20",
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
