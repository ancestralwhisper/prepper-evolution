// Push 3 food articles to WordPress + upload & assign featured images
// Also sets featured image for Post 1295 (N.O.M.A.D.)

import { readFileSync } from 'fs';
import { join } from 'path';

const WP_BASE = 'https://wp.prepperevolution.com/wp-json/wp/v2';
const AUTH = Buffer.from('pe_admin:S4U4 3447 gTtb uGvE Ga8f h4hi').toString('base64');
const HEADERS_JSON = {
  'Content-Type': 'application/json',
  'Authorization': `Basic ${AUTH}`,
};

// ─── Article definitions ───────────────────────────────────────────────────

const articles = [
  {
    file: 'C:/Users/Yeti Command/Documents/prepper-evolution/wordpress-articles/02-bug-out-bag-food.html',
    title: 'Bug Out Bag Food: What to Pack and What to Skip',
    slug: 'bug-out-bag-food',
    excerpt: 'Calorie-dense, lightweight picks your whole family will actually eat — plus what to skip and why most BOB food plans fail.',
    categories: [3, 10, 29], // preparedness, food-storage, bags-packs
    status: 'publish',
    imagePath: 'C:/Users/Yeti Command/Downloads/bug_out_bag_food.jpg',
    imageName: 'bug_out_bag_food.jpg',
    imageType: 'image/jpeg',
    imageAlt: 'Bug out bag food spread — Mountain House pouches, protein bars, and trail food on a wood table',
  },
  {
    file: 'C:/Users/Yeti Command/Documents/prepper-evolution/wordpress-articles/06-how-to-store-rice-long-term.html',
    title: 'How to Store Rice Long Term (And Actually Have It Last 25 Years)',
    slug: 'how-to-store-rice-long-term',
    excerpt: 'The right rice, the right containers, and the right process — how to store rice for 25+ years without it going rancid or infested.',
    categories: [3, 10], // preparedness, food-storage
    status: 'publish',
    imagePath: 'C:/Users/Yeti Command/Downloads/how_to_store_rice_long_term.jpg',
    imageName: 'how_to_store_rice_long_term.jpg',
    imageType: 'image/jpeg',
    imageAlt: 'Mylar bags stacked in organized food storage room with 5-gallon buckets on metal shelves',
  },
  {
    file: 'C:/Users/Yeti Command/Documents/prepper-evolution/wordpress-articles/07-best-canned-food-survival.html',
    title: "Best Canned Food for Survival: What's Worth Stockpiling",
    slug: 'best-canned-food-survival',
    excerpt: "Not all canned food is worth the shelf space. Here's what to actually stockpile for calorie density, nutrition, and shelf life.",
    categories: [3, 10], // preparedness, food-storage
    status: 'publish',
    imagePath: 'C:/Users/Yeti Command/Downloads/best_canned_food_for_survival.jpg',
    imageName: 'best_canned_food_for_survival.jpg',
    imageType: 'image/jpeg',
    imageAlt: 'Dim basement food storage room with battery lantern and rows of canned goods on metal shelving',
  },
];

// N.O.M.A.D. post — already exists as Post 1295, just needs featured image
const NOMAD = {
  postId: 1295,
  imagePath: 'C:/Users/Yeti Command/Downloads/project_nomad.png',
  imageName: 'project_nomad.png',
  imageType: 'image/png',
  imageAlt: 'Raspberry Pi 5 in rugged black N.O.M.A.D. case on a truck dashboard with yellow ethernet cable and SSD',
};

// ─── HTML body extractor ────────────────────────────────────────────────────

