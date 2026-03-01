import { Link } from "wouter";
import { Twitter, Instagram, Youtube, Facebook } from "lucide-react";

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.12-3.44-3.17-3.61-5.66-.21-3.11 1.73-6.19 4.63-7.14.39-.12.81-.22 1.22-.27.06.6.01 1.2.03 1.8.03 1.13.06 2.27.04 3.4-.38.07-.76.15-1.13.29-1.2.4-2.14 1.4-2.31 2.66-.21 1.34.34 2.76 1.42 3.53 1.09.77 2.65.91 3.93.3 1.25-.56 2.1-1.78 2.23-3.19.16-3.83.07-7.67.1-11.51.01-2.42-.02-4.83.01-7.25z"/>
  </svg>
);

export default function SiteFooter() {
  return (
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
                <li><Link href="/about" className="hover:text-primary transition-colors" data-testid="link-footer-about">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors" data-testid="link-footer-contact">Contact</Link></li>
                <li><Link href="/privacy-policy" className="hover:text-primary transition-colors" data-testid="link-footer-privacy">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary transition-colors" data-testid="link-footer-terms">Terms of Service</Link></li>
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
  );
}