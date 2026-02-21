import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useSEO } from "@/hooks/useSEO";
import { fetchPostBySlug, fetchPosts, decodeHtmlEntities, getPostImage } from "@/lib/wp";
import { ChevronLeft, Calendar, User, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { useEffect, useState } from "react";

// Helper to parse TOC from content
function extractHeadings(htmlContent: string) {
  const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
  const headings = Array.from(doc.querySelectorAll('h2, h3')) as HTMLElement[];
  return headings.map((h) => ({
    id: h.id || h.textContent?.replace(/\s+/g, '-').toLowerCase() || '',
    text: h.textContent || '',
    level: h.tagName.toLowerCase()
  }));
}

export default function Article() {
  const { slug } = useParams();
  
  const { data: article, isLoading } = useQuery({
    queryKey: ["wp-post", slug],
    queryFn: () => fetchPostBySlug(slug!),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  const categoryId = article?._embedded?.['wp:term']?.[0]?.[0]?.id;
  
  const { data: relatedPosts } = useQuery({
    queryKey: ["wp-related", categoryId, slug],
    queryFn: () => fetchPosts(1, categoryId),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
  });

  const categoryName = decodeHtmlEntities(article?._embedded?.['wp:term']?.[0]?.[0]?.name || "Uncategorized");
  const featuredImage = article ? getPostImage(article) : "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09";
  const authorName = article?._embedded?.['author']?.[0]?.name || "Prepper Evolution Team";
  const dateFormatted = article ? new Date(article.date).toLocaleDateString() : "";
  
  // Strip HTML from excerpt for meta tags
  const cleanExcerpt = article?.excerpt.rendered.replace(/<[^>]*>?/gm, '') || "";

  useSEO({
    title: article?.title.rendered || "Loading Article...",
    description: cleanExcerpt || "Read our latest survival and gear strategies.",
    type: "article",
    image: featuredImage
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading intel...</div>;
  }

  if (!article) {
    return <div className="min-h-screen flex items-center justify-center">Article not found in database.</div>;
  }

  // Set up TOC
  const headings = extractHeadings(article.content.rendered);
  // Add IDs to the HTML content for TOC links to work
  let contentHtml = article.content.rendered;
  headings.forEach(h => {
    contentHtml = contentHtml.replace(`>${h.text}</${h.level}>`, ` id="${h.id}">${h.text}</${h.level}>`);
  });

  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title.rendered,
    "image": [featuredImage],
    "datePublished": article.date,
    "author": {
      "@type": "Person",
      "name": authorName
    }
  };

  const related = relatedPosts?.posts.filter(p => p.id !== article.id).slice(0, 3) || [];

  return (
    <article className="min-h-screen bg-background pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      
      <div className="h-[40vh] md:h-[60vh] relative overflow-hidden">
        <img src={featuredImage} alt={article.title.rendered} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute bottom-0 w-full p-6 md:p-12 max-w-[800px] mx-auto left-0 right-0">
          <Link href="/articles" className="inline-flex items-center text-primary hover:text-primary/80 mb-6 font-medium">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Articles
          </Link>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 font-medium">
            <span className="text-primary tracking-wider uppercase font-bold">{categoryName}</span>
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {dateFormatted}</span>
            <span className="flex items-center gap-1"><User className="w-4 h-4" /> {authorName}</span>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight" dangerouslySetInnerHTML={{ __html: article.title.rendered }} />
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Table of Contents (Desktop Sidebar) */}
        {headings.length > 0 && (
          <div className="hidden lg:block col-span-1">
            <div className="sticky top-24 bg-card border border-border rounded-xl p-6">
              <h3 className="font-display font-bold text-lg mb-4 border-b border-border pb-2">Table of Contents</h3>
              <ul className="space-y-3 text-sm">
                {headings.map(h => (
                  <li key={h.id} className={h.level === 'h3' ? 'pl-4' : ''}>
                    <a href={`#${h.id}`} className="text-muted-foreground hover:text-primary transition-colors block leading-tight">
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="col-span-1 lg:col-span-3 prose prose-invert prose-lg md:prose-xl prose-p:text-muted-foreground prose-headings:font-display prose-headings:font-bold prose-a:text-primary hover:prose-a:text-primary/80 prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:p-4 prose-blockquote:rounded-r-lg prose-img:rounded-xl">
          <div className="text-xl md:text-2xl font-medium text-foreground/90 border-l-4 border-primary pl-6 mb-12" dangerouslySetInnerHTML={{ __html: article.excerpt.rendered }} />
          <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </div>
      </div>

      {/* Related Articles */}
      {related.length > 0 && (
        <div className="max-w-[1000px] mx-auto px-6 mt-24 border-t border-border pt-16">
          <h2 className="text-3xl font-display font-bold mb-8">Related Intel</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map(post => {
              const catName = decodeHtmlEntities(post._embedded?.['wp:term']?.[0]?.[0]?.name || "Uncategorized");
              const relImg = getPostImage(post);
              return (
                <Link key={post.id} href={`/articles/${post.slug}`} className="group block">
                  <div className="bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:border-primary/50 transition-colors h-full flex flex-col">
                    <div className="aspect-video relative overflow-hidden bg-muted">
                      <img src={relImg} alt={post.title.rendered} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-display font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                      <span className="inline-flex items-center text-primary text-sm font-medium mt-auto pt-2">
                        Read more <ChevronRight className="w-4 h-4 ml-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </article>
  );
}
