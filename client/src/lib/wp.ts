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
  let url = `${WP_API_URL}/posts?_embed&per_page=10&page=${page}`;
  if (categoryId) {
    url += `&categories=${categoryId}`;
  }
  
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch posts");
  
  const totalPages = parseInt(res.headers.get("x-wp-totalpages") || "1", 10);
  const posts = await res.json();
  
  return { posts, totalPages };
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
