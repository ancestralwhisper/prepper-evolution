export const WP_API_URL = "https://prepperevolution.com/wp-json/wp/v2";

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
  let url = `${WP_API_URL}/posts?_embed&per_page=10&page=${page}&status=publish&orderby=date&order=desc`;
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
  const url = `${WP_API_URL}/posts?_embed&per_page=${limit}&status=publish&orderby=date&order=desc`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch latest posts");
  return await res.json();
}

export async function fetchPostBySlug(slug: string): Promise<WPPost | null> {
  const res = await fetch(`${WP_API_URL}/posts?_embed&slug=${slug}`);
  if (!res.ok) throw new Error("Failed to fetch post");
  
  const posts = await res.json();
  return posts.length > 0 ? posts[0] : null;
}

export async function fetchCategories(): Promise<WPCategory[]> {
  const res = await fetch(`${WP_API_URL}/categories?per_page=100`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  
  return await res.json();
}

export function decodeHtmlEntities(str: string): string {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = str;
  return textarea.value;
}

const DEFAULT_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600";

export function getFallbackImageForCategory(categoryName: string): string {
  const name = categoryName.toLowerCase();
  if (name.includes("preparedness")) return "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600";
  if (name.includes("overland")) return "https://images.unsplash.com/photo-1533591380348-14193f1de18f?w=600";
  if (name.includes("camping") || name.includes("outdoor")) return "https://images.unsplash.com/photo-1478131143263-83f42b576904?w=600";
  if (name.includes("gear")) return "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600";
  if (name.includes("skills") || name.includes("strategy")) return "https://images.unsplash.com/photo-1517824806704-9040b037703b?w=600";
  if (name.includes("backpack")) return "https://images.unsplash.com/photo-1551632811-561732d1e306?w=600";
  if (name.includes("water")) return "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600";
  if (name.includes("power") || name.includes("energy")) return "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600";
  if (name.includes("bug out") || name.includes("emergency")) return "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600";
  return DEFAULT_FALLBACK_IMAGE;
}

export function getPostImage(post: any, decodedCategory: string): string {
  const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  
  // The user mentioned "all share the same default image". We need to check for missing image OR that specific default image
  // Looking at the previous code, it had: || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09"
  // Let's assume that if it's missing, or if it matches that specific unsplash photo, it's a fallback.
  // Actually, wait, maybe WordPress itself is returning a specific fallback? If it's returning a generic WP fallback we should catch it.
  // But if it's missing, it's undefined. 
  if (!featuredImage || featuredImage.includes("photo-1542601906990-b4d3fb778b09")) {
    return getFallbackImageForCategory(decodedCategory);
  }
  return featuredImage;
}
