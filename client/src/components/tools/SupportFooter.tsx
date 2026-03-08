
import { Heart, Beer, ExternalLink } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export default function SupportFooter() {
  return (
    <div className="bg-card border-2 border-primary/30 rounded-lg p-5 sm:p-6 no-print">
      <div className="flex items-center gap-2 mb-3">
        <Heart className="w-5 h-5 text-primary flex-shrink-0" />
        <h4 className="text-sm font-extrabold uppercase tracking-wide">
          Look, No BS:
        </h4>
      </div>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-3 mb-4">
        <p>
          Prepper Evolution tools are <strong className="text-foreground">free. Always will be.</strong> No ads, no email gates, no paywall nonsense.
        </p>
        <p>
          They stay running because when people buy gear they were already getting, they click our affiliate links. A few folks also chip in directly when the site saves them time or makes planning easier.
        </p>
        <p>
          It costs real money to keep this going &mdash; servers, updating trails/permits/FEMA data, field testing, new features, making sure it loads when you&apos;re two bars deep in the sticks.
        </p>
        <p>
          If any calculator, builder, or report helped you pack right, ditch dead weight, or just feel more squared away&hellip; and you&apos;re buying anything from the list anyway &mdash; <strong className="text-foreground">use the affiliate links in your report.</strong> You pay the same price (sometimes less). I get a small cut that keeps this alive. That&apos;s the deal.
        </p>
        <p>
          Not shopping right now? No worries. If it helped and you want to throw a few bucks my way, it&apos;s appreciated. If not, we&apos;re still good.
        </p>
      </div>

      <div className="flex items-center gap-4 mb-3">
        <a
          href="https://buymeacoffee.com/prepperevolution"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("pe_bmac_click", {})}
          className="inline-flex items-center gap-2.5 bg-[#FFDD00] hover:bg-[#FFD000] text-black font-extrabold text-sm uppercase tracking-wide rounded-lg px-5 py-3 transition-colors shadow-sm hover:shadow-md"
        >
          <Beer className="w-5 h-5" />
          Buy Me a Beer
          <ExternalLink className="w-3.5 h-3.5 opacity-60" />
        </a>
        <a
          href="https://buymeacoffee.com/prepperevolution"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("pe_bmac_click", {})}
          className="flex-shrink-0"
        >
          <img
            src="/bmac-qr.png"
            alt="Scan to Buy Me a Beer"
            className="w-28 h-28 rounded-lg border border-border"
          />
        </a>
      </div>

      <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
        Thanks for using the tools. Stay sharp out there.
      </p>
      <p className="text-sm font-bold text-foreground mt-1">
        &mdash; Mike &amp; The Crew
      </p>
    </div>
  );
}