function extractBody(htmlPath) {
  // Read as latin1 (windows-1252) to avoid encoding corruption
  const raw = readFileSync(htmlPath, 'latin1');

  // Extract everything between <BODY ...> and </BODY>
  const bodyMatch = raw.match(/<BODY[^>]*>([\s\S]*?)<\/BODY>/i);
  if (!bodyMatch) throw new Error(`No BODY found in ${htmlPath}`);

  let body = bodyMatch[1];

  // Strip OpenOffice class attributes (CLASS="western", CLASS="cjk", etc.)
  body = body.replace(/\s+CLASS="[^"]*"/gi, '');

  // Clean up excessive whitespace between tags
  body = body.replace(/>\s{2,}</g, '>\n<');

  // Convert smart quotes that came through as windows-1252 bytes
  body = body
    .replace(/\u0091|\u2018/g, "'") // left single quote
    .replace(/\u0092|\u2019/g, "'") // right single quote
    .replace(/\u0093|\u201c/g, '"') // left double quote
    .replace(/\u0094|\u201d/g, '"') // right double quote
    .replace(/\u0096|\u2013/g, '–') // en dash
    .replace(/\u0097|\u2014/g, '—') // em dash
    .replace(/\u0085|\u2026/g, '…'); // ellipsis

  // Trim
  return body.trim();
}

// ─── WP API helpers ─────────────────────────────────────────────────────────

async function uploadImage({ imagePath, imageName, imageType, imageAlt }) {
  console.log(`  Uploading ${imageName}...`);
  const imageBuffer = readFileSync(imagePath);

  const res = await fetch(`${WP_BASE}/media`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${AUTH}`,
      'Content-Type': imageType,
      'Content-Disposition': `attachment; filename="${imageName}"`,
    },
    body: imageBuffer,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Image upload failed: ${res.status} — ${text.substring(0, 300)}`);
  }

  const data = await res.json();
  console.log(`  ✓ Image uploaded — Media ID ${data.id}`);

  // Set alt text
  if (imageAlt) {
    await fetch(`${WP_BASE}/media/${data.id}`, {
      method: 'POST',
      headers: HEADERS_JSON,
      body: JSON.stringify({ alt_text: imageAlt }),
    });
  }

  return data.id;
}

async function createPost(article, mediaId) {
  console.log(`  Creating post: ${article.slug}...`);
  const content = extractBody(article.file);

  const body = JSON.stringify({
    title: article.title,
    slug: article.slug,
    content,
    excerpt: article.excerpt,
    status: article.status,
    categories: article.categories,
    featured_media: mediaId,
  });

  const res = await fetch(`${WP_BASE}/posts`, {
    method: 'POST',
    headers: HEADERS_JSON,
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Post creation failed: ${res.status} — ${text.substring(0, 300)}`);
  }

  const data = await res.json();
  console.log(`  ✓ Post created — ID ${data.id} | ${data.link}`);
  return data;
}

async function setFeaturedImage(postId, mediaId) {
  const res = await fetch(`${WP_BASE}/posts/${postId}`, {
    method: 'POST',
    headers: HEADERS_JSON,
    body: JSON.stringify({ featured_media: mediaId }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Set featured image failed: ${res.status} — ${text.substring(0, 200)}`);
  }
  console.log(`  ✓ Featured image set on Post ${postId}`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const results = [];

  // Push 3 new articles
  for (const article of articles) {
    console.log(`\n── ${article.title}`);
    try {
      const mediaId = await uploadImage(article);
      const post = await createPost(article, mediaId);
      results.push({ title: article.title, postId: post.id, mediaId, url: post.link, status: 'ok' });
    } catch (err) {
      console.error(`  ✗ ${err.message}`);
      results.push({ title: article.title, status: 'error', error: err.message });
    }
  }

  // Set featured image for N.O.M.A.D. (Post 1295)
  console.log(`\n── N.O.M.A.D. (Post 1295) — featured image only`);
  try {
    const mediaId = await uploadImage(NOMAD);
    await setFeaturedImage(NOMAD.postId, mediaId);
    results.push({ title: 'N.O.M.A.D.', postId: NOMAD.postId, mediaId, status: 'ok (image only)' });
  } catch (err) {
    console.error(`  ✗ ${err.message}`);
    results.push({ title: 'N.O.M.A.D.', status: 'error', error: err.message });
  }

  console.log('\n─────────── Summary ───────────');
  for (const r of results) {
    if (r.status.startsWith('ok')) {
      console.log(`✓ ${r.title} — Post ${r.postId}, Media ${r.mediaId}`);
      if (r.url) console.log(`  ${r.url}`);
    } else {
      console.log(`✗ ${r.title} — ${r.error}`);
    }
  }
}

main();
