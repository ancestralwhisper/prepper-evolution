import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useSEO } from "@/hooks/useSEO";
import { mockProducts } from "@/content/products";
import { fetchCategories, fetchPosts, decodeHtmlEntities, getPostImage } from "@/lib/wp";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Link } from "wouter";

export default function Category() {
  const { name } = useParams();
  const decodedName = name ? decodeURIComponent(name).replace(/-/g, ' ') : '';
  
  const titleMap: Record<string, string> = {
    'preparedness': 'Preparedness',
    'overlanding': 'Overlanding',
    'camping': 'Camping',
    'gear reviews': 'Gear Reviews',
    'skills and strategy': 'Skills & Strategy',
    'skills & strategy': 'Skills & Strategy'
  };

  const categoryTitle = titleMap[decodedName.toLowerCase()] || decodedName;

  useSEO({
    title: `${categoryTitle} Guides & Gear`,
    description: `Browse all our ${categoryTitle.toLowerCase()} strategies, reviews, and field-tested gear.`,
  });

  // 1. Fetch Categories to find the ID for this category slug
  const { data: categories } = useQuery({
    queryKey: ["wp-categories"],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000,
  });

  // Find the category ID matching the slug
  const wpCategory = categories?.find(c => c.name.toLowerCase() === categoryTitle.toLowerCase());
  
  // 2. Fetch posts for that category ID
  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ["wp-posts-by-category", wpCategory?.id],
    queryFn: () => fetchPosts(1, wpCategory!.id),
    enabled: !!wpCategory?.id,
    staleTime: 5 * 60 * 1000,
  });

  const categoryArticles = postsData?.posts || [];
  const categoryProducts = mockProducts.filter(p => p.category.toLowerCase() === categoryTitle.toLowerCase());

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <Link href="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-8 font-medium">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Home
        </Link>
        
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-display font-bold uppercase tracking-tight mb-4">{categoryTitle}</h1>
        <p className="text-xl text-muted-foreground mb-16 max-w-2xl">
          Everything you need to master {categoryTitle.toLowerCase()}, from foundational skills to advanced strategies and vetted equipment.
        </p>

        {postsLoading ? (
          <div className="mb-20">
            <h2 className="text-2xl font-display font-bold mb-8 uppercase tracking-wider border-b border-border pb-4">Articles & Intel</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-2xl h-[400px] animate-pulse border border-border" />
              ))}
            </div>
          </div>
        ) : categoryArticles.length > 0 ? (
          <section className="mb-20">
            <h2 className="text-2xl font-display font-bold mb-8 uppercase tracking-wider border-b border-border pb-4">Articles & Intel</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categoryArticles.map(article => {
                const categoryName = decodeHtmlEntities(article._embedded?.['wp:term']?.[0]?.[0]?.name || "Uncategorized");
                const featuredImage = getPostImage(article, categoryName);
                return (
                  <Link key={article.id} href={`/articles/${article.slug}`} className="group block h-full">
                    <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300 h-full flex flex-col">
                      <div className="aspect-video relative overflow-hidden bg-muted">
                        <img src={featuredImage} alt={article.title.rendered} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-display font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2" dangerouslySetInnerHTML={{ __html: article.title.rendered }} />
                        <div className="text-muted-foreground mb-6 flex-1 line-clamp-3 prose prose-invert prose-p:my-0 text-sm" dangerouslySetInnerHTML={{ __html: article.excerpt.rendered }} />
                        <span className="inline-flex items-center text-primary font-medium group-hover:tracking-wide transition-all mt-auto">
                          Read more <ChevronRight className="w-4 h-4 ml-1" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}

        {categoryProducts.length > 0 && (
          <section>
            <h2 className="text-2xl font-display font-bold mb-8 uppercase tracking-wider border-b border-border pb-4">Vetted Gear</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categoryProducts.map(product => (
                <Link key={product.id} href={`/products/${product.slug}`} className="group block">
                  <div className="bg-card rounded-2xl overflow-hidden border border-border p-4 hover:border-primary/50 transition-colors h-full flex flex-col">
                    <div className="aspect-square bg-muted rounded-xl overflow-hidden mb-4">
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <h3 className="font-bold mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
                    <p className="text-muted-foreground text-sm flex-1 line-clamp-2 mb-4">{product.description}</p>
                    <p className="font-bold text-lg mt-auto">${product.price.toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {!postsLoading && categoryArticles.length === 0 && categoryProducts.length === 0 && (
          <div className="text-center py-20 bg-card rounded-2xl border border-border border-dashed">
            <h3 className="text-2xl font-display font-bold mb-2">No Content Yet</h3>
            <p className="text-muted-foreground">Please populate app/content files or WordPress with data for {categoryTitle}.</p>
          </div>
        )}
      </div>
    </div>
  );
}
