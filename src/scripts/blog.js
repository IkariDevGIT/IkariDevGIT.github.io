import { postCardHtml } from '../lib/postCard.mjs';

function normalize(str) {
  return str
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim();
}

// exact, then partial, then fuzzy (in-order subsequence) match
function titleMatches(title, query) {
  const t = normalize(title);
  const q = normalize(query);
  if (!q) return true;
  if (t === q) return true;
  if (t.includes(q)) return true;

  let qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

// required tags must all be present, excluded tags must all be absent
function tagsMatch(postTags, required, excluded) {
  for (const tag of required) {
    if (!postTags.includes(tag)) return false;
  }
  for (const tag of excluded) {
    if (postTags.includes(tag)) return false;
  }
  return true;
}

function sortPosts(posts, sort) {
  const arr = posts.slice();
  if (sort === 'oldest') {
    return arr.sort((a, b) => Date.parse(a.pubDate) - Date.parse(b.pubDate));
  }
  if (sort === 'latest-update') {
    return arr.sort(
      (a, b) => Date.parse(b.updatedDate ?? b.pubDate) - Date.parse(a.updatedDate ?? a.pubDate),
    );
  }
  return arr.sort((a, b) => Date.parse(b.pubDate) - Date.parse(a.pubDate));
}

function cardHtml(post) {
  return postCardHtml({
    ...post,
    isLegacy: post.tags.includes('legacy'),
    isRepost: post.tags.includes('repost'),
    full: true,
  });
}

function fallBackToStatic() {
  document.documentElement.classList.remove('js');
}

async function main() {
  const searchInput = document.getElementById('post-search-input');
  const sortButtons = document.querySelectorAll('#sort-buttons button');
  const sortButtonGroup = document.getElementById('sort-buttons');
  const tagFilter = document.getElementById('tag-filter');
  const tagFilterChips = document.getElementById('tag-filter-chips');
  const postList = document.getElementById('post-list');
  const pagination = document.getElementById('pagination');
  const prevButton = document.getElementById('prev-page');
  const nextButton = document.getElementById('next-page');
  const pageIndicator = document.getElementById('page-indicator');
  const status = document.getElementById('blog-status');

  if (
    !searchInput ||
    !sortButtonGroup ||
    !tagFilter ||
    !tagFilterChips ||
    !postList ||
    !pagination ||
    !prevButton ||
    !nextButton ||
    !pageIndicator ||
    !status
  ) {
    fallBackToStatic();
    return;
  }

  status.hidden = false;
  sortButtonGroup.hidden = false;

  let allPosts = [];
  let pageSize = 6;

  const SORT_MODES = ['newest', 'oldest', 'latest-update'];
  const urlParams = new URLSearchParams(location.search);
  const pathParts = location.pathname.replace(/^\/blog\/?/, '').replace(/\/$/, '').split('/').filter(Boolean);
  const pathSort = SORT_MODES.includes(pathParts[0]) ? pathParts[0] : null;
  const pathPage = parseInt(pathParts[pathSort ? 1 : 0], 10);

  const state = {
    sort: SORT_MODES.includes(urlParams.get('sort')) ? urlParams.get('sort') : (pathSort ?? 'newest'),
    query: urlParams.get('q') ?? '',
    page: Math.max(1, parseInt(urlParams.get('page'), 10) || pathPage || 1),
    /** @type {Set<string>} */
    requiredTags: new Set((urlParams.get('tag') ?? '').split(',').filter(Boolean)),
    /** @type {Set<string>} */
    excludedTags: new Set((urlParams.get('extag') ?? '').split(',').filter(Boolean)),
  };

  function syncUrl() {
    const params = new URLSearchParams();
    if (state.sort !== 'newest') params.set('sort', state.sort);
    if (state.page !== 1) params.set('page', String(state.page));
    if (state.query) params.set('q', state.query);
    if (state.requiredTags.size > 0) params.set('tag', [...state.requiredTags].join(','));
    if (state.excludedTags.size > 0) params.set('extag', [...state.excludedTags].join(','));
    const qs = params.toString();
    history.replaceState(null, '', qs ? `/blog/?${qs}` : '/blog/');
  }

  function currentList() {
    const sorted = sortPosts(allPosts, state.sort);
    return sorted.filter(
      (post) =>
        titleMatches(post.title, state.query) &&
        tagsMatch(post.tags, state.requiredTags, state.excludedTags),
    );
  }

  function render() {
    const list = currentList();
    const lastPage = Math.max(1, Math.ceil(list.length / pageSize));
    state.page = Math.min(state.page, lastPage);

    const start = (state.page - 1) * pageSize;
    const pageItems = list.slice(start, start + pageSize);

    postList.innerHTML = pageItems.map(cardHtml).join('');
    postList.removeAttribute('data-static');

    const filtering = state.query || state.requiredTags.size > 0 || state.excludedTags.size > 0;
    if (list.length === 0) {
      status.textContent = filtering ? 'No posts match this filter.' : 'No posts yet.';
    } else {
      status.textContent = filtering ? `${list.length} post${list.length === 1 ? '' : 's'} match.` : '';
    }

    pagination.hidden = lastPage <= 1;
    pageIndicator.textContent = `Page ${state.page} of ${lastPage}`;
    prevButton.disabled = state.page <= 1;
    nextButton.disabled = state.page >= lastPage;

    for (const button of sortButtons) {
      button.setAttribute('aria-current', button.dataset.sort === state.sort ? 'page' : 'false');
    }

    syncUrl();
  }

  try {
    const response = await fetch('/blog-data.json');
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    const data = await response.json();
    allPosts = data.posts ?? [];
    pageSize = data.pageSize ?? pageSize;

    const tags = data.tags ?? [];
    if (tags.length > 0) {
      tagFilter.hidden = false;
      for (const tag of tags) {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'tag-chip';
        chip.textContent = tag;
        chip.dataset.tag = tag;
        chip.dataset.state = state.requiredTags.has(tag)
          ? 'include'
          : state.excludedTags.has(tag)
            ? 'exclude'
            : 'neutral';
        chip.setAttribute('aria-pressed', String(chip.dataset.state !== 'neutral'));
        tagFilterChips.append(chip);
      }
    }
  } catch {
    status.textContent = 'Could not load search and sorting, showing the plain list instead.';
    sortButtonGroup.hidden = true;
    fallBackToStatic();
    return;
  }

  searchInput.value = state.query;
  searchInput.disabled = false;
  for (const button of sortButtons) button.disabled = false;

  searchInput.addEventListener('input', () => {
    state.query = searchInput.value.trim();
    state.page = 1;
    render();
  });

  for (const button of sortButtons) {
    button.addEventListener('click', () => {
      state.sort = button.dataset.sort;
      state.page = 1;
      render();
    });
  }

  // each chip cycles neutral -> require -> exclude -> neutral
  tagFilterChips.addEventListener('click', (event) => {
    const chip = event.target.closest('.tag-chip');
    if (!chip) return;

    const tag = chip.dataset.tag;
    const next = { neutral: 'include', include: 'exclude', exclude: 'neutral' }[chip.dataset.state];

    chip.dataset.state = next;
    chip.setAttribute('aria-pressed', String(next !== 'neutral'));
    state.requiredTags.delete(tag);
    state.excludedTags.delete(tag);
    if (next === 'include') state.requiredTags.add(tag);
    if (next === 'exclude') state.excludedTags.add(tag);

    state.page = 1;
    render();
  });

  prevButton.addEventListener('click', () => {
    state.page = Math.max(1, state.page - 1);
    render();
  });

  nextButton.addEventListener('click', () => {
    state.page += 1;
    render();
  });

  render();
}

main();
