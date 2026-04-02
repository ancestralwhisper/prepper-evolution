/**
 * push-starlink-article.mjs
 * Creates the Starlink Home Standard Review as a draft post in WordPress.
 * Run on Replit after git pull:
 *   node tools/push-starlink-article.mjs
 *
 * After running:
 *   1. Go to WP Admin -> Media -> Add New -> upload starlink_home_internet.jpg
 *   2. Set as featured image on this post
 *   3. Set categories: Communication, Preparedness, Overlanding > Power Systems
 *   4. Update RankMath SEO title + description via browser (see bottom of script)
 *   5. Publish when ready
 */

const WP_API = "https://wp.prepperevolution.com/wp-json/wp/v2";
const AUTH = Buffer.from("pe_admin:S4U4 3447 gTtb uGvE Ga8f h4hi").toString("base64");
const HEADERS = {
  Authorization: `Basic ${AUTH}`,
  "Content-Type": "application/json",
};

const content = `
<!-- wp:paragraph -->
<p>My Optimum connection had been getting worse for two years. Not catastrophically worse — just unreliable in the way that makes you hate it. Dropped connections during video calls, speed drops every night around 7 PM when the whole neighborhood got home, upload that never broke 25 Mbps no matter what the package said. I tolerated it because I didn't think I had a real alternative.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Third random outage in two months hit in February, and I was done. I ordered the Starlink Home Standard. Had the dish mounted by March 25th. Here's everything I found.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">The Install</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>No drama. I used an aftermarket mounting bracket — <a href="https://www.amazon.com/dp/B0GDNW6PS2?tag=prepperevo-20" target="_blank" rel="nofollow sponsored">this one on Amazon</a> — and the whole thing was up and aimed in about 30 minutes. The Starlink app has an obstruction tool that maps the sky view from wherever you're standing, so you can check your spot before you commit to drilling anything. Mine cleared on the first try.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>The app walks you through the rest. Plug it in, let it acquire satellites, and you're live. My entire house was running on Starlink before I'd finished cleaning up the packaging.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">Six Speed Tests Across Real Conditions</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>No controlled environment here. This is a real house with 47 devices on the network — TVs, phones, iPads, security cameras, smart lights, a refrigerator, a ring doorbell, mesh router nodes, and everything else a family of five accumulates over the years. I didn't disconnect anything for these tests.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><strong>Old Optimum baseline: 212 Mbps down / 21 Mbps up / 26ms</strong></p>
<!-- /wp:paragraph -->

<!-- wp:table {"className":"is-style-stripes"} -->
<figure class="wp-block-table is-style-stripes"><table><thead><tr><th>Test</th><th>Connection</th><th>Conditions</th><th>Download</th><th>Upload</th><th>Latency</th></tr></thead><tbody><tr><td>Wired via eero</td><td>Wired</td><td>Morning, sunny</td><td><strong>487 Mbps</strong></td><td><strong>39 Mbps</strong></td><td>—</td></tr><tr><td>iPhone WiFi</td><td>WiFi</td><td>Morning, cloudy/rain</td><td><strong>301 Mbps</strong></td><td><strong>29 Mbps</strong></td><td><strong>23ms</strong></td></tr><tr><td>Wired via eero</td><td>Wired</td><td>7:45 PM, 2 kids gaming</td><td><strong>499 Mbps</strong></td><td><strong>37 Mbps</strong></td><td>—</td></tr><tr><td>Laptop (Speedtest.net)</td><td>WiFi/LAN</td><td>Evening, Newark server</td><td><strong>163 Mbps</strong></td><td><strong>25 Mbps</strong></td><td><strong>29ms</strong></td></tr><tr><td>iPhone WiFi</td><td>WiFi</td><td>7:42 PM, evening</td><td><strong>56 Mbps</strong></td><td><strong>23 Mbps</strong></td><td><strong>30ms</strong></td></tr></tbody></table></figure>
<!-- /wp:table -->

<!-- wp:paragraph -->
<p>That 56 Mbps phone result and the 499 Mbps wired result happened within the same three-minute window. Same house, same Starlink connection, same 47 devices. The phone number is low because of WiFi overhead and distance from the router — it's not telling you what Starlink is doing, it's telling you what my phone's WiFi is doing at the far end of the house. The wired test tells you what the actual pipe is delivering.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">What 47 Devices and Two Kids Gaming Actually Looks Like</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Speed test reviews are almost always done on a clean network. Laptop plugged directly into a router, no other devices, controlled conditions. That's not how anyone actually lives.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>During the April 1st evening tests, I didn't touch the network. My youngest was playing Fortnite on the PS5 and my oldest was running Steam on his PC — both online, both active, both in the middle of games when I ran the tests. Plus everything else in the house ticking along in the background.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>The wired result during all of that: <strong>499 Mbps down, 37 Mbps up.</strong></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>My old Optimum best day, clean network: 212 Mbps. Starlink beat it by 2.3x with a full house and two kids mid-game.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">Rain Doesn't Kill It</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>One of my morning tests ran during overcast, lightly rainy conditions. Result was 301 Mbps / 29 Mbps / 23ms — which is still 42% faster than Optimum's best day on a clean network.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>I expected worse. Satellite internet has a reputation for weather sensitivity and that reputation isn't totally unfounded — the degradation from my sunny morning test (487 Mbps) to the rain morning test (301 Mbps) was about 38%, and that's a real number worth including. In a heavy thunderstorm you'll feel it. But cloudy skies and drizzle? You won't notice.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">The Latency Nobody Mentions</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Every single test came back with 23–30ms latency. That shouldn't be possible from a satellite.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Old-school satellite internet ran 600–700ms ping, which made it useless for anything real-time — video calls lagged out, gaming was unplayable, even normal browsing felt slow. Starlink's low-earth orbit constellation changed all of that. The satellites are close enough that the signal round-trip is in the same range as cable internet.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>My old Optimum ran 26ms. Starlink is matching it.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>For preparedness specifically, latency matters more than raw download speed. A 23ms ping means video calls work, VOIP works, remote monitoring works. If you're using Starlink as backup internet during an outage where your primary ISP is down, you're not sacrificing any real-world functionality.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">vs. T-Mobile Home Internet</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>My oldest — Caiden — has spent time at a buddy's place running T-Mobile Home Internet. His take was direct: "Starlink is way better." I'll count that as field research.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>T-Mobile Home Internet works off 5G cell towers. In good conditions it can do 150–300 Mbps, but it's subject to tower congestion during peak hours, coverage gaps in fringe areas, and it drops to 4G when 5G isn't available. Starlink doesn't share any of those dependencies — you're pulling signal direct from a satellite, and that connection doesn't care how many people in your zip code are streaming Netflix at 8 PM.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">The Starlink Mini — Wife's Yukon</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Starlink had a promotion on the Mini when I set up the Standard, so I grabbed one. It's going in my wife's Yukon for road trips and travel — smaller dish, lower power draw, designed for mobile use. That gets its own review once it's installed and tested.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Worth knowing: the Home Standard runs in portable mode. If I'm up at the cabin in Pennsylvania and want reliable internet for a week, the dish goes in the truck. It's not glued to your house.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">It Works Where There Is No Cell Signal</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>This is the part most reviews gloss over: Starlink doesn't need a cell tower. It doesn't need cable lines. It doesn't need any ground infrastructure at all. If you have a clear view of the sky and a power source, you have internet — anywhere on Earth.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>That means your cabin in the middle of nowhere that gets zero bars of cell service. That means a campsite two hours down a forest service road. That means rural properties where the nearest DSL option is slower than dial-up and the cable company will never run a line to you. If you can see the sky, you're connected.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>And once you're connected, the rest follows. WiFi calling over Starlink works — you can make and receive phone calls through your existing number using your carrier's WiFi calling feature or through apps like WhatsApp, FaceTime, or Signal. You can surf the web, stream video, video call family, run a remote work setup, all of it — without a single cell tower in range.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>For a lot of rural households, this isn't an upgrade. It's access they've never had before.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">Why This Matters If You're a Prepper</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>I've worked mutual aid power restoration after hurricanes, wildfires, and ice storms — New Jersey, Long Island after Sandy, California, Texas, Florida, Maine. What you see in those situations is that the internet goes down with the power. Cable lines go down. DSL goes down. Cell towers that don't have backup generators go dark within a few hours. Anything that runs on local ground infrastructure fails when the local infrastructure fails.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Starlink runs on a completely different dependency chain. The dish needs power — a battery bank, a generator, your vehicle's aux setup — but it doesn't need local cell towers or cable lines. During a regional grid event, that matters. The towers your phone depends on are gone. The lines your neighbors' cable runs through are down. Your Starlink dish, pointed at the sky with a battery behind it, is still pulling signal from orbit.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>I'm not claiming Starlink is a standalone SHTF solution. It's one layer in a stack. But as backup internet that isn't dependent on the same infrastructure that just went down in the storm, it earns its place. For rural folks whose only existing option is DSL or spotty cellular, there's really no conversation — Starlink is a substantial upgrade at any price.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">The Bottom Line</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>The dish is $599. Monthly residential plan runs $120/month, which is what I was paying Optimum anyway before they started adjusting the bundle.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>If you're in a rural area with DSL as your only option, this isn't a hard call. If you're paying $80–120 a month for cable internet with inconsistent performance, Starlink is worth looking at as a replacement, not just a backup. If you have solid fiber with reliable uptime, the argument becomes about redundancy — still a valid prepper reason, just a different calculation.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>My situation: canceled Optimum, switched full-time to Starlink, no regrets.</p>
<!-- /wp:paragraph -->

<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button {"backgroundColor":"primary","textColor":"white","className":"is-style-fill"} -->
<div class="wp-block-button is-style-fill"><a class="wp-block-button__link has-white-color has-primary-background-color has-text-color has-background wp-element-button" href="https://starlink.com/residential?referral=RC-DF-10862084-58749-8" target="_blank" rel="nofollow sponsored">Order Starlink — Use My Referral Link</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons -->

<!-- wp:heading -->
<h2 class="wp-block-heading">Frequently Asked Questions</h2>
<!-- /wp:heading -->

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">Does Starlink work in bad weather?</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Light rain and clouds don't have a meaningful effect. My rainy morning test returned 301 Mbps / 29ms — faster than most cable connections. Heavy storms can cause brief outages, but normal weather doesn't interrupt service.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">Can Starlink handle online gaming?</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Yes. 23–30ms latency puts it in the same range as cable internet. My youngest plays Fortnite on PS5 and my oldest games on PC through Steam — both were running simultaneously during my evening speed tests.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">How many devices can Starlink support?</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>I ran all tests with 47 devices active on the network and pulled 499 Mbps wired at 7:45 PM. Device count isn't the bottleneck — it's how many are actively transferring data at once. For a normal household, Starlink handles it without issues.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">What mount should I use for installation?</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>I used <a href="https://www.amazon.com/dp/B0GDNW6PS2?tag=prepperevo-20" target="_blank" rel="nofollow sponsored">this bracket</a> for my install. The Starlink app obstruction tool helps you find the right placement before you commit to drilling anything.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">Can you use Starlink off-grid or for emergency preparedness?</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Yes. The dish draws 75–100W, which pairs with a power station or solar setup. It doesn't depend on local cell towers or cable infrastructure — which is exactly the point from a preparedness standpoint. It runs on a completely different dependency chain than anything ground-based.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">Does Starlink work without cell service?</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Yes — and this is one of the most important things about it. Starlink doesn't use cell towers at all. It pulls signal directly from satellites in low-Earth orbit, so it works anywhere you have a clear view of the sky, regardless of cell coverage. Remote cabins, rural properties, off-grid locations, dead zones in the middle of nowhere — if you can point a dish at the sky and power it, you have internet. Once you're connected, WiFi calling works through your carrier or apps like WhatsApp and FaceTime, so you can make and receive calls even with zero cell bars.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">How much does Starlink cost?</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>The Home Standard hardware is $599. The residential plan runs $120/month. <a href="https://starlink.com/residential?referral=RC-DF-10862084-58749-8" target="_blank" rel="nofollow sponsored">Use my referral link</a> for a discount when you sign up.</p>
<!-- /wp:paragraph -->
`.trim();

