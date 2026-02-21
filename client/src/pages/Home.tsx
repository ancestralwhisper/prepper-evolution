import { Link } from "wouter";
import { useState, useEffect } from "react";
import { Moon, Sun, ChevronRight, CheckCircle2, Star, Shield, Battery, Navigation, Twitter, Instagram, Youtube, Facebook, Menu, X, RefreshCw, Search, FileText, Package } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDarkMode } from "@/hooks/useDarkMode";
import { useQuery } from "@tanstack/react-query";
import { fetchLatestPosts, decodeHtmlEntities, getPostImage, searchPosts, WPPost } from "@/lib/wp";
import { mockProducts, Product } from "@/content/products";

import heroBg from "@/assets/images/hero-bg.png";
import gearBackpack from "@/assets/images/gear-backpack.png";
import gearKnife from "@/assets/images/gear-knife.png";
import gearFilter from "@/assets/images/gear-filter.png";

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.12-3.44-3.17-3.61-5.66-.21-3.11 1.73-6.19 4.63-7.14.39-.12.81-.22 1.22-.27.06.6.01 1.2.03 1.8.03 1.13.06 2.27.04 3.4-.38.07-.76.15-1.13.29-1.2.4-2.14 1.4-2.31 2.66-.21 1.34.34 2.76 1.42 3.53 1.09.77 2.65.91 3.93.3 1.25-.56 2.1-1.78 2.23-3.19.16-3.83.07-7.67.1-11.51.01-2.42-.02-4.83.01-7.25z"/>
  </svg>
);

function SiteSearch({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [articleResults, setArticleResults] = useState<WPPost[]>([]);
  const [productResults, setProductResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setArticleResults([]);
      setProductResults([]);
      return;
    }

    const q = query.toLowerCase();
    const filtered = mockProducts.filter(
      p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
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
                      <div className="text-xs text-muted-foreground truncate">{p.category} — ${p.price}</div>
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

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(data.message);
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.message || "Something went wrong");
      }
    } catch {
      setStatus("error");
      setMessage("Failed to subscribe. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 max-w-lg mx-auto">
        <div className="flex items-center gap-2 text-white text-lg font-bold">
          <CheckCircle2 className="w-6 h-6" /> You're in! Welcome to the briefing.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 max-w-lg mx-auto">
      <form className="flex flex-col sm:flex-row gap-3" onSubmit={handleSubmit}>
        <Input 
          type="email" 
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-14 bg-white border-white text-black placeholder:text-gray-500 focus-visible:ring-black shadow-inner flex-1 font-medium"
          data-testid="input-newsletter-email"
          required
        />
        <Button 
          size="lg" 
          className="h-14 bg-black hover:bg-black/80 text-white px-8 whitespace-nowrap shadow-xl uppercase font-bold tracking-wider" 
          data-testid="button-newsletter-submit"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Subscribing..." : "Get Briefings"}
        </Button>
      </form>
      {status === "error" && <p className="text-white/90 text-sm font-medium">{message}</p>}
      <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-white sm:pl-4 font-medium">
        <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> No spam</span>
        <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Unsubscribe anytime</span>
      </div>
    </div>
  );
}

