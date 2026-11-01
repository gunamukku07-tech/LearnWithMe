import React, { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  path?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  author?: string;
  keywords?: string[];
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  path = '',
  type = 'website',
  publishedTime,
  author = 'LearnWithMe CS Journal',
  keywords = [],
}) => {
  useEffect(() => {
    const fullTitle = title.includes('LearnWithMe')
      ? title
      : `${title} — LearnWithMe`;
    document.title = fullTitle;

    const setMetaTag = (selector: string, attr: 'name' | 'property', key: string, content: string) => {
      let element = document.querySelector(selector) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, key);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    const canonicalUrl = `${window.location.origin}${path || window.location.pathname}`;

    setMetaTag('meta[name="description"]', 'name', 'description', description);
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', type);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);

    if (keywords.length > 0) {
      setMetaTag('meta[name="keywords"]', 'name', 'keywords', keywords.join(', '));
    }

    // Dynamic JSON-LD Schema.org Structured Data
    const scriptId = 'learnwithme-jsonld';
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }

    const structuredData =
      type === 'article'
        ? {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: title,
            description,
            url: canonicalUrl,
            datePublished: publishedTime || new Date().toISOString().split('T')[0],
            author: {
              '@type': 'Person',
              name: author,
            },
            publisher: {
              '@type': 'Organization',
              name: 'LearnWithMe',
            },
          }
        : {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'LearnWithMe',
            alternateName: 'Learn. Create. Share. Grow.',
            url: canonicalUrl,
            description,
          };

    scriptEl.textContent = JSON.stringify(structuredData);
  }, [title, description, path, type, publishedTime, author, keywords]);

  return null;
};
