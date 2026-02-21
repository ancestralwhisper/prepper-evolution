import { useParams } from "wouter";
import { useSEO } from "@/hooks/useSEO";
import { mockArticles } from "@/content/articles";
import { mockProducts } from "@/content/products";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Link } from "wouter";

export default function Category() {
  const { name } = useParams();
  const decodedName = name ? decodeURIComponent(name).replace(/-/g, ' ') : '';
  
  // Format to match exact category names like "Gear Reviews", "Skills & Strategy"
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

  const categoryArticles = mockArticles.filter(a => a.category.toLowerCase() === categoryTitle.toLowerCase());
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

        {categoryArticles.length > 0 && (
          <section className="mb-20">
            <h2 className="text-2xl font-display font-bold mb-8 uppercase tracking-wider border-b border-border pb-4">Articles & Intel</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categoryArticles.map(article => (
                <Link key={article.id} href={`/articles/${article.slug}`} className="group block h-full">
                  <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300 h-full flex flex-col">
                    <div className="aspect-video relative overflow-hidden">
                      <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-display font-bold mb-3 group-hover:text-primary transition-colors">{article.title}</h3>
                      <p className="text-muted-foreground mb-6 flex-1 line-clamp-3">{article.excerpt}</p>
                      <span className="inline-flex items-center text-primary font-medium group-hover:tracking-wide transition-all mt-auto">
                        Read more <ChevronRight className="w-4 h-4 ml-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

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

        {categoryArticles.length === 0 && categoryProducts.length === 0 && (
          <div className="text-center py-20 bg-card rounded-2xl border border-border border-dashed">
            <h3 className="text-2xl font-display font-bold mb-2">No Content Yet</h3>
            <p className="text-muted-foreground">Please populate app/content files with data for {categoryTitle}.</p>
          </div>
        )}
      </div>
    </div>
  );
}
