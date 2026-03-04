
import { Heart, Beer, ExternalLink } from "lucide-react";

export default function SupportFooter() {
  return (
    <div className="bg-card border-2 border-primary/30 rounded-lg p-5 sm:p-6 no-print">
      <div className="flex items-center gap-2 mb-3">
        <Heart className="w-5 h-5 text-primary flex-shrink-0" />
        <h4 className="text-sm font-extrabold uppercase tracking-wide">
          Keep These Tools Free
        </h4>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
        Every tool on Prepper Evolution is <strong className="text-foreground">free forever</strong> &mdash;
        no ads, no forced emails, no upsells. The site runs on affiliate commissions from gear
        links and direct support from people who get real value out of it.
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        If these tools helped you prep smarter or dial in your setup, the easiest way to keep
        them free is to <strong className="text-foreground">shop through the affiliate links</strong> in
        your report. Or if you just want to say thanks:
      </p>

      <a
        href="https://buymeacoffee.com/prepperevolution"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2.5 bg-[#FFDD00] hover:bg-[#FFD000] text-black font-extrabold text-sm uppercase tracking-wide rounded-lg px-5 py-3 transition-colors shadow-sm hover:shadow-md mb-3"
      >
        <Beer className="w-5 h-5" />
        Buy Me a Beer
        <ExternalLink className="w-3.5 h-3.5 opacity-60" />
      </a>

      <p className="text-xs text-muted-foreground mt-3">
        Thanks for helping keep it going <span className="text-red-500">&hearts;</span>
      </p>
    </div>
  );
}
