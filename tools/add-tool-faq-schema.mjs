/**
 * add-tool-faq-schema.mjs
 * Adds FAQPage schema to 4 tool articles (posts 1347, 1349, 1350, 1351).
 * Post 1348 (Bug Out Bag List) was already handled in add-schema-markup.mjs.
 *
 * Run: node tools/add-tool-faq-schema.mjs
 */

const WP_API = "https://wp.prepperevolution.com/wp-json/wp/v2";
const AUTH = Buffer.from("pe_admin:S4U4 3447 gTtb uGvE Ga8f h4hi").toString("base64");
const headers = {
  Authorization: `Basic ${AUTH}`,
  "Content-Type": "application/json",
};

function schemaBlock(obj) {
  return `\n<script type="application/ld+json">\n${JSON.stringify(obj, null, 2)}\n<\/script>`;
}

// ── Schema data ───────────────────────────────────────────────────────────────

const SCHEMAS = [
  {
    id: 1347,
    label: "How Many Solar Panels Do I Need",
    schema: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How many solar panels do I need to charge a battery bank?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "For a 1,000Wh battery bank, plan on 200-400W of solar panels to recharge in 4-6 hours of peak sun. A single 200W panel in a good sun location (5+ peak hours) can deliver around 1,000Wh per day. Add more panels if you're in a low-sun region or recharging faster than one day."
          }
        },
        {
          "@type": "Question",
          "name": "What size solar panel do I need for an RV?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Most RV setups need 400-800W of solar to run basic loads: lighting, phone charging, a fan, and a 12V fridge. If you're running a full-size compressor fridge and AC, budget 1,200W or more. Start by calculating your daily watt-hour usage, then size panels to cover it in your region's average peak sun hours."
          }
        },
        {
          "@type": "Question",
          "name": "Can I run a refrigerator on solar panels?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes — a 12V compressor fridge (like a Dometic or ARB) uses 30-60Wh per hour and runs 24/7. That's roughly 400-800Wh per day. A 200W solar panel in a good location produces about 800-1,000Wh daily, which covers a single fridge. Add a power station as a battery buffer and you're set even overnight."
          }
        },
        {
          "@type": "Question",
          "name": "How many solar panels does it take to power a house?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The average US home uses about 29 kWh per day (EIA, 2023). At 4-5 peak sun hours per day, you'd need roughly 20-25 standard 400W panels to cover full household usage. For emergency backup power covering essential loads only — fridge, lights, phone, medical devices — 2-4 panels paired with a large power station is realistic."
          }
        }
      ]
    }
  },
  {
    id: 1349,
    label: "72-Hour Survival Kit",
    schema: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What does FEMA recommend in a 72-hour kit?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "FEMA recommends a minimum 72-hour emergency supply kit per person including: 1 gallon of water per person per day, non-perishable food, a battery or hand-crank radio, flashlight with extra batteries, first aid kit, whistle, dust masks, plastic sheeting and duct tape, moist towelettes, garbage bags, wrench or pliers, manual can opener, local maps, and a cell phone with chargers. Source: ready.gov."
          }
        },
        {
          "@type": "Question",
          "name": "Is 72 hours enough for most disasters?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "For most localized emergencies — power outages, winter storms, moderate flooding — 72 hours covers the window until outside help arrives. For larger regional disasters like major hurricanes or earthquakes, real-world recovery times often stretch to 7-14 days or longer. FEMA's 72-hour standard is a minimum baseline, not a ceiling. Serious preppers build toward 30 days."
          }
        },
        {
          "@type": "Question",
          "name": "Can one 72-hour kit work for a family of 4?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No — a 72-hour kit is per person. A family of 4 needs 4x the water (12 gallons minimum), 4x the food, and enough medication and supplies for all members. The easiest approach is one main family kit in a large pack or bin plus individual go-bags for each adult that they can grab and carry independently if you get separated."
          }
        },
        {
          "@type": "Question",
          "name": "How heavy should a 72-hour survival kit be?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A portable 72-hour kit (bug out bag) should weigh no more than 20-25% of the carrier's body weight. For a 150-pound person, that's 30-37 lbs maximum. A stationary home kit stored in a bin or tub has no weight limit — prioritize completeness over portability. Only the grab-and-go bag needs to stay light."
          }
        }
      ]
    }
  },
  {
    id: 1350,
    label: "How Much Water to Store",
    schema: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How much water should I store for an emergency?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "FEMA recommends 1 gallon per person per day as a minimum. In practice, 2 gallons per person per day is more realistic once you account for cooking, basic hygiene, and pets. For a family of 4 building a 2-week supply, that's 112 gallons. Start with 2 weeks, build toward 30 days."
          }
        },
        {
          "@type": "Question",
          "name": "How long does stored water last?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Commercially sealed water has a shelf life of 2 years, but it's safe to drink beyond that if stored properly. Tap water stored in clean, sealed containers stays safe for 6-12 months in a cool, dark location. Rotate your supply every 6-12 months and treat with water purification tablets if you're unsure about quality after long storage."
          }
        },
        {
          "@type": "Question",
          "name": "Can I store water in plastic soda bottles?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes — rinsed 2-liter soda bottles are one of the best DIY water storage options. They're made from food-grade PETE plastic, seal well, and stack easily. Avoid milk jugs — the protein residue is nearly impossible to fully clean and promotes bacterial growth. Fill with tap water, seal tightly, label with date, and store away from light and heat."
          }
        },
        {
          "@type": "Question",
          "name": "How much water do I need for a 2-week emergency?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Using the realistic 2 gallons per person per day standard: one person needs 28 gallons for 2 weeks. A family of 4 needs 112 gallons. Large 55-gallon barrels cover a family of 4 for about 7 days each. For a full 2-week supply for 4 people, two 55-gallon barrels plus a water filtration system like a Berkey covers both stored supply and filtration backup."
          }
        }
      ]
    }
  },
  {
    id: 1351,
    label: "Food Storage Calculator",
    schema: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How many calories per day for emergency food storage?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Plan for 2,000-2,500 calories per adult per day for sedentary emergency conditions. If you're evacuating or doing physical labor during the emergency, increase to 2,500-3,000 calories. Children need 1,200-1,800 calories depending on age. Many emergency food calculators use 1,800 as a baseline — that's a survivable minimum, not a comfortable one."
          }
        },
        {
          "@type": "Question",
          "name": "What's the best food to stockpile for emergencies?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The best emergency foods have long shelf life, high calorie density, and require minimal preparation. Top choices: white rice (25-30 year shelf life), canned beans and vegetables (3-5 years), freeze-dried meals (25 years), rolled oats, honey, salt, pasta, and peanut butter. Rotate canned goods every 2-3 years. Freeze-dried is the best value for long-term storage despite higher upfront cost."
          }
        },
        {
          "@type": "Question",
          "name": "How do I store food for 1 year?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A 1-year food supply for one adult requires roughly 2,000 lbs of food covering all calorie needs. Store in a cool (55-70°F), dark, dry location. Use mylar bags with oxygen absorbers inside food-grade buckets for bulk grains, rice, and legumes — this extends shelf life to 25-30 years. Supplement with a rotating canned goods supply and freeze-dried meals for variety."
          }
        },
        {
          "@type": "Question",
          "name": "What is the FEMA recommended food storage minimum?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "FEMA recommends a minimum 3-day food supply per person. The broader preparedness community standard — backed by USDA guidance — targets a 90-day supply as a serious preparedness baseline. A full 1-year supply is considered comprehensive long-term preparedness. Most people start with 2 weeks, build to 30 days, then expand from there."
          }
        }
      ]
    }
  }
];

// ── Main ──────────────────────────────────────────────────────────────────────

async function run() {
  for (const item of SCHEMAS) {
    process.stdout.write(`\nProcessing Post ${item.id}: ${item.label}...`);

    const res = await fetch(`${WP_API}/posts/${item.id}?_fields=id,content,status`, { headers });
    if (!res.ok) throw new Error(`GET post ${item.id} failed: ${res.status}`);
    const post = await res.json();

    const rendered = post.content.rendered;
    if (rendered.includes('"@type": "FAQPage"')) {
      console.log(` ⚠  FAQPage schema already present — skipped`);
      continue;
    }

    const raw = post.content.raw ?? rendered;
    const updated = raw + schemaBlock(item.schema);

    const upRes = await fetch(`${WP_API}/posts/${item.id}`, {
      method: "POST",
      headers,
      body: JSON.stringify({ content: updated }),
    });
    if (!upRes.ok) {
      const text = await upRes.text();
      throw new Error(`UPDATE post ${item.id} failed: ${upRes.status} — ${text}`);
    }

    console.log(` ✓ FAQPage schema added (status: ${post.status})`);
  }

  console.log("\nDone.");
}

run().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
