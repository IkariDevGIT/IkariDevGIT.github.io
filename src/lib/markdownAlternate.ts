const PAGE_MARKDOWN: Record<string, string> = {
  '/': '/index.md',
  '/about/': '/about.md',
  '/projects/': '/projects.md',
  '/resources/': '/resources.md',
  '/resources/inactive/': '/resources/inactive.md',
  '/blog/': '/blog.md',
};

export function markdownAlternate(pathname: string): string | null {
  return PAGE_MARKDOWN[pathname] ?? null;
}
