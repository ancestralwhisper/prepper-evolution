import { useParams } from "wouter";
import { useSEO } from "@/hooks/useSEO";
import { mockArticles } from "@/content/articles";
import { ChevronLeft, Calendar, User } from "lucide-react";
import { Link } from "wouter";

export default function Article() {
  const { slug } = useParams();
  const article = mockArticles.find(a => a.slug === slug);

  useSEO({
    title: article?.title || "Article Not Found",
    description: article?.excerpt || "Read our latest survival and gear strategies.",
    type: "article",
    image: article?.imageUrl
  });

  if (!article) {
    return <div className="min-h-screen flex items-center justify-center">Article not found. Please add content to app/content/articles.ts.</div>;
  }

  // Generate Schema Markup
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "image": [article.imageUrl],
    "datePublished": article.date,
    "author": {
      "@type": "Person",
      "name": article.author
    }
  };

  return (
    <article className="min-h-screen bg-background pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      
      <div className="h-[40vh] md:h-[60vh] relative overflow-hidden">
        <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute bottom-0 w-full p-6 md:p-12 max-w-[800px] mx-auto left-0 right-0">
          <Link href="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-6 font-medium">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Home
          </Link>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 font-medium">
            <span className="text-primary tracking-wider uppercase font-bold">{article.category}</span>
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {article.date}</span>
            <span className="flex items-center gap-1"><User className="w-4 h-4" /> {article.author}</span>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight">{article.title}</h1>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-6 mt-12 prose prose-invert prose-lg md:prose-xl prose-p:text-muted-foreground prose-headings:font-display prose-headings:font-bold prose-a:text-primary hover:prose-a:text-primary/80">
        <p className="text-xl md:text-2xl font-medium text-foreground/90 border-l-4 border-primary pl-6 mb-12">
          {article.excerpt}
        </p>
        <div dangerouslySetInnerHTML={{ __html: article.content }} />
      </div>
    </article>
  );
}
