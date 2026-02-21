import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetchPosts } from "@/lib/wp";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";

export default function Articles() {
  const [page, setPage] = useState(1);

  useSEO({
    title: "All Articles & Intel",
    description: "Browse our complete archive of survival guides, gear reviews, and preparedness strategies.",
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["wp-posts", page],
    queryFn: () => fetchPosts(page),
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
    refetchOnWindowFocus: true,
  });

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <Link href="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-8 font-medium">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Home
        </Link>
        
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-display font-bold uppercase tracking-tight mb-4">Field Notes</h1>
        <p className="text-xl text-muted-foreground mb-16 max-w-2xl">
          Our complete archive of expert guides, gear reviews, and survival intel.
        </p>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-card rounded-2xl h-[400px] animate-pulse border border-border" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border">
            <h3 className="text-2xl font-display font-bold text-destructive mb-2">Error Loading Articles</h3>
            <p className="text-muted-foreground">Unable to connect to the content server.</p>
          </div>
        ) : data?.posts.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border border-dashed">
            <h3 className="text-2xl font-display font-bold mb-2">No Articles Found</h3>
            <p className="text-muted-foreground">Check back soon for new content.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {data?.posts.map((post) => {
                const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09";
                const category = post._embedded?.['wp:term']?.[0]?.[0]?.name || "Uncategorized";

                return (
                  <Link key={post.id} href={`/articles/${post.slug}`} className="group block h-full">
                    <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300 h-full flex flex-col">
                      <div className="aspect-video relative overflow-hidden bg-muted">
                        <img src={featuredImage} alt={post.title.rendered} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold uppercase tracking-wider text-foreground">
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

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 border-t border-border pt-8">
                <Button 
                  variant="outline" 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                </Button>
                <span className="text-sm font-medium text-muted-foreground">
                  Page {page} of {data.totalPages}
                </span>
                <Button 
                  variant="outline" 
                  onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                  disabled={page === data.totalPages}
                >
                  Next <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
