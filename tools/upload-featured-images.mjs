/**
 * upload-featured-images.mjs
 * Uploads 5 featured images to WordPress media library and sets them on the correct posts.
 * Run: node tools/upload-featured-images.mjs
 */

import fs from "fs";
import path from "path";

const WP_URL   = "https://wp.prepperevolution.com/wp-json/wp/v2";
const WP_USER  = "pe_admin";
const WP_PASS  = "S4U4 3447 gTtb uGvE Ga8f h4hi";
const AUTH     = "Basic " + Buffer.from(`${WP_USER}:${WP_PASS}`).toString("base64");

// Map: article slug → local image path
const IMAGES = [
  {
    slug: "food-storage-calculator",
    file: "C:/Users/Yeti Command/Downloads/(food-storage-calculator.jpg",
    alt:  "Pantry shelves stocked with sealed buckets, Mylar bags, and canned goods for emergency food storage",
    caption: "A real food storage setup — bulk staples in sealed containers, canned goods rotated on lower shelves.",
  },
  {
    slug: "how-much-water-to-store-for-emergency",
    file: "C:/Users/Yeti Command/Downloads/how-much-water-to-store-for-emergency.jpg",
    alt:  "Blue 55-gallon water storage barrels and stackable 5-gallon jugs in a garage",
    caption: "Two 55-gallon barrels plus stackable jugs — a practical water storage setup for a family of 4.",
  },
  {
    slug: "72-hour-survival-kit",
    file: "C:/Users/Yeti Command/Downloads/(72-hour-survival-kit.jpg",
    alt:  "72-hour emergency kit laid out next to a tactical backpack — first aid, radio, water filter, multi-tool",
    caption: "A functional 72-hour kit: water filter, first aid, comms, shelter, tools — organized and ready to go.",
  },
  {
    slug: "bug-out-bag-list",
    file: "C:/Users/Yeti Command/Downloads/bug-out-bag-list.jpg",
    alt:  "Loaded bug out bag on a truck tailgate at sunset on a forest road",
    caption: "A properly loaded BOB on a truck tailgate — ready to move in 10 minutes.",
  },
  {
    slug: "how-many-solar-panels-do-i-need",
    file: "C:/Users/Yeti Command/Downloads/how-many-solar-panels-do-i-need.jpg",
    alt:  "Portable solar panels deployed on gravel connected to a power station",
    caption: "Two folding solar panels running a portable power station — a real overlanding and emergency power setup.",
  },
];

async function getPostBySlug(slug) {
  const url = `${WP_URL}/posts?slug=${encodeURIComponent(slug)}&status=any&_fields=id,slug,title,status`;
  const res = await fetch(url, { headers: { Authorization: AUTH } });
  if (!res.ok) throw new Error(`Failed to fetch post: ${res.status}`);
  const posts = await res.json();
  if (!posts.length) throw new Error(`Post not found: ${slug}`);
  return posts[0];
}

async function uploadMedia(filePath, alt, caption) {
  const filename = path.basename(filePath).replace(/^\(/, ""); // strip leading (
  const buffer   = fs.readFileSync(filePath);

  const res = await fetch(`${WP_URL}/media`, {
    method: "POST",
    headers: {
      Authorization:       AUTH,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type":      "image/jpeg",
    },
    body: buffer,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Media upload failed (${res.status}): ${err}`);
  }

  const media = await res.json();

  // Set alt text and caption
  await fetch(`${WP_URL}/media/${media.id}`, {
    method: "POST",
    headers: {
      Authorization: AUTH,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ alt_text: alt, caption }),
  });

  return media.id;
}

async function setFeaturedImage(postId, mediaId) {
  const res = await fetch(`${WP_URL}/posts/${postId}`, {
    method: "POST",
    headers: {
      Authorization: AUTH,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ featured_media: mediaId }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Set featured image failed (${res.status}): ${err}`);
  }
  return res.json();
}

async function run() {
  console.log("Starting featured image upload...\n");

  for (const item of IMAGES) {
    try {
      process.stdout.write(`[${item.slug}] `);

      // 1. Find the post
      const post = await getPostBySlug(item.slug);
      process.stdout.write(`post ID ${post.id} (${post.status}) → `);

      // 2. Upload the image
      const mediaId = await uploadMedia(item.file, item.alt, item.caption);
      process.stdout.write(`media ID ${mediaId} uploaded → `);

      // 3. Set as featured image
      await setFeaturedImage(post.id, mediaId);
      console.log("✓ featured image set");

    } catch (err) {
      console.error(`\n  ERROR: ${err.message}`);
    }
  }

  console.log("\nDone.");
}

run();
