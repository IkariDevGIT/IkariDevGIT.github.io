import { formatPostDate } from './dateFormat.mjs';

const escapeHtml = (value) =>
  String(value).replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]);

export function postCardHtml({
  slug,
  title,
  description,
  pubDate,
  isLegacy = false,
  isRepost = false,
  isEmbed = false,
  repost = null,
}) {
  const date = pubDate instanceof Date ? pubDate : new Date(pubDate);
  const className = ['panel', isLegacy && 'legacy-card', isRepost && 'repost-card'].filter(Boolean).join(' ');
  const mark = isRepost ? '<span class="repost-mark" aria-hidden="true">⟳</span>' : '';
  const kind =
    isRepost && repost
      ? `Blog repost · links to ${escapeHtml(new URL(repost).hostname)}`
      : isLegacy
        ? 'Blog post · legacy'
        : 'Blog post';

  return [
    `<li class="${className}">`,
    isEmbed ? '<span class="embed-arrow" aria-hidden="true">↗</span>' : '',
    `<a class="post-card-link" href="/blog/${escapeHtml(slug)}/">`,
    isEmbed ? `<p class="embed-kind">${kind}</p>` : '',
    `<h3>${mark}${escapeHtml(title)}</h3>`,
    `<p class="meta-line"><time datetime="${date.toISOString()}">${escapeHtml(formatPostDate(date))}</time></p>`,
    `<p>${escapeHtml(description)}</p>`,
    '</a>',
    '</li>',
  ].join('');
}
