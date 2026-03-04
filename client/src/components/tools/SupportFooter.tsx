
import { useEffect, useRef } from "react";
import { Heart } from "lucide-react";

export default function SupportFooter() {
  const bmcRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bmcRef.current) return;
    // Load Buy Me a Coffee button script
    const script = document.createElement("script");
    script.src = "https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js";
    script.setAttribute("data-name", "bmc-button");
    script.setAttribute("data-slug", "prepperevolution");
    script.setAttribute("data-color", "#e7a108");
    script.setAttribute("data-emoji", "🍺");
    script.setAttribute("data-font", "Inter");
    script.setAttribute("data-text", "Buy me a beer");
    script.setAttribute("data-outline-color", "#000000");
    script.setAttribute("data-font-color", "#000000");
    script.setAttribute("data-coffee-color", "#FFDD00");
    bmcRef.current.appendChild(script);

    return () => {
      // Cleanup: remove the script and any generated button
      if (bmcRef.current) {
        bmcRef.current.innerHTML = "";
      }
    };
  }, []);

  return (
    <div className="bg-muted border border-border rounded-lg p-4 no-print">
      <div className="flex items-center gap-2 mb-3">
        <Heart className="w-4 h-4 text-primary flex-shrink-0" />
        <h4 className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          Keep These Tools Free
        </h4>
      </div>
      <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
        Prepper Evolution tools are <strong className="text-foreground">free forever</strong>.
        The whole site runs purely on affiliate commissions from gear links and the occasional
        direct support from people who get real value out of it. No ads, no forced emails,
        no upsells &mdash; just solid, practical tools built by folks who prep and overland themselves.
      </p>
      <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
        If any part of your build, config, kit plan, or report helped you prep smarter, stay safer,
        avoid overload risks, or dial in your setup &mdash; the easiest way to help keep everything
        free for the next person is to <strong className="text-foreground">grab any gear, parts, or
        supplies you were already planning through the affiliate links</strong> in your report,
        shopping list, or gear page.
      </p>
      <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
        If you&rsquo;re not shopping for anything but want to help out:
      </p>
      <div ref={bmcRef} className="mb-3" />
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Thanks for helping keep it going <span className="text-red-500">&hearts;</span>
      </p>
    </div>
  );
}
