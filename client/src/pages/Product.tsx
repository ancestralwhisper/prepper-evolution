import { useParams } from "wouter";
import { useSEO } from "@/hooks/useSEO";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ShoppingCart, Check, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { Product as ProductType } from "@shared/schema";

export default function Product() {
  const { slug } = useParams();
  const { toast } = useToast();
  const [isCheckingLink, setIsCheckingLink] = useState(false);

  const { data: product, isLoading } = useQuery<ProductType>({
    queryKey: ["product", slug],
    queryFn: async () => {
      const res = await fetch(`/api/products/${slug}`);
      if (!res.ok) throw new Error("Product not found");
      return res.json();
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  const { data: linkHealth } = useQuery<{ isHealthy: boolean }>({
    queryKey: ["link-health-product", slug],
    queryFn: async () => {
      const res = await fetch(`/api/link-health/product/${slug}`);
      if (!res.ok) return { isHealthy: true };
      return res.json();
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  const isLinkHealthy = linkHealth?.isHealthy !== false;

  const handleAmazonClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!product || !isLinkHealthy) return;
    
    e.preventDefault();
    setIsCheckingLink(true);

    try {
      const res = await fetch(`/api/link-health/check/${slug}`);
      const result = await res.json();

      if (result.isHealthy) {
        window.open(product.amazonLink, "_blank", "noopener,noreferrer");
      } else {
        toast({
          title: "This product may be unavailable",
          description: "The Amazon link appears to be temporarily down. We've logged this for review.",
          variant: "destructive",
        });
      }
    } catch {
      window.open(product.amazonLink, "_blank", "noopener,noreferrer");
    } finally {
      setIsCheckingLink(false);
    }
  };

  useSEO({
    title: product?.name || "Product Not Found",
    description: product?.description || "Check out our top-rated survival gear.",
    type: "website",
    image: product?.imageUrl
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading gear intel...</div>;
  }

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">Product not found.</div>;
  }

  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;

  const schemaMarkup = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": [product.imageUrl],
    "description": product.description,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "price": price,
      "availability": isLinkHealthy ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };

  return (
    <article className="min-h-screen bg-background pt-24 pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <Button 
          variant="ghost" 
          className="text-primary hover:text-primary/80 hover:bg-transparent px-0 mb-8 font-medium"
          onClick={() => window.history.length > 1 ? window.history.back() : window.location.href = '/'}
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div className="bg-card rounded-2xl overflow-hidden border border-border p-8 flex items-center justify-center aspect-square">
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-xl" />
          </div>
          
          <div className="space-y-8">
            <div>
              <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">{product.category}</span>
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">{product.name}</h1>
              <p className="text-2xl font-bold text-foreground/80">${price.toFixed(2)}</p>
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
            
            {isLinkHealthy ? (
              <>
                <Button 
                  size="lg" 
                  className="w-full h-14 text-lg font-bold tracking-wider uppercase shadow-xl" 
                  disabled={isCheckingLink}
                  asChild
                >
                  <a 
                    href={product.amazonLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={handleAmazonClick}
                    data-testid="button-buy-amazon"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {isCheckingLink ? "Checking availability..." : "Check Price on Amazon"}
                  </a>
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  As an Amazon Associate we earn from qualifying purchases (Tag: prepperevo-20).
                </p>
              </>
            ) : (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 text-center" data-testid="status-unavailable">
                <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-1">Currently Unavailable</h3>
                <p className="text-muted-foreground text-sm">
                  This product's Amazon listing is temporarily unavailable. Check back soon — we're monitoring it.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
