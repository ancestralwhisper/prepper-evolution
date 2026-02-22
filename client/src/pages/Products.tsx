import { useState } from "react";
import { Link } from "wouter";
import { useSEO } from "@/hooks/useSEO";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Filter, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import type { Product } from "@shared/schema";

const categories = [
  "All",
  "Water Purification",
  "Power & Energy",
  "Shelter & Sleep Systems",
  "Navigation & Communication",
  "Food & Cooking",
  "Overlanding Vehicles",
  "Bug Out & Emergency",
  "Survival Tools & Knives",
];

export default function Products() {
  const [activeCategory, setActiveCategory] = useState("All");

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  useSEO({
    title: "Shop Gear | Prepper Evolution",
    description: "Browse our curated selection of survival, overlanding, and preparedness gear. Tested and reviewed by real preppers.",
  });

  const filtered = activeCategory === "All"
    ? products
    : products.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1
            className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-3"
            data-testid="text-products-heading"
          >
            Shop Gear
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Curated survival, overlanding, and preparedness gear — tested and reviewed by real preppers.
          </p>
        </div>

        <div className="mb-8 flex items-center gap-2 flex-wrap" data-testid="filter-categories">
          <Filter className="w-4 h-4 text-muted-foreground mr-1 hidden sm:block" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
              data-testid={`filter-category-${cat.toLowerCase().replace(/ /g, '-')}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : null}

        <p className="text-sm text-muted-foreground mb-6" data-testid="text-products-count">
          Showing {filtered.length} product{filtered.length !== 1 ? "s" : ""}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((product, i) => (
            <motion.div
              key={product.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300"
              data-testid={`card-product-${product.slug}`}
            >
              <Link href={`/products/${product.slug}`}>
                <div className="aspect-square overflow-hidden bg-muted">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    data-testid={`img-product-${product.slug}`}
                  />
                </div>
              </Link>
              <div className="p-4 flex flex-col gap-2">
                <span
                  className="inline-block self-start px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                  data-testid={`badge-category-${product.slug}`}
                >
                  {product.category}
                </span>
                <Link href={`/products/${product.slug}`}>
                  <h3
                    className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors"
                    data-testid={`text-name-${product.slug}`}
                  >
                    {product.name}
                  </h3>
                </Link>
                <p
                  className="text-lg font-bold text-primary"
                  data-testid={`text-price-${product.slug}`}
                >
                  ${parseFloat(String(product.price)).toFixed(2)}
                </p>
                <Button
                  asChild
                  size="sm"
                  className="mt-1 w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  data-testid={`button-view-${product.slug}`}
                >
                  <Link href={`/products/${product.slug}`}>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    View Details
                  </Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
