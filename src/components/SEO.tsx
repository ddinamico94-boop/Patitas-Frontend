import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}

export default function SEO({
  title,
  description,
  path = '/',
  image = 'https://www.patitastucuman.com/og-image.png',
  noIndex = false,
}: SEOProps) {
  useEffect(() => {
    document.title = title;

    const setMeta = (
      selector: string,
      attribute: string,
      value: string
    ) => {
      let element =
        document.querySelector<HTMLMetaElement>(
          selector
        );

      if (!element) {
        element =
          document.createElement('meta');

        const propertyMatch =
          selector.match(
            /property="([^"]+)"/
          );

        const nameMatch =
          selector.match(
            /name="([^"]+)"/
          );

        if (propertyMatch) {
          element.setAttribute(
            'property',
            propertyMatch[1]
          );
        }

        if (nameMatch) {
          element.setAttribute(
            'name',
            nameMatch[1]
          );
        }

        document.head.appendChild(
          element
        );
      }

      element.setAttribute(
        attribute,
        value
      );
    };

    const url =
      `https://www.patitastucuman.com${path}`;

    setMeta(
      'meta[name="description"]',
      'content',
      description
    );

    setMeta(
      'meta[name="robots"]',
      'content',
      noIndex
        ? 'noindex, nofollow'
        : 'index, follow'
    );

    setMeta(
      'meta[property="og:title"]',
      'content',
      title
    );

    setMeta(
      'meta[property="og:description"]',
      'content',
      description
    );

    setMeta(
      'meta[property="og:url"]',
      'content',
      url
    );

    setMeta(
      'meta[property="og:image"]',
      'content',
      image
    );

    setMeta(
      'meta[name="twitter:title"]',
      'content',
      title
    );

    setMeta(
      'meta[name="twitter:description"]',
      'content',
      description
    );

    setMeta(
      'meta[name="twitter:image"]',
      'content',
      image
    );

    let canonical =
      document.querySelector<HTMLLinkElement>(
        'link[rel="canonical"]'
      );

    if (!canonical) {
      canonical =
        document.createElement('link');

      canonical.rel = 'canonical';

      document.head.appendChild(
        canonical
      );
    }

    canonical.href = url;
  }, [
    title,
    description,
    path,
    image,
    noIndex,
  ]);

  return null;
}