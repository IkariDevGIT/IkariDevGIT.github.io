export const SITE_TITLE = 'IkariDev';
// shared between /blog-nojs pagination and the JS /blog/ page (blog-data.json's pageSize), keep in sync
export const BLOG_PAGE_SIZE = 6;

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'About', href: '/about/' },
  { label: 'Projects', href: '/projects/' },
  { label: 'Resources', href: '/resources/' },
] as const;
