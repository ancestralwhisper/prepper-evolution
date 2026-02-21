import { useParams } from "wouter";
import { useSEO } from "@/hooks/useSEO";
import { mockProducts } from "@/content/products";
import { ChevronLeft, ShoppingCart, Check } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Product() {
  const { slug } = useParams();
  const product = mockProducts.find(p => p.slug === slug);

  useSEO({
    title: product?.name || "Product Not Found",
    description: product?.description || "Check out our top-rated survival gear.",
    type: "website",
    image: product?.imageUrl
  });

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">Product not found. Please add content to app/content/products.ts.</div>;
  }

  // Generate Schema Markup
  const schemaMarkup = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": [product.imageUrl],
    "description": product.description,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "price": product.price,
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <article className="min-h-screen bg-background pt-24 pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <Link href="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-8 font-medium">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Gear
        </Link>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div className="bg-card rounded-2xl overflow-hidden border border-border p-8 flex items-center justify-center aspect-square">
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-xl" />
          </div>
          
          <div className="space-y-8">
            <div>
              <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">{product.category}</span>
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">{product.name}</h1>
              <p className="text-2xl font-bold text-foreground/80">${product.price.toFixed(2)}</p>
            </div>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              {product.description}
            </p>
            
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h3 className="font-display font-bold text-xl border-b border-border pb-4">Key Features</h3>
              <ul className="space-y-3">
                {product.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-muted-foreground">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <Button size="lg" className="w-full h-14 text-lg font-bold tracking-wider uppercase shadow-xl" asChild>
              <a href={product.amazonLink} target="_blank" rel="noopener noreferrer">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Check Price on Amazon
              </a>
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              As an Amazon Associate we earn from qualifying purchases (Tag: prepperevo-20).
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
