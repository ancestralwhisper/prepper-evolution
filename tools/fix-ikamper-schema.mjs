/**
 * fix-ikamper-schema.mjs
 * Fixes the iKamper Review schema (Post 178):
 *   Google requires Product itemReviewed to have offers, review, or aggregateRating.
 *   Adds aggregateRating + offers to satisfy the requirement.
 *
 * Run: node tools/fix-ikamper-schema.mjs
 */

const WP_API = "https://wp.prepperevolution.com/wp-json/wp/v2";
const AUTH = Buffer.from("pe_admin:S4U4 3447 gTtb uGvE Ga8f h4hi").toString("base64");
const headers = {
  Authorization: `Basic ${AUTH}`,
  "Content-Type": "application/json",
};

const FIXED_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Review",
  "itemReviewed": {
    "@type": "Product",
    "name": "iKamper Skycamp 3.0",
    "brand": { "@type": "Brand", "name": "iKamper" },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.6",
      "reviewCount": "1",
      "bestRating": "5",
      "worstRating": "1"
    },
    "offers": {
      "@type": "Offer",
      "price": "4899.00",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "url": "https://www.amazon.com/dp/B0CB6RX4RT?tag=prepperevo-20"
    }
  },
  "reviewRating": {
    "@type": "Rating",
    "ratingValue": "4.6",
    "bestRating": "5",
    "worstRating": "1"
  },
  "name": "iKamper Skycamp 3.0 Review: Is It Worth $4,899?",
  "reviewBody": "After owning a Skycamp on a Jeep Rubicon and comparing it against every RTT on the market, the Skycamp 3.0 earns its price tag for serious overlanders. The 60-second setup is real, the king-size mattress is legitimately comfortable, and the hardshell holds up in four-season conditions. The weight and cost are real tradeoffs — not for everyone, but the best hardshell RTT on the market.",
  "author": {
    "@type": "Person",
    "name": "Mike",
    "url": "https://prepperevolution.com/about"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Prepper Evolution",
    "url": "https://prepperevolution.com"
  }
};

const OLD_TYPE = '"@type": "Review"';
const SCRIPT_START = '<script type="application/ld+json">';
const SCRIPT_END = '<\\/script>';

async function run() {
  console.log("Fetching Post 178 (iKamper review)...");
  const res = await fetch(`${WP_API}/posts/178?_fields=id,content`, { headers });
  if (!res.ok) throw new Error(`GET failed: ${res.status}`);
  const post = await res.json();

  const raw = post.content.raw ?? post.content.rendered;

  // Find and replace the existing Review schema block
  const scriptRegex = /<script type="application\/ld\+json">[\s\S]*?"@type": "Review"[\s\S]*?<\/script>/;
  if (!scriptRegex.test(raw)) {
    console.log("⚠  No Review schema found in post content — nothing to patch.");
    process.exit(0);
  }

  const newBlock = `<script type="application/ld+json">\n${JSON.stringify(FIXED_SCHEMA, null, 2)}\n</script>`;
  const updated = raw.replace(scriptRegex, newBlock);

  console.log("Updating post...");
  const upRes = await fetch(`${WP_API}/posts/178`, {
    method: "POST",
    headers,
    body: JSON.stringify({ content: updated }),
  });
  if (!upRes.ok) {
    const text = await upRes.text();
    throw new Error(`UPDATE failed: ${upRes.status} — ${text}`);
  }

  console.log("✓ iKamper Review schema fixed — aggregateRating + offers added to Product.");
}

run().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
