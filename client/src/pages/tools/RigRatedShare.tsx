
import { useState, useMemo } from "react";
import { Mail, MessageCircle, Check, Link2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface RigRatedShareProps {
  url: string;
  machineName: string;         // e.g. "RZR XP 1000"
  stockPayloadLbs: number;
  effectivePayloadLbs: number;
  gainLbs: number;
  suspensionBrand?: string;    // e.g. "Fox"
  topMod?: string;             // e.g. "Fox 3.0 IBP"
}

const TWEET_TEMPLATES = [
  (p: RigRatedShareProps) =>
    `Stock ${p.machineName} payload: ${p.stockPayloadLbs} lbs. After ${p.topMod || "upgrades"}? ${p.effectivePayloadLbs} lbs real-world. No sag, no BS. Check it: ${p.url} #UTVLife #TrailMath`,
  (p: RigRatedShareProps) =>
    `My rig went from "barely hauls beer" to "hauls beer AND the cooler." Free tool: ${p.url} Who else is modding wrong? #SideBySide`,
  (p: RigRatedShareProps) =>
    `Before: ${p.stockPayloadLbs} lbs payload. After ${p.topMod || "mods"}... ${p.effectivePayloadLbs} lbs effective. Shocks earned their keep. ${p.url} #OffroadMods`,
  (p: RigRatedShareProps) =>
    `Just proved my ${p.machineName} can carry beer AND buddies. +${p.gainLbs} lbs thanks to ${p.suspensionBrand || "upgraded shocks"}. Stock sticker lied. ${p.url} #UTVLife`,
  (p: RigRatedShareProps) =>
    `Tired of guessing if that roof rack kills your payload? This free tool says you gained ${p.gainLbs} lbs back. ${p.url} #UTVAddicts`,
];

const TAG_LINES = [
  "What'd you add?",
  "How heavy's your winch?",
  "Who needs this?",
  "Tag your trail crew",
];

export default function RigRatedShare(props: RigRatedShareProps) {
  const [copied, setCopied] = useState(false);

  // Pick a random template once per mount
  const tweetText = useMemo(() => {
    const idx = Math.floor(Math.random() * TWEET_TEMPLATES.length);
    const tagIdx = Math.floor(Math.random() * TAG_LINES.length);
    return TWEET_TEMPLATES[idx](props) + " " + TAG_LINES[tagIdx];
  }, [props.machineName, props.stockPayloadLbs, props.effectivePayloadLbs]);

  const genericShare = `My ${props.machineName} payload breakdown — stock vs. modded. Free UTV calculator, no sign-up: ${props.url}`;

  const handleShareClick = (platform: string) => {
    trackEvent("pe_share_clicked", { tool: "rigrated", platform });
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(props.url);
    } catch {
      const input = document.createElement("input");
      input.value = props.url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    handleShareClick("copy_link");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Share Your Build</h4>
      <p className="text-xs text-muted-foreground mb-3">Tag a buddy who needs this before they buy junk shocks</p>
      <div className="grid grid-cols-6 gap-2">
        {/* X / Twitter — custom tweet */}
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleShareClick("x")}
          className="flex flex-col items-center gap-1.5 p-2 rounded-lg border border-border hover:border-[#000000] hover:bg-[#000000]/5 transition-all group"
          aria-label="Share on X"
        >
          <span className="w-8 h-8 rounded-full bg-[#000000] flex items-center justify-center text-white">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </span>
          <span className="text-[10px] font-semibold text-muted-foreground group-hover:text-foreground">X</span>
        </a>

        {/* Facebook */}
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(props.url)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleShareClick("facebook")}
          className="flex flex-col items-center gap-1.5 p-2 rounded-lg border border-border hover:border-[#1877F2] hover:bg-[#1877F2]/5 transition-all group"
          aria-label="Share on Facebook"
        >
          <span className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center text-white">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </span>
          <span className="text-[10px] font-semibold text-muted-foreground group-hover:text-foreground">Facebook</span>
        </a>

        {/* Reddit */}
        <a
          href={`https://www.reddit.com/submit?url=${encodeURIComponent(props.url)}&title=${encodeURIComponent(genericShare)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleShareClick("reddit")}
          className="flex flex-col items-center gap-1.5 p-2 rounded-lg border border-border hover:border-[#FF4500] hover:bg-[#FF4500]/5 transition-all group"
          aria-label="Share on Reddit"
        >
          <span className="w-8 h-8 rounded-full bg-[#FF4500] flex items-center justify-center text-white">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 0-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
          </span>
          <span className="text-[10px] font-semibold text-muted-foreground group-hover:text-foreground">Reddit</span>
        </a>

        {/* SMS */}
        <a
          href={`sms:?body=${encodeURIComponent(genericShare)}`}
          onClick={() => handleShareClick("sms")}
          className="flex flex-col items-center gap-1.5 p-2 rounded-lg border border-border hover:border-[#25D366] hover:bg-[#25D366]/5 transition-all group"
          aria-label="Share via SMS"
        >
          <span className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center text-white">
            <MessageCircle className="w-4 h-4" />
          </span>
          <span className="text-[10px] font-semibold text-muted-foreground group-hover:text-foreground">SMS</span>
        </a>

        {/* Email */}
        <a
          href={`mailto:?subject=${encodeURIComponent(`My ${props.machineName} Payload Breakdown — RigRated`)}&body=${encodeURIComponent(genericShare)}`}
          onClick={() => handleShareClick("email")}
          className="flex flex-col items-center gap-1.5 p-2 rounded-lg border border-border hover:border-[#6366F1] hover:bg-[#6366F1]/5 transition-all group"
          aria-label="Share via Email"
        >
          <span className="w-8 h-8 rounded-full bg-[#6366F1] flex items-center justify-center text-white">
            <Mail className="w-4 h-4" />
          </span>
          <span className="text-[10px] font-semibold text-muted-foreground group-hover:text-foreground">Email</span>
        </a>

        {/* Copy Link */}
        <button
          onClick={copyLink}
          className="flex flex-col items-center gap-1.5 p-2 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all group"
          aria-label="Copy link"
        >
          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors ${copied ? "bg-green-500" : "bg-muted/60"}`}>
            {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
          </span>
          <span className="text-[10px] font-semibold text-muted-foreground group-hover:text-foreground">
            {copied ? "Copied!" : "Copy"}
          </span>
        </button>
      </div>
    </div>
  );
}
