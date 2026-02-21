import { useParams } from "wouter";
import { useSEO } from "@/hooks/useSEO";
import { mockComparisons } from "@/content/comparisons";
import { ChevronLeft, Trophy } from "lucide-react";
import { Link } from "wouter";

export default function Comparison() {
  const { slug } = useParams();
  const comparison = mockComparisons.find(c => c.slug === slug);

  useSEO({
    title: comparison?.title || "Comparison Guide Not Found",
    description: comparison?.description || "In-depth gear comparisons and head-to-head reviews.",
    type: "article"
  });

  if (!comparison) {
    return <div className="min-h-screen flex items-center justify-center">Comparison guide not found. Please add content to app/content/comparisons.ts.</div>;
  }

  return (
    <article className="min-h-screen bg-background pt-24 pb-20">
      <div className="max-w-[800px] mx-auto px-4 md:px-6">
        <Link href="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-8 font-medium">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Guides
        </Link>
        
        <span className="text-primary font-bold tracking-wider uppercase text-sm mb-4 block">Head-to-Head Comparison</span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 leading-tight">{comparison.title}</h1>
        <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
          {comparison.description}
        </p>
        
        <div className="bg-primary/10 border border-primary/30 rounded-2xl p-8 mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-primary" />
            <h2 className="text-2xl font-display font-bold text-primary">The Verdict</h2>
          </div>
          <p className="text-lg font-medium">
            {comparison.verdict}
          </p>
        </div>

        <div className="prose prose-invert prose-lg max-w-none">
          <h2>Products Compared</h2>
          <ul>
            {comparison.products.map(p => (
              <li key={p}>
                <Link href={`/products/${p}`} className="text-primary hover:underline">{p.replace(/-/g, ' ')}</Link>
              </li>
            ))}
          </ul>
          <p>
            <em>Please feed the 8 comparison guides researched by ContentForger into `client/src/content/comparisons.ts` to see full content here.</em>
          </p>
        </div>
      </div>
    </article>
  );
}
