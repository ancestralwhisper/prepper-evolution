/**
 * add-schema-markup.mjs
 * Adds Review and FAQPage schema to three high-traffic articles:
 *   - Post 178: iKamper Skycamp 3.0 review → Review schema (star ratings in SERP)
 *   - Post 200: Best Camp Stoves roundup → FAQPage schema
 *   - Post 1348: Bug Out Bag List → FAQ section (visible) + FAQPage schema
 *
 * Run locally:
 *   node tools/add-schema-markup.mjs
 */

const WP_API = "https://wp.prepperevolution.com/wp-json/wp/v2";
const AUTH = Buffer.from("pe_admin:S4U4 3447 gTtb uGvE Ga8f h4hi").toString("base64");

const headers = {
  Authorization: `Basic ${AUTH}`,
  "Content-Type": "application/json",
};

// ── Schema blocks ─────────────────────────────────────────────────────────────

const IKAMPER_REVIEW_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Review",
  "itemReviewed": {
    "@type": "Product",
    "name": "iKamper Skycamp 3.0",
    "brand": { "@type": "Brand", "name": "iKamper" }
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

const CAMP_STOVES_FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the best camp stove for emergency preparedness?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The Camp Chef Explorer 2X is the best camp stove for emergency preparedness. Dual 30,000 BTU burners handle any cooking load, propane stores indefinitely, and it connects to a standard 20lb tank for extended grid-down use. Under $200 and built to last."
      }
    },
    {
      "@type": "Question",
      "name": "What is the best camp stove for family camping?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The Camp Chef Explorer 2X wins for families. Two 30,000 BTU burners let you cook a main and a side simultaneously. Standard 1lb propane canisters or a 20lb tank both connect directly. At $200, it's the most capable family camp stove without going commercial."
      }
    },
    {
      "@type": "Question",
      "name": "Is the Solo Stove Ranger 2.0 good for cooking?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The Solo Stove Ranger 2.0 is primarily a fire pit, not a camp stove. It burns wood efficiently with minimal smoke and works for grilling or simple cooking over the grate, but it can't replace a dedicated burner stove for controlled cooking. Think of it as a fire feature, not a kitchen."
      }
    },
    {
      "@type": "Question",
      "name": "What is the lightest camp stove for backpacking?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The Jetboil Flash at 13.1 oz is the lightest option for backpackers who primarily boil water — it boils 16 oz in 100 seconds. For cooking real meals on the trail, the BioLite CampStove 2+ at 2.06 lbs adds wood-burning capability and USB charging without carrying fuel."
      }
    },
    {
      "@type": "Question",
      "name": "Can the BioLite CampStove really charge your phone?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. The BioLite CampStove 2+ generates electricity from heat via a thermoelectric generator, outputting 3W USB. In practice it trickle-charges phones while you cook — roughly 1% per minute at peak output. It works best as a backup charge source on longer trips where you're burning wood anyway."
      }
    },
    {
      "@type": "Question",
      "name": "How much propane does a camp stove use?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A standard 1lb propane canister lasts roughly 1–2 hours on a high-BTU burner like the Camp Chef Explorer 2X. For extended trips, connect a 20lb tank (about $20 to refill) to run the stove for 15–20 hours of cooking. Plan on approximately one 1lb canister per day for moderate cooking use."
      }
    },
    {
      "@type": "Question",
      "name": "What camp stove works best in wind?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Enclosed windscreen designs like the Jetboil Flash handle wind best, cutting boil time by up to 50% versus open burners. For larger stoves, position your back to the wind and use a windscreen panel. The BioLite CampStove 2+ handles moderate wind well since its internal fan actively feeds the fire."
      }
    }
  ]
};

const BOB_FAQ_HTML = `
<h2>Frequently Asked Questions</h2>

<h3>What is a bug out bag?</h3>
<p>A bug out bag (BOB) is a portable emergency kit designed to sustain you for 72 hours while evacuating a disaster zone. Most preppers build around a 25–35lb pack covering water, food, shelter, fire, first aid, and basic communication — the minimum to survive independently for three days without outside help.</p>

<h3>How heavy should a bug out bag be?</h3>
<p>Your loaded bug out bag should weigh no more than 20–25% of your body weight. For a 180-pound person, that's 36–45 lbs maximum. For a 130-pound person, 26–32 lbs. Most people overpack. If you can't maintain a walking pace for an hour with it on, it's too heavy — cut until you hit your weight budget.</p>

<h3>What's the difference between a bug out bag and a get-home bag?</h3>
<p>A bug out bag is built for evacuating from home for 72 hours or more. A get-home bag stays in your car and is built to get you from wherever you are back to your house — typically a lighter 24-hour kit optimized for the distance between work and home. Both serve different scenarios and serious preppers carry both.</p>

<h3>How often should I rotate my bug out bag?</h3>
<p>Audit your bug out bag every 6 months. Check food and water expiration dates, rotate batteries, update medications, and confirm everything still fits and functions. Spring and fall are natural reminders — do it when you change smoke detector batteries. Replace anything expired, damaged, or that no longer fits your situation.</p>

<h3>How many days of supplies should a bug out bag have?</h3>
<p>A standard bug out bag is built for 72 hours (3 days). FEMA recommends a minimum 72-hour supply for emergency kits. For most evacuation scenarios — natural disasters, regional emergencies — 72 hours gets you to a shelter, a family member's home, or out of the affected area. Extended kits (7–14 days) exist but dramatically increase weight.</p>
`;

