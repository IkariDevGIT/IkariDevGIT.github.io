const PAGE_MARKDOWN: Record<string, string> = {
  '/': '/index.md',
  '/about/': '/about.md',
  '/projects/': '/projects.md',
  '/resources/': '/resources.md',
  '/resources/legacy/': '/resources/legacy.md',
  '/blog/': '/blog.md',
};

export function markdownAlternate(pathname: string): string | null {
  return PAGE_MARKDOWN[pathname] ?? null;
}
