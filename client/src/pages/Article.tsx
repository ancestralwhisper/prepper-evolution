import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useSEO } from "@/hooks/useSEO";
import { fetchPostBySlug, fetchPosts, decodeHtmlEntities, getPostImage } from "@/lib/wp";
import { ChevronLeft, Calendar, User, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

function transformProTips(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const proTipRegex = /^pro\s*tip\s*:/i;

  const proTipHeader = (subtitle: string) => {
    const subtitleHtml = subtitle ? `<div style="font-size:18px;font-weight:700;color:#F5F0EB;margin-bottom:8px;">${subtitle}</div>` : '';
    return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;"><span style="font-size:16px;">🔥</span><span style="font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#D46A2D;">PRO TIP</span></div>${subtitleHtml}`;
  };

  const wrapInCallout = (headerSubtitle: string, bodyHtml: string) =>
    `<div style="border-left:4px solid #D46A2D;background:#2A2218;padding:24px;border-radius:0 8px 8px 0;margin:32px 0;">${proTipHeader(headerSubtitle)}<div style="color:#F5F0EB;line-height:1.8;">${bodyHtml}</div></div>`;

  doc.querySelectorAll('div.pro-tip').forEach(el => {
    const wrapper = doc.createElement('div');
    wrapper.innerHTML = wrapInCallout('', el.innerHTML);
    el.replaceWith(wrapper.firstElementChild!);
  });

  doc.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
    const text = heading.textContent?.trim() || '';
    if (!proTipRegex.test(text)) return;

    const subtitle = text.replace(proTipRegex, '').trim();
    const bodyParts: string[] = [];
    const toRemove: Element[] = [];
    let sibling = heading.nextElementSibling;
    while (sibling && !/^H[1-6]$/i.test(sibling.tagName)) {
      bodyParts.push(sibling.outerHTML);
      toRemove.push(sibling);
      sibling = sibling.nextElementSibling;
    }

    toRemove.forEach(el => el.remove());
    const wrapper = doc.createElement('div');
    wrapper.innerHTML = wrapInCallout(subtitle, bodyParts.join(''));
    heading.replaceWith(wrapper.firstElementChild!);
  });

  doc.querySelectorAll('blockquote, p').forEach(el => {
    if (el.closest('[data-protip-done]')) return;
    const text = el.textContent?.trim() || '';
    if (!proTipRegex.test(text)) return;

    let bodyHtml = el.innerHTML;
    bodyHtml = bodyHtml.replace(/^(\s*<[^>]*>\s*)*pro\s*tip\s*:\s*/i, '$1');
    bodyHtml = bodyHtml.replace(/^pro\s*tip\s*:\s*/i, '');

    const wrapper = doc.createElement('div');
    wrapper.setAttribute('data-protip-done', '1');
    wrapper.innerHTML = wrapInCallout('', bodyHtml);
    el.replaceWith(wrapper.firstElementChild!);
  });

  return doc.body.innerHTML;
}

function extractHeadings(htmlContent: string) {
  const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
  const headings = Array.from(doc.querySelectorAll('h2, h3')) as HTMLElement[];
  return headings
    .filter(h => !/^pro\s*tip\s*:/i.test(h.textContent?.trim() || ''))
    .map((h) => ({
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
    staleTime: 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * (attemptIndex + 1), 5000),
  });

  const categoryId = article?._embedded?.['wp:term']?.[0]?.[0]?.id;
  const modifiedDate = article?.modified ? new Date(article.modified) : null;
  const publishedDate = article?.date ? new Date(article.date) : null;
  const showUpdated = modifiedDate && publishedDate && (modifiedDate.getTime() - publishedDate.getTime()) > 7 * 24 * 60 * 60 * 1000;

  const { data: relatedPosts } = useQuery({
    queryKey: ["wp-related", categoryId, slug],
    queryFn: () => fetchPosts(1, categoryId),
    enabled: !!categoryId,
    staleTime: 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * (attemptIndex + 1), 5000),
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
    image: featuredImage,
    url: `https://prepperevolution.com/articles/${slug}`
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

  contentHtml = transformProTips(contentHtml);

  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": article.title.rendered,
    "description": cleanExcerpt,
    "image": [featuredImage],
    "datePublished": article.date,
    "dateModified": article.modified || article.date,
    "author": {
      "@type": "Person",
      "name": authorName,
      "url": "https://prepperevolution.com/about"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Prepper Evolution",
      "url": "https://prepperevolution.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://prepperevolution.com/pe-logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://prepperevolution.com/articles/${slug}`
    }
  };

  const related = relatedPosts?.posts.filter(p => p.id !== article.id).slice(0, 3) || [];

  return (
    <article className="min-h-screen bg-background pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      
      <div className="h-[40vh] md:h-[60vh] relative overflow-hidden">
        <img src={featuredImage} alt={article.title.rendered} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute bottom-0 w-full p-6 md:p-12 max-w-[920px] mx-auto left-0 right-0">
          <Button 
            variant="ghost" 
            className="text-primary hover:text-primary/80 hover:bg-transparent px-0 mb-6 font-medium"
            onClick={() => window.history.length > 1 ? window.history.back() : window.location.href = '/articles'}
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 font-medium">
            <span className="text-primary tracking-wider uppercase font-bold">{categoryName}</span>
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {dateFormatted}</span>
            {showUpdated && modifiedDate && (
              <span className="flex items-center gap-1 text-primary/80">Updated {modifiedDate.toLocaleDateString()}</span>
            )}
            <span className="flex items-center gap-1"><User className="w-4 h-4" /> {authorName}</span>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight" dangerouslySetInnerHTML={{ __html: article.title.rendered }} />
        </div>
      </div>

      <div className="max-w-[1150px] mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-10">
        {/* Table of Contents (Desktop Sidebar) */}
        {headings.length > 0 && (
          <div className="hidden lg:block col-span-1">
            <div className="sticky top-24 bg-card border border-border rounded-xl p-6 max-h-[calc(100vh-8rem)] flex flex-col">
              <h3 className="font-display font-bold text-lg mb-4 border-b border-border pb-2 shrink-0">Table of Contents</h3>
              <ul className="space-y-3 text-sm overflow-y-auto overscroll-contain scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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

        <div className="col-span-1">
          <div className="text-xl md:text-2xl font-medium text-foreground/90 border-l-4 border-primary pl-6 mb-12" dangerouslySetInnerHTML={{ __html: article.excerpt.rendered }} />
          <div className="wp-article-content" dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </div>
      </div>

      {/* Related Articles */}
      {related.length > 0 && (
        <div className="max-w-[1150px] mx-auto px-6 mt-24 border-t border-border pt-16">
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
