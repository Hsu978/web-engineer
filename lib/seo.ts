import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from './site';

type BuildMetaInput = {
  title: string;
  description: string;
  path: string;
};

export function buildPageMetadata({ title, description, path }: BuildMetaInput): Metadata {
  const canonical = `${SITE_URL}${path}`;

  return {
    title,
    description,
    alternates: {
      canonical
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: 'zh_TW',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description
    }
  };
}
