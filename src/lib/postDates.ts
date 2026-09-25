export interface ResolvedPostDates {
  pubDate: Date;
  /** only set if the post changed after it was published */
  updatedDate?: Date;
}

interface PostFrontmatter {
  pubDate?: Date;
  updatedDate?: Date;
}

interface GitFrontmatter {
  gitCreated?: string | null;
  gitUpdated?: string | null;
}

// prefers frontmatter (needed for old-site posts, their history predates this repo),
// falls back to git history from remark-git-dates.mjs. single-commit files get identical
// gitCreated/gitUpdated, so updatedDate collapses to pubDate, filtered out below
export function resolvePostDates(
  data: PostFrontmatter,
  remarkPluginFrontmatter: GitFrontmatter,
): ResolvedPostDates {
  const gitCreated = remarkPluginFrontmatter.gitCreated
    ? new Date(remarkPluginFrontmatter.gitCreated)
    : undefined;
  const gitUpdated = remarkPluginFrontmatter.gitUpdated
    ? new Date(remarkPluginFrontmatter.gitUpdated)
    : undefined;

  const pubDate = data.pubDate ?? gitCreated ?? gitUpdated ?? new Date();
  const gitHasUpdate = gitCreated && gitUpdated && gitUpdated.getTime() > gitCreated.getTime();
  const updatedDate = data.updatedDate ?? (gitHasUpdate ? gitUpdated : undefined);

  // only show "updated" when it's strictly after publish
  const hasRealUpdate = updatedDate !== undefined && updatedDate.getTime() > pubDate.getTime();

  return { pubDate, updatedDate: hasRealUpdate ? updatedDate : undefined };
}