async function run() {
  console.log("Creating Starlink Home Standard Review post...\n");

  const body = {
    title: "Starlink Home Standard Review 2026: Six Speed Tests, 47 Devices, Two Kids Gaming",
    slug: "starlink-home-standard-review",
    content,
    excerpt: "I ran six speed tests on Starlink Home Standard across morning, evening, sun, and rain — with 47 devices active and two kids gaming. Here's what the numbers actually look like compared to cable internet.",
    status: "draft",
    comment_status: "open",
    ping_status: "closed",
  };

  const res = await fetch(`${WP_API}/posts`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed: ${res.status} — ${text.slice(0, 300)}`);
  }

  const data = await res.json();
  console.log(`✓ Post created as DRAFT`);
  console.log(`  ID:    ${data.id}`);
  console.log(`  Slug:  ${data.slug}`);
  console.log(`  URL:   ${data.link}`);
  console.log(`\nNext steps:`);
  console.log(`  1. Upload starlink_home_internet.jpg to WP Media, set as featured image`);
  console.log(`  2. Set categories: Communication, Preparedness (Getting Started)`);
  console.log(`  3. Add tags: starlink, satellite internet, emergency internet, home internet, prepper internet`);
  console.log(`  4. RankMath SEO Title:  "Starlink Home Standard Review 2026: Real Speed Tests & Family Results"`);
  console.log(`  5. RankMath Desc:       "Six real-world speed tests on Starlink — wired, WiFi, rain, evening peak — with 47 devices and two kids gaming. Honest numbers vs Optimum and T-Mobile."`);
  console.log(`  6. Publish when ready`);
  console.log(`\n  WP Admin edit link: https://wp.prepperevolution.com/wp-admin/post.php?post=${data.id}&action=edit`);
}

run().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
