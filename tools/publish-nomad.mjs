/**
 * publish-nomad.mjs
 * - Fixes Mike's voice issues in the N.O.M.A.D. article (Post 1295)
 * - Uploads new featured image (project_nomad.png)
 * - Sets categories, tags, RankMath meta
 * - Schedules for April 5, 2026 at 9am EDT
 *
 * Run: node tools/publish-nomad.mjs
 */

import fs from "fs";

const WP_API  = "https://wp.prepperevolution.com/wp-json/wp/v2";
const AUTH    = "Basic " + Buffer.from("pe_admin:S4U4 3447 gTtb uGvE Ga8f h4hi").toString("base64");
const POST_ID = 1295;

// ─── Voice fixes ────────────────────────────────────────────────────────────
// Targeted replacements only — respect the user's edits, fix what's still off.

const FIXES = [
  // Grammar: Your not → You're not
  [
    `Your not going to be able to without the internet.`,
    `You're not going to be able to without internet.`,
  ],
  // Awkward "What say you" phrasing
  [
    `What say you, a busted radiator hose in the backcountry?`,
    `Say you've got a busted radiator hose in the backcountry.`,
  ],
  // AI-ish group trips bullet ending
  [
    `<strong>Group trips</strong> where multiple people need access to maps and references at the same time and cross referencing can take place if need be.`,
    `<strong>Group trips</strong> where multiple people need offline maps and references at the same time — everyone working from the same information without burning through someone's hotspot.`,
  ],
  // "A few caveats to consider" → more direct
  [
    `<p>A few caveats to consider:</p>`,
    `<p>A few things to know going in:</p>`,
  ],
  // "Check Your Digital Readiness First" section — too corporate, rewrite the whole section
  [
    `<h2>Check Your Digital Readiness First</h2>
<p>Before you build this, it's worth knowing where your gaps actually are. Are offline tools your biggest prep hole right now, or is it something else?</p>
<p>The <a href="https://prepperevolution.com/tools">Skills &amp; Knowledge Gap Analyzer</a> on the tools page will give you a real picture of your digital resilience score alongside your other readiness areas. If digital resilience is showing red, N.O.M.A.D. is a solid fix. If you've got bigger holes elsewhere, start there first.</p>
<p>And if you're still working out your offline map strategy before a big run, the <a href="https://prepperevolution.com/tools">Ops Deck</a> has tools built for exactly that kind of route and gear planning.</p>
<p>Build this thing. Run it once at home before your trip so you know it works. Then forget about it until you actually need it.</p>`,
    `<h2>Before You Build It</h2>
<p>If you're not sure whether offline digital tools are actually your biggest gap right now, the <a href="https://prepperevolution.com/tools/skills-tracker">Skills &amp; Knowledge Gap Analyzer</a> will give you an honest score on digital resilience alongside everything else. Worth running before you spend $200 on something you might not need yet.</p>
<p>And if route planning is the piece you're working on, the <a href="https://prepperevolution.com/tools/fuel-range-planner">Fuel &amp; Range Planner</a> in the Ops Deck does terrain-adjusted burn math for your actual rig. Pairs well with offline maps once you've got N.O.M.A.D. set up.</p>
<p>Build it. Run it at home first so you know it works before you're standing in the middle of nowhere expecting it to. Then just leave it plugged in and forget about it until you need it.</p>`,
  ],
];

// ─── Upload new featured image ───────────────────────────────────────────────

async function uploadFeaturedImage() {
  const filePath = "C:/Users/Yeti Command/Downloads/project_nomad.png";
  const buffer   = fs.readFileSync(filePath);

  console.log("Uploading new featured image...");
  const res = await fetch(`${WP_API}/media`, {
    method: "POST",
    headers: {
      Authorization:         AUTH,
      "Content-Disposition": `attachment; filename="project-nomad-raspberry-pi-offline-server.jpg"`,
      "Content-Type":        "image/png",
    },
    body: buffer,
  });

  if (!res.ok) throw new Error(`Image upload failed: ${res.status} ${await res.text()}`);
  const media = await res.json();

  // Set alt text
  await fetch(`${WP_API}/media/${media.id}`, {
    method: "POST",
    headers: { Authorization: AUTH, "Content-Type": "application/json" },
    body: JSON.stringify({
      alt_text: "Project N.O.M.A.D. Raspberry Pi 5 offline server mounted on a vehicle dashboard",
      caption:  "A Raspberry Pi 5 in a ruggedized case running Project N.O.M.A.D. on a vehicle dash — offline AI, maps, and Wikipedia with no cell signal needed.",
    }),
  });

  console.log(`  ✓ media ID ${media.id}`);
  return media.id;
}

// ─── Fetch and patch content ─────────────────────────────────────────────────

async function getContent() {
  const res = await fetch(`${WP_API}/posts/${POST_ID}?_fields=content`, {
    headers: { Authorization: AUTH },
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const post = await res.json();
  return post.content.raw ?? post.content.rendered;
}

function applyFixes(content) {
  let out = content;
  for (const [from, to] of FIXES) {
    if (!out.includes(from)) {
      console.warn(`  ⚠  Fix not applied (string not found): "${from.slice(0, 60)}..."`);
      continue;
    }
    out = out.replace(from, to);
    console.log(`  ✓ fixed: "${from.slice(0, 55)}..."`);
  }
  return out;
}

// ─── Push update ────────────────────────────────────────────────────────────

async function updatePost(content, mediaId) {
  const payload = {
    content,
    featured_media: mediaId,
    status:         "future",
    date:           "2026-04-05T09:00:00",
    categories: [
      31,   // electronics
      4,    // overlanding
      12,   // communication
      248,  // tools-calculators
    ],
    tags: [
      222,  // raspberry-pi
      224,  // digital-resilience
      221,  // offline-prep
      44,   // emergency-communication
      177,  // overlanding
      168,  // off-grid
      62,   // survival-skills
      39,   // overlanding-gear
      167,  // solar-power (runs off power station)
      171,  // emergency-power
    ],
    meta: {
      rank_math_title:         "Project N.O.M.A.D.: Build a $70 Offline Brain for Your Rig (Raspberry Pi 5 Guide)",
      rank_math_description:   "Turn a Raspberry Pi 5 into an offline server for your rig — AI assistant, Wikipedia, maps, and medical references accessible from any phone with zero cell signal. Real setup guide with parts list.",
      rank_math_focus_keyword: "project nomad offline survival server",
    },
  };

  const res = await fetch(`${WP_API}/posts/${POST_ID}`, {
    method: "POST",
    headers: { Authorization: AUTH, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`Post update failed: ${res.status} ${await res.text()}`);
  return res.json();
}

// ─── Run ─────────────────────────────────────────────────────────────────────

async function run() {
  console.log("N.O.M.A.D. article — fixing voice + publishing...\n");

  // 1. Upload image
  const mediaId = await uploadFeaturedImage();

  // 2. Fetch and patch content
  console.log("\nApplying voice fixes...");
  const raw = await getContent();
  const fixed = applyFixes(raw);

  // 3. Push everything
  console.log("\nUpdating post...");
  const updated = await updatePost(fixed, mediaId);

  console.log(`\n✓ Done`);
  console.log(`  Status:    ${updated.status}`);
  console.log(`  Scheduled: 2026-04-05T09:00:00 EDT`);
  console.log(`  URL:       ${updated.link}`);
  console.log(`  Media:     ${mediaId}`);
}

run().catch(console.error);
