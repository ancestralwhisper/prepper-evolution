import { useQuery } from "@tanstack/react-query";
import { Link, useSearch } from "wouter";
import { ChevronRight } from "lucide-react";
import { fetchPosts, decodeHtmlEntities, getPostImage } from "@/lib/wp";
import { useSEO } from "@/hooks/useSEO";
import CategoryFilter from "@/components/CategoryFilter";
import Pagination from "@/components/Pagination";
import { categoryAccent, BADGE_CLASSES } from "@/lib/categoryColors";

const ARTICLES_PER_PAGE = 12;

const SITE_CATEGORIES = [
  { id: "gear-reviews", name: "Gear Reviews", icon: "Backpack", wpIds: [3] },
  { id: "overlanding", name: "Overlanding", icon: "Compass", wpIds: [5] },
  { id: "camping", name: "Camping", icon: "Tent", wpIds: [9] },
  { id: "skills-strategy", name: "Skills & Strategy", icon: "Target", wpIds: [4] },
  { id: "water-food", name: "Water & Food", icon: "Droplets", wpIds: [6, 7] },
  { id: "first-aid", name: "First Aid", icon: "Heart", wpIds: [8] },
  { id: "communication", name: "Communication", icon: "Radio", wpIds: [10] },
  { id: "security", name: "Security", icon: "Shield", wpIds: [11] },
] as const;

export default function Articles() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const pageParam = Math.max(1, parseInt(params.get("page") || "1", 10) || 1);
  const categorySlug = params.get("category") || null;

  const activeCategory = categorySlug
    ? SITE_CATEGORIES.find((c) => c.id === categorySlug)
    : null;

  const categoryWpId = activeCategory?.wpIds?.[0] ?? undefined;

  const titleParts: string[] = [];
  if (activeCategory) titleParts.push(`${activeCategory.name} Articles`);
  else titleParts.push("Prepping Articles & Guides");
  if (pageParam > 1) titleParts.push(`Page ${pageParam}`);

  let description: string;
  if (activeCategory) {
    description = `Expert ${activeCategory.name.toLowerCase()} articles for preppers, overlanders, and outdoor enthusiasts. Actionable guides with no fluff.`;
  } else {
    description = "Expert prepping articles covering water, food storage, first aid, communication, security, overlanding, camping, and survival skills. Actionable guides with no fear-mongering.";
  }
  if (pageParam > 1) description += ` Page ${pageParam}.`;

  const canonicalUrl = `https://prepperevolution.com/articles${
    categorySlug ? `?category=${categorySlug}` : ''
  }${pageParam > 1 ? `${categorySlug ? '&' : '?'}page=${pageParam}` : ''}`;

  useSEO({
    title: titleParts.join(" - ") + " | Prepper Evolution",
    description,
    url: canonicalUrl,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["wp-posts", pageParam, categoryWpId],
    queryFn: () => fetchPosts(pageParam, categoryWpId),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * (attemptIndex + 1), 5000),
  });

  const totalPages = data?.totalPages || 1;
  const posts = data?.posts || [];

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4" data-testid="text-articles-title">
            {activeCategory ? (
              <>
                {activeCategory.name}{" "}
                <span className="text-primary">Articles</span>
              </>
            ) : (
              <>
                Prepping <span className="text-primary">Articles</span>
              </>
            )}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {activeCategory
              ? `Expert guides and deep dives on ${activeCategory.name.toLowerCase()}. No fluff, no fear-mongering.`
              : "Actionable guides and deep dives on every aspect of emergency preparedness. No fluff, no fear-mongering."}
          </p>
          {posts.length > 0 && (
            <p className="text-muted-foreground/60 text-sm mt-2" data-testid="text-articles-count">
              {activeCategory ? `${activeCategory.name}` : ""}
              {totalPages > 1 ? ` · Page ${pageParam} of ${totalPages}` : ""}
            </p>
          )}
        </div>

        <CategoryFilter
          categories={SITE_CATEGORIES}
          activeCategory={categorySlug}
        />

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card rounded-2xl h-[400px] animate-pulse border border-border" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border">
            <h3 className="text-2xl font-display font-bold text-destructive mb-2">Error Loading Articles</h3>
            <p className="text-muted-foreground">Unable to connect to the content server.</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              No articles found
              {activeCategory ? ` in ${activeCategory.name}` : ""}. Check back
              soon — new content is published regularly.
            </p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post: any) => {
                const category = decodeHtmlEntities(post._embedded?.['wp:term']?.[0]?.[0]?.name || "Uncategorized");
                const featuredImage = getPostImage(post);

                return (
                  <Link key={post.id} href={`/articles/${post.slug}`} className="group block h-full" data-testid={`card-article-${post.id}`}>
                    <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300 h-full flex flex-col">
                      <div className="aspect-video relative overflow-hidden bg-muted">
                        <img src={featuredImage} alt={post.title.rendered} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${BADGE_CLASSES[categoryAccent(category)]}`}>
                          {category}
                        </div>
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-display font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                        <div className="text-muted-foreground mb-6 flex-1 line-clamp-3 prose prose-invert prose-p:my-0 text-sm" dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} />
                        <span className="inline-flex items-center text-primary font-medium group-hover:tracking-wide transition-all mt-auto">
                          Read more <ChevronRight className="w-4 h-4 ml-1" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <Pagination
              currentPage={pageParam}
              totalPages={totalPages}
              basePath="/articles"
              categorySlug={categorySlug}
            />
          </>
        )}
      </div>
    </div>
  );
}
