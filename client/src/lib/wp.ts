export interface WPPost {
  id: number;
  date: string;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  _embedded?: {
    "wp:featuredmedia"?: Array<{ source_url: string }>;
    "author"?: Array<{ name: string }>;
    "wp:term"?: Array<Array<{ id: number; name: string; slug: string }>>;
  };
}

export interface WPCategory {
  id: number;
  name: string;
  slug: string;
}

export async function fetchPosts(page = 1, categoryId?: number): Promise<{ posts: WPPost[], totalPages: number }> {
  let url = `/api/wp/posts?per_page=10&page=${page}`;
  if (categoryId) {
    url += `&categories=${categoryId}`;
  }
  
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch posts");
  
  const totalPages = parseInt(res.headers.get("x-wp-totalpages") || "1", 10);
  const posts = await res.json();
  
  return { posts, totalPages };
}

export async function fetchLatestPosts(limit = 3): Promise<WPPost[]> {
  const url = `/api/wp/posts?per_page=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch latest posts");
  return await res.json();
}

export async function fetchPostBySlug(slug: string): Promise<WPPost | null> {
  const res = await fetch(`/api/wp/posts?slug=${slug}`);
  if (!res.ok) throw new Error("Failed to fetch post");
  
  const posts = await res.json();
  return posts.length > 0 ? posts[0] : null;
}

export async function fetchCategories(): Promise<WPCategory[]> {
  const res = await fetch(`/api/wp/categories`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  
  return await res.json();
}

export function decodeHtmlEntities(str: string): string {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = str;
  return textarea.value;
}

const DEFAULT_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600";

const SLUG_IMAGE_MAP: Record<string, string> = {
  "beginners-guide-to-prepping": "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600",
  "building-your-first-bug-out-bag": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600",
  "water-purification-methods": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600",
  "long-term-food-storage-guide": "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600",
  "emergency-communication-grid-down": "https://images.unsplash.com/photo-1563203369-26f2e4a5ccf7?w=600",
  "first-aid-essentials-survival": "/images/articles/first-aid-essentials.png",
  "home-security-budget": "https://images.unsplash.com/photo-1558002038-1055907df827?w=600",
  "financial-preparedness": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600",
  "urban-vs-rural-prepping": "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=600",
  "top-10-skills-every-prepper-should-learn": "https://images.unsplash.com/photo-1517824806704-9040b037703b?w=600",
  "overlanding-for-preppers-bug-out-vehicle": "/images/articles/overlanding-bug-out-vehicle.png",
  "overland-expo-guide-2026": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600",
  "best-overlanding-gear-emergency-preparedness": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600",
  "campsite-selection-wilderness-survival": "/images/articles/campsite-selection.png",
  "ultralight-backpacking-gear-guide": "https://images.unsplash.com/photo-1551632811-561732d1e306?w=600"
};

const GENERIC_FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600",
  "https://images.unsplash.com/photo-1455448972184-de647495d428?w=600",
  "https://images.unsplash.com/photo-1445307399708-84c4ee5908b8?w=600",
  "https://images.unsplash.com/photo-1465310477141-6fb93167a273?w=600",
  "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=600",
  "https://images.unsplash.com/photo-1478131143263-83f42b576904?w=600",
  "https://images.unsplash.com/photo-1517824806704-9040b037703b?w=600",
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600",
  "https://images.unsplash.com/photo-1508873696983-2dfd5898f08b?w=600",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600"
];

function getHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function getFallbackImageForArticle(slug: string, title: string): string {
  if (SLUG_IMAGE_MAP[slug]) {
    return SLUG_IMAGE_MAP[slug];
  }
  
  const index = getHash(title) % GENERIC_FALLBACK_IMAGES.length;
  return GENERIC_FALLBACK_IMAGES[index];
}

export function getPostImage(post: any): string {
  const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  
  if (!featuredImage || featuredImage.includes("photo-1542601906990-b4d3fb778b09")) {
    return getFallbackImageForArticle(post.slug, post.title?.rendered || '');
  }
  return featuredImage;
}
