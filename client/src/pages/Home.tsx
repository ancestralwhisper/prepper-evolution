import { Moon, Sun, ChevronRight, CheckCircle2, Star, Shield, Battery, Navigation, Twitter, Instagram, Youtube, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDarkMode } from "@/hooks/useDarkMode";

import heroBg from "@/assets/images/hero-bg.png";
import gearBackpack from "@/assets/images/gear-backpack.png";
import gearKnife from "@/assets/images/gear-knife.png";
import gearFilter from "@/assets/images/gear-filter.png";
import articleWinter from "@/assets/images/article-winter.png";
import articleComms from "@/assets/images/article-comms.png";
import articleFood from "@/assets/images/article-food.png";

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.12-3.44-3.17-3.61-5.66-.21-3.11 1.73-6.19 4.63-7.14.39-.12.81-.22 1.22-.27.06.6.01 1.2.03 1.8.03 1.13.06 2.27.04 3.4-.38.07-.76.15-1.13.29-1.2.4-2.14 1.4-2.31 2.66-.21 1.34.34 2.76 1.42 3.53 1.09.77 2.65.91 3.93.3 1.25-.56 2.1-1.78 2.23-3.19.16-3.83.07-7.67.1-11.51.01-2.42-.02-4.83.01-7.25z"/>
  </svg>
);

