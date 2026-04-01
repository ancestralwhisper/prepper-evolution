/**
 * ctr-rewrites.mjs
 * Updates RankMath SEO titles + meta descriptions for top traffic articles
 * to improve click-through rates from Google search results.
 *
 * Run: node tools/ctr-rewrites.mjs
 */

const WP_API = "https://wp.prepperevolution.com/wp-json/wp/v2";
const AUTH = Buffer.from("pe_admin:S4U4 3447 gTtb uGvE Ga8f h4hi").toString("base64");
const headers = {
  Authorization: `Basic ${AUTH}`,
  "Content-Type": "application/json",
};

const UPDATES = [
  {
    id: 200,
    label: "Best Camp Stoves",
    // Current: "Best Camp Stoves & Cooking Gear Compared 2026"
    // Problem: Generic comparison framing, no signal of real testing
    rank_math_title: "5 Best Camp Stoves 2026: Tested at Base Camp & Grid-Down",
    rank_math_description: "After hands-on testing four camp stoves — from a 13oz backpacking system to a 60,000 BTU dual-burner — here's what actually works for families, overlanding, and emergency cooking. One clear winner.",
    // Also update excerpt as fallback description
    excerpt: "After hands-on testing four camp stoves — from a 13oz backpacking system to a 60,000 BTU dual-burner — here's what actually works for families, overlanding, and emergency cooking. One clear winner.",
  },
  {
    id: 1348,
    label: "Bug Out Bag List",
    // Current: "Bug Out Bag List 2026: What to Pack (and What to Skip)"
    // Problem: Google AI Overview eating clicks — need to surface the specific angle AI can't provide
    rank_math_title: "Bug Out Bag List 2026: What to Pack (and What to Skip)",
    rank_math_description: "Most bug out bag lists will get you killed. This one is built around the 20-25% body weight rule military instructors swear by. Real weights, real priorities, and the heavy gear most lists include that you should leave home.",
    excerpt: "Most bug out bag lists will get you killed. This one is built around the 20-25% body weight rule military instructors swear by. Real weights, real priorities, and the heavy gear most lists include that you should leave home.",
  },
];

async function updatePost(item) {
  process.stdout.write(`\nUpdating Post ${item.id}: ${item.label}...`);

  // Try updating RankMath meta fields via REST API meta parameter
  const body = {
    excerpt: item.excerpt,
    meta: {
      rank_math_title: item.rank_math_title,
      rank_math_description: item.rank_math_description,
    },
  };

  const res = await fetch(`${WP_API}/posts/${item.id}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST ${item.id} failed: ${res.status} — ${text.slice(0, 200)}`);
  }

  const data = await res.json();

  // Check if RankMath meta was actually saved
  const savedTitle = data?.meta?.rank_math_title;
  if (savedTitle) {
    console.log(` ✓ RankMath title + description updated`);
  } else {
    // RankMath meta not exposed via REST — excerpt updated as fallback
    console.log(` ✓ Excerpt updated (RankMath meta requires direct WP access — see note below)`);
  }

  return data;
}

async function run() {
  console.log("Updating CTR meta for top traffic articles...\n");

  for (const item of UPDATES) {
    await updatePost(item);
  }

  console.log("\n---");
  console.log("Done.");
  console.log("\nNote: If RankMath meta was not saved via REST API, update manually:");
  console.log("  WP Admin → Posts → Edit → RankMath sidebar → SEO Title / Meta Description");
  console.log("  Camp Stoves (ID 200): Title & description above");
  console.log("  Bug Out Bag (ID 1348): Title & description above");
}

run().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
