document.documentElement.classList.add('tag-links');

document.addEventListener('click', (event) => {
  const link = event.target.closest('a');
  if (link && !link.classList.contains('post-card-link')) return;

  const author = event.target.closest('[data-author]');
  const tag = event.target.closest('.tag');
  if (!author && !tag) return;

  event.preventDefault();
  const url = author
    ? `/blog/?author=${encodeURIComponent(author.dataset.author)}`
    : `/blog/?tag=${encodeURIComponent(tag.textContent.trim())}`;
  if (event.ctrlKey || event.metaKey) window.open(url, '_blank');
  else location.href = url;
});