export default function Home() {
  const { isDark, toggle } = useDarkMode();

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
              <a 
                key={item} 
                href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                className="text-foreground/80 hover:text-primary transition-colors hover:underline decoration-primary underline-offset-4"
                data-testid={`link-nav-${item.toLowerCase().replace(/ /g, '-')}`}
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button 
              onClick={toggle}
              className="p-2 rounded-full hover:bg-muted transition-colors focus:outline-none"
              aria-label="Toggle dark mode"
              data-testid="button-theme-toggle"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Button className="hidden sm:inline-flex bg-primary hover:bg-primary/90 text-primary-foreground" data-testid="button-nav-start">
              Start Here
            </Button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-background">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBg} 
            alt="Rugged overlanding vehicle in forest" 
            className="w-full h-full object-cover object-center"
            data-testid="img-hero-bg"
          />
          {/* Gradient overlays to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/75 via-background/55 to-background/75 dark:from-[#1A1A2E]/75 dark:via-[#1A1A2E]/55 dark:to-[#1A1A2E]/80"></div>
          <div className="absolute inset-0 bg-black/0 dark:bg-black/25"></div>
        </div>

        <div className="relative z-10 max-w-[1200px] mx-auto px-4 md:px-6 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold uppercase tracking-tight text-foreground drop-shadow-sm mb-6" data-testid="text-hero-headline">
            Adapt. Prepare. <span className="text-primary">Evolve.</span>
          </h1>
          <p className="max-w-2xl text-lg md:text-xl text-foreground/90 mb-10 drop-shadow-md" data-testid="text-hero-subheadline">
            Expert gear reviews, field-tested guides, and strategies that actually work — for preppers, overlanders, and anyone who refuses to be caught off guard.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all text-lg h-14 px-8" data-testid="button-hero-start">
              Start Here <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border-foreground/30 hover:bg-foreground/5 dark:border-white/30 dark:hover:bg-white/10 text-foreground text-lg h-14 px-8 backdrop-blur-sm" data-testid="button-hero-browse">
              Browse Gear Reviews
            </Button>
          </div>
          
          <p className="mt-8 text-sm text-foreground/70 font-medium tracking-wide uppercase flex items-center justify-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Trusted by thousands of preppers and overlanders since 2025
          </p>
        </div>
      </section>

      {/* 3. Featured Content */}
      <section className="py-20 bg-background">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Master The Essentials</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Focus on the core pillars of survival and self-reliance.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Bug Out Bags", icon: Battery, desc: "Build the perfect 72-hour kit for any scenario." },
              { title: "Overland Navigation", icon: Navigation, desc: "Find your way when the grid goes down." },
              { title: "Water Procurement", icon: Shield, desc: "Filtration, purification, and storage techniques." }
            ].map((feature, i) => (
              <div key={i} className="group p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-xl hover:border-primary/50 hover:-translate-y-2 transition-all duration-300 cursor-pointer flex flex-col h-full" data-testid={`card-feature-${i}`}>
                <div className="w-12 h-12 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mb-6 transition-colors duration-300">
                  <feature.icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-3 group-hover:text-primary transition-colors duration-300">{feature.title}</h3>
                <p className="text-muted-foreground mb-6 flex-grow">{feature.desc}</p>
                <a href="#" className="inline-flex items-center text-primary font-medium group-hover:tracking-wide transition-all duration-300 mt-auto">
                  Learn more <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Best Of Picks */}
      <section className="py-20 bg-card border-y border-border">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Top Rated Gear</h2>
              <p className="text-muted-foreground">Field-tested equipment we trust with our lives.</p>
            </div>
            <Button variant="outline" className="hidden md:flex" data-testid="button-view-all-reviews-desktop">View All Reviews</Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { img: gearBackpack, name: "Tactical Alpha 72h Pack", category: "Backpacks", rating: 4.9 },
              { img: gearKnife, name: "Bushcraft Survival Blade", category: "Tools", rating: 4.8 },
              { img: gearFilter, name: "Pro-Gravity Water Filter", category: "Hydration", rating: 5.0 }
            ].map((item, i) => (
              <div key={i} className="group cursor-pointer" data-testid={`card-gear-${i}`}>
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
                <h3 className="text-lg font-bold font-display group-hover:text-primary transition-colors">{item.name}</h3>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-8 md:hidden" data-testid="button-view-all-reviews-mobile">View All Reviews</Button>
        </div>
      </section>

      {/* 5. Lead Capture */}
      <section className="py-24 relative overflow-hidden bg-[#1A1A1A] dark:bg-[#0D0D0D]">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
        <div className="relative z-10 max-w-[800px] mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6 drop-shadow-sm">
            Don't Wait Until It's Too Late
          </h2>
          <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto drop-shadow-sm">
            Join 50,000+ preppers receiving our weekly intelligence briefings, gear discounts, and survival strategies.
          </p>
          <div className="flex flex-col gap-3 max-w-lg mx-auto">
            <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
              <Input 
                type="email" 
                placeholder="Enter your email address" 
                className="h-14 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-primary shadow-inner flex-1"
                data-testid="input-newsletter-email"
              />
              <Button size="lg" className="h-14 bg-primary hover:bg-primary/90 text-primary-foreground px-8 whitespace-nowrap shadow-md" data-testid="button-newsletter-submit">
                Get Briefings
              </Button>
            </form>
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-white/70 sm:pl-4">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> No spam</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Unsubscribe anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Latest Articles */}
      <section className="py-20 bg-background">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-12">Field Notes & Intel</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              {[
                { title: "Winter Overlanding: 10 Critical Upgrades", image: articleWinter }, 
                { title: "Comms Down: Building a Local Radio Network", image: articleComms }, 
                { title: "Food Storage Rotation Methods That Work", image: articleFood }
              ].map((article, i) => (
                <div key={i} className="flex gap-6 group cursor-pointer border-b border-border/50 pb-8 last:border-0 last:pb-0" data-testid={`card-article-${i}`}>
                  <div className="w-24 h-24 md:w-32 md:h-24 rounded-lg bg-muted flex-shrink-0 overflow-hidden relative">
                    <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div>
                    <div className="text-xs text-primary font-bold uppercase tracking-wider mb-2">Strategy</div>
                    <h3 className="text-lg font-bold font-display group-hover:text-primary transition-colors leading-snug">
                      {article.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <h3 className="text-2xl font-display font-bold mb-4">Expert Guides Series</h3>
              <p className="text-muted-foreground mb-6">Deep dives into complex preparedness topics, written by industry professionals and former military.</p>
              <div className="space-y-3">
                {[
                  'The Complete Guide to Solar Generators', 
                  'Vehicle Armor & Security Modifications', 
                  'EMP Protection Myths & Realities'
                ].map((guide, i) => (
                  <a key={i} href="#" className="flex items-center justify-between p-4 rounded-xl bg-background hover:border-primary/50 border border-transparent transition-colors group" data-testid={`link-guide-${i}`}>
                    <span className="font-medium group-hover:text-primary transition-colors">{guide}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Trust Bar */}
      <div className="border-y border-border bg-card py-10">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="text-xl font-display font-bold uppercase tracking-widest text-foreground">Outdoor Mag</div>
          <div className="text-xl font-display font-bold uppercase tracking-widest text-foreground">Overland Bound</div>
          <div className="text-xl font-display font-bold uppercase tracking-widest text-foreground">Prepper Daily</div>
          <div className="text-xl font-display font-bold uppercase tracking-widest text-foreground">Survivalist</div>
        </div>
      </div>

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
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary transition-colors flex items-center justify-center cursor-pointer" aria-label="X (Twitter)">
                  <Twitter className="w-4 h-4 text-white" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary transition-colors flex items-center justify-center cursor-pointer" aria-label="Instagram">
                  <Instagram className="w-4 h-4 text-white" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary transition-colors flex items-center justify-center cursor-pointer" aria-label="YouTube">
                  <Youtube className="w-4 h-4 text-white" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary transition-colors flex items-center justify-center cursor-pointer" aria-label="TikTok">
                  <TikTokIcon className="w-4 h-4 text-white" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary transition-colors flex items-center justify-center cursor-pointer" aria-label="Facebook">
                  <Facebook className="w-4 h-4 text-white" />
                </a>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-8 col-span-1 md:col-span-2">
              <div>
                <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Explore</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-primary transition-colors">Gear Reviews</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Overlanding</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Camping</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Skills</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Company</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <p>&copy; 2025 Prepper Evolution. All rights reserved.</p>
            <p className="font-display tracking-widest uppercase text-xs font-bold text-white/50">Built for the resilient.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}