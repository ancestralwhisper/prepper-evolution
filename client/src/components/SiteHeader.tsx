import { useState } from "react";
import { Link } from "wouter";
import { Moon, Sun, Search, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useDarkMode } from "@/hooks/useDarkMode";
import { SiteSearch } from "@/components/SiteSearch";

const NAV_ITEMS = [
  { label: 'Preparedness',    href: '/category/preparedness',       hover: 'hover:text-red-500     decoration-red-500'     },
  { label: 'Overlanding',     href: '/category/overlanding',        hover: 'hover:text-emerald-600 decoration-emerald-600' },
  { label: 'Camping',         href: '/category/camping',            hover: 'hover:text-emerald-600 decoration-emerald-600' },
  { label: 'Gear Reviews',    href: '/category/gear-reviews',       hover: 'hover:text-primary     decoration-primary'     },
  { label: 'Shop Gear',       href: '/products',                    hover: 'hover:text-primary     decoration-primary'     },
  { label: 'Skills & Strategy', href: '/category/skills-&-strategy', hover: 'hover:text-red-500   decoration-red-500'     },
  { label: 'Tools',           href: '/tools',                       hover: 'hover:text-primary     decoration-primary'     },
];

export default function SiteHeader() {
  const { isDark, toggle } = useDarkMode();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/80 border-b border-border/50">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display font-bold text-xl tracking-wider uppercase">
              Prepper <span className="text-primary">Evolution</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`text-foreground/80 transition-colors hover:underline underline-offset-4 ${item.hover}`}
                data-testid={`link-nav-${item.label.toLowerCase().replace(/ /g, '-')}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

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
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`text-lg font-medium text-foreground/80 transition-colors py-2 ${item.hover}`}
                    onClick={() => setIsMenuOpen(false)}
                    data-testid={`link-mobile-nav-${item.label.toLowerCase().replace(/ /g, '-')}`}
                  >
                    {item.label}
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

      <AnimatePresence>
        {isSearchOpen && <SiteSearch onClose={() => setIsSearchOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