export default function Home() {
  const { isDark, toggle } = useDarkMode();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Parallax setup
  const { scrollY } = useScroll();
  const [isMobile, setIsMobile] = useState(false);
  
  const { data: latestPosts, isLoading: isLoadingPosts, refetch, isFetching } = useQuery({
    queryKey: ["wp-latest-posts"],
    queryFn: () => fetchLatestPosts(6),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const fieldNotes = latestPosts?.slice(0, 3) || [];
  const widgetArticles = latestPosts?.slice(3, 6) || [];

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile(); // Check on mount
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Parallax subtle movement
  const heroBgY = useTransform(scrollY, [0, 800], [0, isMobile ? 0 : 150]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* 1. Sticky Header */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/80 border-b border-border/50">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-xl tracking-wider uppercase">
              Prepper <span className="text-primary">Evolution</span>
            </span>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {['Preparedness', 'Overlanding', 'Camping', 'Gear Reviews', 'Skills & Strategy'].map((item) => (
              <Link 
                key={item} 
                href={`/category/${item.toLowerCase().replace(/ /g, '-')}`}
                className="text-foreground/80 hover:text-primary transition-colors hover:underline decoration-primary underline-offset-4"
                data-testid={`link-nav-${item.toLowerCase().replace(/ /g, '-')}`}
              >
                {item}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-3 md:p-2 rounded-full hover:bg-muted transition-colors focus:outline-none"
              aria-label="Search"
              data-testid="button-search-open"
            >
              <Search className="w-5 h-5" />
            </button>
            <button 
              onClick={toggle}
              className="p-3 md:p-2 rounded-full hover:bg-muted transition-colors focus:outline-none"
              aria-label="Toggle dark mode"
              data-testid="button-theme-toggle"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Button className="hidden md:inline-flex bg-primary hover:bg-primary/90 text-primary-foreground min-h-[44px]" data-testid="button-nav-start" asChild>
              <Link href="/start-here">Start Here</Link>
            </Button>
            
            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-3 rounded-full hover:bg-muted transition-colors focus:outline-none"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
              data-testid="button-mobile-menu-open"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60] md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[300px] bg-card border-l border-border z-[70] p-6 shadow-2xl flex flex-col md:hidden"
            >
              <div className="flex justify-between items-center mb-8">
                <span className="font-display font-bold text-lg tracking-wider uppercase">
                  Menu
                </span>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-3 rounded-full hover:bg-muted transition-colors"
                  aria-label="Close menu"
                  data-testid="button-mobile-menu-close"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <nav className="flex flex-col gap-6 flex-1">
                {['Preparedness', 'Overlanding', 'Camping', 'Gear Reviews', 'Skills & Strategy'].map((item) => (
                  <Link 
                    key={item} 
                    href={`/category/${item.toLowerCase().replace(/ /g, '-')}`}
                    className="text-lg font-medium text-foreground/80 hover:text-primary transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                    data-testid={`link-mobile-nav-${item.toLowerCase().replace(/ /g, '-')}`}
                  >
                    {item}
                  </Link>
                ))}
              </nav>
              
              <div className="mt-auto pt-8 border-t border-border">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground min-h-[44px] text-lg" onClick={() => setIsMenuOpen(false)} data-testid="button-mobile-nav-start" asChild>
                  <Link href="/start-here">Start Here</Link>
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && <SiteSearch onClose={() => setIsSearchOpen(false)} />}
      </AnimatePresence>

      {/* 2. Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-background">
        {/* Background Image with Overlay */}
        <motion.div 
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{ y: heroBgY }}
          className="absolute inset-0 z-0"
        >
          <img 
            src={heroBg} 
            alt="Rugged overlanding vehicle in forest" 
            className="w-full h-full object-cover object-center"
            data-testid="img-hero-bg"
          />
          {/* Gradient overlays to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 dark:from-background/80 dark:via-background/60 dark:to-background/80"></div>
          <div className="absolute inset-0 bg-black/20 dark:bg-black/40"></div>
        </motion.div>

        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="relative z-10 max-w-[1200px] mx-auto px-4 md:px-6 flex flex-col items-center text-center"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold uppercase tracking-tight text-white drop-shadow-sm mb-6" data-testid="text-hero-headline">
            Adapt. Prepare. <span className="text-primary">Evolve.</span>
          </h1>
          <p className="max-w-2xl text-lg md:text-xl text-white/90 mb-10 drop-shadow-md" data-testid="text-hero-subheadline">
            Expert gear reviews, field-tested guides, and strategies that actually work — for preppers, overlanders, and anyone who refuses to be caught off guard.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all text-lg h-14 px-8" data-testid="button-hero-start" asChild>
              <Link href="/start-here">
                Start Here <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 border-white/30 hover:bg-white/20 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all text-lg h-14 px-8 backdrop-blur-sm" data-testid="button-hero-browse" asChild>
              <Link href="/category/gear-reviews">
                Browse Gear Reviews
              </Link>
            </Button>
          </div>
          
          <p className="mt-8 text-sm text-white/70 font-medium tracking-wide uppercase flex items-center justify-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Trusted by thousands of preppers and overlanders since 2026
          </p>
        </motion.div>
      </section>

      {/* 3. Featured Content */}
      <motion.section 
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.4 }}
        className="py-20 bg-background"
      >
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4 uppercase tracking-tight">Master The Essentials</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto font-medium text-lg">Focus on the core pillars of survival and self-reliance.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Bug Out Bags", icon: Battery, desc: "Build the perfect 72-hour kit for any scenario.", link: "/category/preparedness" },
              { title: "Overland Navigation", icon: Navigation, desc: "Find your way when the grid goes down.", link: "/category/overlanding" },
              { title: "Water Procurement", icon: Shield, desc: "Filtration, purification, and storage techniques.", link: "/category/skills-&-strategy" }
            ].map((feature, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className="group p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-xl hover:border-primary/50 hover:-translate-y-2 transition-all duration-300 cursor-pointer flex flex-col h-full" 
                data-testid={`card-feature-${i}`}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mb-6 transition-colors duration-300">
                  <feature.icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-3 group-hover:text-primary transition-colors duration-300">{feature.title}</h3>
                <p className="text-muted-foreground mb-6 flex-grow">{feature.desc}</p>
                <Link href={feature.link} className="inline-flex items-center text-primary font-medium group-hover:tracking-wide transition-all duration-300 mt-auto">
                  Learn more <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 4. Best Of Picks */}
      <motion.section 
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.4 }}
        className="py-20 bg-card border-y border-border"
      >
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-4 uppercase tracking-tight">Top Rated Gear</h2>
              <p className="text-muted-foreground font-medium text-lg">Field-tested equipment we trust with our lives.</p>
            </div>
            <Button variant="outline" className="hidden md:flex" data-testid="button-view-all-reviews-desktop" asChild><Link href="/category/gear-reviews">View All Reviews</Link></Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { img: "/images/product-esee4.png", name: "ESEE 4", category: "Survival Tools & Knives", rating: 4.9, slug: "esee-4" },
              { img: "/images/product-ecoflow.png", name: "EcoFlow DELTA 2 Max", category: "Power & Energy", rating: 4.9, slug: "ecoflow-delta-2-max" },
              { img: "/images/product-lifestraw.png", name: "LifeStraw Personal Water Filter", category: "Water Purification", rating: 4.8, slug: "lifestraw-personal-water-filter" }
            ].map((item, i) => (
              <Link key={i} href={`/products/${item.slug}`}>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                  className="group cursor-pointer h-full flex flex-col" 
                  data-testid={`card-gear-${i}`}
                >
                  <div className="aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-muted relative">
                    <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold uppercase tracking-wider text-foreground">
                      {item.category}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mb-2 text-primary">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-medium text-sm text-foreground">{item.rating}</span>
                  </div>
                  <h3 className="text-lg font-bold font-display group-hover:text-primary transition-colors mt-auto">{item.name}</h3>
                </motion.div>
              </Link>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-8 md:hidden" data-testid="button-view-all-reviews-mobile" asChild><Link href="/category/gear-reviews">View All Reviews</Link></Button>
        </div>
      </motion.section>

      {/* 5. Lead Capture */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="py-24 relative overflow-hidden bg-primary dark:bg-primary"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay"></div>
        <div className="relative z-10 max-w-[800px] mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6 drop-shadow-md uppercase tracking-wider">
            Don't Wait Until It's Too Late
          </h2>
          <p className="text-white text-xl md:text-2xl font-display font-bold mb-3 drop-shadow-md uppercase tracking-wider">
            STAY READY. STAY SHARP.
          </p>
          <p className="text-white text-lg mb-10 max-w-2xl mx-auto drop-shadow-md font-medium">
            Get weekly gear reviews, field-tested strategies, and exclusive deals — straight to your inbox.
          </p>
          <NewsletterForm />
        </div>
      </motion.section>

      {/* 6. Field Notes & Intel */}
      <motion.section 
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.4 }}
        className="py-20 bg-background"
      >
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-12 uppercase tracking-tight">Field Notes & Intel</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:h-[450px]">
            <div className="space-y-8 h-full flex flex-col justify-center">
              {isLoadingPosts ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-muted rounded-xl animate-pulse"></div>
                ))
              ) : fieldNotes.length > 0 ? (
                fieldNotes.map((post: any, i: number) => {
                  const category = decodeHtmlEntities(post._embedded?.['wp:term']?.[0]?.[0]?.name || "Strategy");
                  const featuredImage = getPostImage(post);
                  
                  return (
                    <Link key={i} href={`/articles/${post.slug}`} className="block">
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.3, delay: i * 0.1 }}
                        className="flex gap-6 group cursor-pointer border-b border-border/50 pb-8 last:border-0 last:pb-0" 
                        data-testid={`card-article-${i}`}
                      >
                        <div className="w-24 h-24 md:w-32 md:h-24 rounded-lg bg-muted flex-shrink-0 overflow-hidden relative">
                          <img src={featuredImage} alt={post.title.rendered} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-primary font-bold uppercase tracking-wider">{category}</span>
                            <span className="text-xs text-muted-foreground font-medium">• {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                          </div>
                          <h3 className="text-lg font-bold font-display group-hover:text-primary transition-colors leading-snug line-clamp-2" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                        </div>
                      </motion.div>
                    </Link>
                  );
                })
              ) : (
                <p className="text-muted-foreground">No articles found.</p>
              )}
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="bg-card rounded-2xl p-8 border border-border shadow-sm flex flex-col h-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-display font-bold">Latest Articles</h3>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => refetch()} 
                  disabled={isFetching}
                  className="rounded-full h-8 w-8"
                  title="Refresh articles"
                >
                  <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <p className="text-muted-foreground mb-6">Stay up to date with our newest field notes, reviews, and strategies from the community.</p>
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                {isLoadingPosts ? (
                  [1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-muted rounded-xl animate-pulse"></div>
                  ))
                ) : widgetArticles.length > 0 ? (
                  widgetArticles.map((post: any, i: number) => {
                    const category = decodeHtmlEntities(post._embedded?.['wp:term']?.[0]?.[0]?.name || "Uncategorized");
                    const featuredImage = getPostImage(post);
                    const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    });
                    
                    return (
                      <Link key={i} href={`/articles/${post.slug}`} className="block">
                        <div className="flex items-center gap-4 p-3 rounded-xl bg-background hover:border-primary/50 border border-transparent transition-colors group" data-testid={`link-latest-article-${i}`}>
                          <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0 relative">
                            <img src={featuredImage} alt={post.title.rendered} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{category}</span>
                              <span className="text-[10px] text-muted-foreground">{formattedDate}</span>
                            </div>
                            <span className="font-medium group-hover:text-primary transition-colors line-clamp-2 text-sm leading-snug" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0" />
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground italic">No articles found.</p>
                )}
              </div>
              
              <Button variant="outline" className="w-full mt-6" asChild>
                <Link href="/articles">View All Articles</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* 8. Footer */}
      <footer className="bg-[#11111A] text-white/70 py-16">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <span className="font-display font-bold text-2xl tracking-wider uppercase text-white mb-4 block">
                Prepper <span className="text-primary">Evolution</span>
              </span>
              <p className="max-w-md mb-6">
                Dedicated to helping individuals and families adapt, prepare, and evolve for whatever challenges lie ahead.
              </p>
              <div className="flex gap-4">
                <a href="https://x.com/prepperevol" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary transition-colors flex items-center justify-center cursor-pointer" aria-label="X (Twitter)">
                  <Twitter className="w-4 h-4 text-white" />
                </a>
                <a href="https://instagram.com/prepperevolution" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary transition-colors flex items-center justify-center cursor-pointer" aria-label="Instagram">
                  <Instagram className="w-4 h-4 text-white" />
                </a>
                <a href="https://youtube.com/@prepperevolution" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary transition-colors flex items-center justify-center cursor-pointer" aria-label="YouTube">
                  <Youtube className="w-4 h-4 text-white" />
                </a>
                <a href="https://tiktok.com/@prepperevolution" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary transition-colors flex items-center justify-center cursor-pointer" aria-label="TikTok">
                  <TikTokIcon className="w-4 h-4 text-white" />
                </a>
                <a href="https://www.facebook.com/profile.php?id=61588576407742" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary transition-colors flex items-center justify-center cursor-pointer" aria-label="Facebook">
                  <Facebook className="w-4 h-4 text-white" />
                </a>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-8 col-span-1 md:col-span-2">
              <div>
                <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Explore</h4>
                <ul className="space-y-2">
                  <li><Link href="/category/gear-reviews" className="hover:text-primary transition-colors">Gear Reviews</Link></li>
                  <li><Link href="/category/overlanding" className="hover:text-primary transition-colors">Overlanding</Link></li>
                  <li><Link href="/category/camping" className="hover:text-primary transition-colors">Camping</Link></li>
                  <li><Link href="/category/skills-&-strategy" className="hover:text-primary transition-colors">Skills</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Company</h4>
                <ul className="space-y-2">
                  <li><Link href="/" className="hover:text-primary transition-colors">About Us</Link></li>
                  <li><Link href="/" className="hover:text-primary transition-colors">Contact</Link></li>
                  <li><Link href="/" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <p>&copy; 2026 Prepper Evolution. All rights reserved.</p>
            <p className="font-display tracking-widest uppercase text-xs font-bold text-white/50">Built for the resilient.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}