const BOB_FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is a bug out bag?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A bug out bag (BOB) is a portable emergency kit designed to sustain you for 72 hours while evacuating a disaster zone. Most preppers build around a 25–35lb pack covering water, food, shelter, fire, first aid, and basic communication — the minimum to survive independently for three days without outside help."
      }
    },
    {
      "@type": "Question",
      "name": "How heavy should a bug out bag be?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Your loaded bug out bag should weigh no more than 20–25% of your body weight. For a 180-pound person, that's 36–45 lbs maximum. For a 130-pound person, 26–32 lbs. Most people overpack. If you can't maintain a walking pace for an hour with it on, it's too heavy — cut until you hit your weight budget."
      }
    },
    {
      "@type": "Question",
      "name": "What's the difference between a bug out bag and a get-home bag?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A bug out bag is built for evacuating from home for 72 hours or more. A get-home bag stays in your car and is built to get you from wherever you are back to your house — typically a lighter 24-hour kit optimized for the distance between work and home. Both serve different scenarios and serious preppers carry both."
      }
    },
    {
      "@type": "Question",
      "name": "How often should I rotate my bug out bag?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Audit your bug out bag every 6 months. Check food and water expiration dates, rotate batteries, update medications, and confirm everything still fits and functions. Spring and fall are natural reminders — do it when you change smoke detector batteries. Replace anything expired, damaged, or that no longer fits your situation."
      }
    },
    {
      "@type": "Question",
      "name": "How many days of supplies should a bug out bag have?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A standard bug out bag is built for 72 hours (3 days). FEMA recommends a minimum 72-hour supply for emergency kits. For most evacuation scenarios — natural disasters, regional emergencies — 72 hours gets you to a shelter, a family member's home, or out of the affected area. Extended kits (7–14 days) exist but dramatically increase weight."
      }
    }
  ]
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function schemaBlock(obj) {
  return `\n<script type="application/ld+json">\n${JSON.stringify(obj, null, 2)}\n<\/script>`;
}

async function getPost(id) {
  const res = await fetch(`${WP_API}/posts/${id}?_fields=id,slug,title,content`, { headers });
  if (!res.ok) throw new Error(`GET post ${id} failed: ${res.status}`);
  return res.json();
}

async function updatePost(id, content) {
  const res = await fetch(`${WP_API}/posts/${id}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`UPDATE post ${id} failed: ${res.status} — ${text}`);
  }
  return res.json();
}

function alreadyHasSchema(content, type) {
  return content.includes(`"@type": "${type}"`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function run() {
  const tasks = [
    {
      id: 178,
      label: "iKamper Skycamp 3.0 Review",
      schemaType: "Review",
      append: schemaBlock(IKAMPER_REVIEW_SCHEMA),
    },
    {
      id: 200,
      label: "Best Camp Stoves",
      schemaType: "FAQPage",
      append: schemaBlock(CAMP_STOVES_FAQ_SCHEMA),
    },
    {
      id: 1348,
      label: "Bug Out Bag List",
      schemaType: "FAQPage",
      // For BOB we also inject visible FAQ HTML before the schema block
      append: BOB_FAQ_HTML + schemaBlock(BOB_FAQ_SCHEMA),
    },
  ];

  for (const task of tasks) {
    process.stdout.write(`\nProcessing: ${task.label} (Post ${task.id})...`);
    const post = await getPost(task.id);
    const existing = post.content.rendered;

    if (alreadyHasSchema(existing, task.schemaType)) {
      console.log(` ⚠  ${task.schemaType} schema already present — skipped`);
      continue;
    }

    // Append to raw content (not rendered)
    const rawContent = post.content.raw ?? post.content.rendered;
    const updated = rawContent + task.append;

    await updatePost(task.id, updated);
    console.log(` ✓ ${task.schemaType} schema added`);
  }

  console.log("\nDone.");
}

run().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
