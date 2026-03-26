import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  image?: string;
}

export function useSEO({ title, description, url, type = 'website', image }: SEOProps) {
  useEffect(() => {
    // Set Title
    document.title = `${title} | Prepper Evolution`;
    
    // Set Meta Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);
    
    // Set Open Graph tags
    const setOgTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };
    
    setOgTag('og:title', `${title} | Prepper Evolution`);
    setOgTag('og:description', description);
    setOgTag('og:type', type);
    if (url) setOgTag('og:url', url);
    if (image) setOgTag('og:image', image);

    // Set canonical tag
    if (url) {
      let canonicalTag = document.querySelector('link[rel="canonical"]');
      if (!canonicalTag) {
        canonicalTag = document.createElement('link');
        canonicalTag.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalTag);
      }
      canonicalTag.setAttribute('href', url);
    }

    return () => {
      // Revert to defaults on unmount if needed, though usually overwriting is fine
    };
  }, [title, description, url, type, image]);
}
