import { formatPostDate } from './dateFormat.mjs';

const escapeHtml = (value) =>
  String(value).replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]);

const timeTag = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  return `<time datetime="${date.toISOString()}">${escapeHtml(formatPostDate(date))}</time>`;
};

/**
 * @typedef {object} PostCardData
 * @property {string} slug
 * @property {string} title
 * @property {string} description
 * @property {string | Date} pubDate
 * @property {string | Date | null} [updatedDate]
 * @property {string[]} [tags]
 * @property {string} [cover]
 * @property {string} [coverAlt]
 * @property {number} [wordCount]
 * @property {number} [minutesRead]
 * @property {string} [repost]
 * @property {boolean} [isLegacy]
 * @property {boolean} [isRepost]
 * @property {boolean} [isEmbed]
 * @property {boolean} [full]
 */

/** @param {PostCardData} data */
export function postCardHtml({
  slug,
  title,
  description,
  pubDate,
  updatedDate,
  tags,
  cover,
  coverAlt,
  wordCount,
  minutesRead,
  repost,
  isLegacy = false,
  isRepost = false,
  isEmbed = false,
  full = false,
}) {
  const dates = `${isRepost ? 'Reposted on ' : 'Published '}${timeTag(pubDate)}${
    updatedDate ? ` · Updated ${timeTag(updatedDate)}` : ''
  }`;
  const mark = isRepost ? '<span class="repost-mark" aria-hidden="true">⟳</span>' : '';
  const className = [full && 'post-card', 'panel', isLegacy && 'legacy-card', isRepost && 'repost-card']
    .filter(Boolean)
    .join(' ');
  const link = `<a class="post-card-link" href="/blog/${escapeHtml(slug)}/">`;

  if (full) {
    const stats = repost
      ? `Reposted from ${escapeHtml(new URL(repost).hostname)}`
      : `${wordCount} words · ${minutesRead} min read`;

    return [
      `<li class="${className}">`,
      link,
      cover
        ? `<img class="post-card-cover" src="${escapeHtml(cover)}" alt="${escapeHtml(coverAlt ?? '')}" loading="lazy" />`
        : '',
      '<div class="post-card-body">',
      `<h2 class="post-card-title">${mark}${escapeHtml(title)}</h2>`,
      `<p class="meta-line">${dates}</p>`,
      `<p class="meta-line">${stats}</p>`,
      `<p class="post-card-description">${escapeHtml(description)}</p>`,
      tags && tags.length > 0
        ? `<ul class="tag-list">${tags.map((tag) => `<li class="tag">${escapeHtml(tag)}</li>`).join('')}</ul>`
        : '',
      '</div>',
      '</a>',
      '</li>',
    ].join('');
  }

  const kind = repost
    ? `Blog repost · links to ${escapeHtml(new URL(repost).hostname)}`
    : isLegacy
      ? 'Blog post · legacy'
      : 'Blog post';

  return [
    `<li class="${className}">`,
    isEmbed ? '<span class="embed-arrow" aria-hidden="true">↗</span>' : '',
    link,
    isEmbed ? `<p class="embed-kind">${kind}</p>` : '',
    `<h3>${mark}${escapeHtml(title)}</h3>`,
    `<p class="meta-line">${dates}</p>`,
    `<p>${escapeHtml(description)}</p>`,
    '</a>',
    '</li>',
  ].join('');
}
