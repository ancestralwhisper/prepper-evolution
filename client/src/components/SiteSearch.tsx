import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Search, X, FileText, Package } from "lucide-react";
import { motion } from "framer-motion";
import { searchPosts, decodeHtmlEntities, WPPost } from "@/lib/wp";
import type { Product } from "@shared/schema";

export function SiteSearch({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [articleResults, setArticleResults] = useState<WPPost[]>([]);
  const [productResults, setProductResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const allProductsRef = useRef<Product[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then(r => r.json())
      .then(data => { allProductsRef.current = data; })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setArticleResults([]);
      setProductResults([]);
      return;
    }

    const q = query.toLowerCase();
    const filtered = allProductsRef.current.filter(
      (p: Product) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    ).slice(0, 4);
    setProductResults(filtered);

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const posts = await searchPosts(query);
        setArticleResults(posts);
      } catch {
        setArticleResults([]);
      }
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const hasResults = articleResults.length > 0 || productResults.length > 0;
  const hasQuery = query.length >= 2;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-start justify-center pt-[10vh] px-4"
    >
      <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-[560px] bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center gap-3 px-4 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search articles, products, topics..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-14 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-base"
            data-testid="input-site-search"
          />
          <button onClick={onClose} className="p-2 rounded-md hover:bg-muted text-muted-foreground shrink-0" data-testid="button-search-close">
            <X className="w-4 h-4" />
          </button>
        </div>

        {hasQuery && (
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {productResults.length > 0 && (
              <div className="mb-2">
                <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Products</div>
                {productResults.map(p => (
                  <Link
                    key={p.slug}
                    href={`/products/${p.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors"
                    data-testid={`search-result-product-${p.slug}`}
                  >
                    <Package className="w-4 h-4 text-primary shrink-0" />
                    <div className="min-w-0">
                      <div className="font-medium text-sm text-foreground truncate">{p.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {p.category} — {p.onSale && p.salePrice ? (
                          <><span className="text-red-600 font-semibold">${parseFloat(String(p.salePrice)).toFixed(2)}</span> <span className="line-through">${parseFloat(String(p.price)).toFixed(2)}</span></>
                        ) : (
                          <>${parseFloat(String(p.price)).toFixed(2)}</>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {articleResults.length > 0 && (
              <div className="mb-2">
                <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Articles</div>
                {articleResults.map(post => (
                  <Link
                    key={post.id}
                    href={`/articles/${post.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors"
                    data-testid={`search-result-article-${post.slug}`}
                  >
                    <FileText className="w-4 h-4 text-primary shrink-0" />
                    <div className="min-w-0">
                      <div className="font-medium text-sm text-foreground truncate">{decodeHtmlEntities(post.title.rendered)}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {decodeHtmlEntities(post.excerpt.rendered.replace(/<[^>]*>/g, '')).slice(0, 80)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {!hasResults && !isSearching && (
              <div className="px-3 py-8 text-center text-muted-foreground text-sm">
                No results found for "{query}"
              </div>
            )}

            {isSearching && !hasResults && (
              <div className="px-3 py-8 text-center text-muted-foreground text-sm">
                Searching...
              </div>
            )}
          </div>
        )}

        {!hasQuery && (
          <div className="px-3 py-6 text-center text-muted-foreground text-sm">
            Start typing to search across articles and gear...
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
