import { Link } from "wouter";
import { ArrowRight, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Feature {
  text: string;
  highlight?: string;
}

interface FeatureShowcaseProps {
  label: string;
  title: string;
  titleAccent: string;
  description: string;
  features: Feature[];
  imageSrc: string;
  imageAlt: string;
  cta: string;
  href: string;
  reverse?: boolean;
  variant?: "default" | "emerald" | "red" | "blue";
}

const colors = {
  default: {
    label: "text-primary",
    accent: "text-primary",
    checkBg: "bg-primary/10",
    check: "text-primary",
    btnBg: "bg-primary/10 hover:bg-primary/20",
    btnText: "text-primary",
  },
  emerald: {
    label: "text-emerald-500",
    accent: "text-emerald-500",
    checkBg: "bg-emerald-500/10",
    check: "text-emerald-500",
    btnBg: "bg-emerald-500/10 hover:bg-emerald-500/20",
    btnText: "text-emerald-500",
  },
  red: {
    label: "text-red-500",
    accent: "text-red-500",
    checkBg: "bg-red-500/10",
    check: "text-red-500",
    btnBg: "bg-red-500/10 hover:bg-red-500/20",
    btnText: "text-red-500",
  },
  blue: {
    label: "text-blue-500",
    accent: "text-blue-500",
    checkBg: "bg-blue-500/10",
    check: "text-blue-500",
    btnBg: "bg-blue-500/10 hover:bg-blue-500/20",
    btnText: "text-blue-500",
  },
};

export default function FeatureShowcase({
  label,
  title,
  titleAccent,
  description,
  features,
  imageSrc,
  imageAlt,
  cta,
  href,
  reverse = false,
  variant = "default",
}: FeatureShowcaseProps) {
  const c = colors[variant];
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="py-16 sm:py-20 border-t border-border">
      <div
        className={`flex flex-col ${
          reverse ? "lg:flex-row-reverse" : "lg:flex-row"
        } gap-10 lg:gap-16 items-center`}
      >
        {/* Image Side */}
        <div className="w-full lg:w-1/2">
          <div className="relative rounded-xl overflow-hidden border border-border bg-muted shadow-2xl">
            <img
              src={imageSrc}
              alt={imageAlt}
              width={1200}
              height={800}
              className="w-full h-auto"
              loading="lazy"
            />
          </div>
        </div>

        {/* Text Side */}
        <div className="w-full lg:w-1/2">
          <p
            className={`${c.label} text-sm font-bold uppercase tracking-widest mb-3`}
          >
            {label}
          </p>
          <h2
            ref={titleRef}
            className="text-2xl sm:text-3xl font-extrabold mb-4"
            style={{
              filter: revealed ? "blur(0px)" : "blur(8px)",
              opacity: revealed ? 1 : 0.4,
              transform: revealed ? "translateY(0)" : "translateY(8px)",
              transition: "filter 0.8s ease-out, opacity 0.8s ease-out, transform 0.8s ease-out",
            }}
          >
            {title} <span className={c.accent}>{titleAccent}</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            {description}
          </p>

          <ul className="space-y-3 mb-8">
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-3">
                <div
                  className={`w-5 h-5 rounded-full ${c.checkBg} flex items-center justify-center flex-shrink-0 mt-0.5`}
                >
                  <Check className={`w-3 h-3 ${c.check}`} />
                </div>
                <span className="text-sm text-muted-foreground leading-relaxed">
                  {f.highlight && (
                    <strong className="text-foreground">
                      {f.highlight}{" "}
                    </strong>
                  )}
                  {f.text}
                </span>
              </li>
            ))}
          </ul>

          <Link
            href={href}
            className={`inline-flex items-center gap-2 ${c.btnBg} ${c.btnText} font-bold text-sm px-5 py-2.5 rounded-lg transition-colors uppercase tracking-wide`}
          >
            {cta}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
